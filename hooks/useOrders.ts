'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { db, addToSyncQueue } from '@/lib/db'
import type { Order, OrderItem, CartItem } from '@/types'
import toast from 'react-hot-toast'
import { deductStokFromOrder } from '@/lib/stokAutoDeduct'

function generateNomorOrder(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = now.getTime().toString().slice(-5)
  return `ORD-${date}-${suffix}`
}

// ─── Antrian (pending + proses) ───────────────────────────────────────────────

export function useAntrian() {
  return useQuery({
    queryKey: ['orders', 'antrian'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['pending', 'proses'])
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Order[]
    },
    refetchInterval: 30_000,
  })
}

// ─── Riwayat dengan filter ────────────────────────────────────────────────────

export type RiwayatFilter = {
  periode: 'hari_ini' | 'minggu' | 'bulan' | 'semua'
  tipe: 'semua' | 'walkin' | 'whatsapp'
  search: string
}

export function useRiwayatOrders(filter: RiwayatFilter) {
  return useQuery({
    queryKey: ['orders', 'riwayat', filter],
    queryFn: async () => {
      const supabase = createClient()
      const now = new Date()

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter.tipe !== 'semua') {
        query = query.eq('tipe', filter.tipe)
      }

      const today = now.toISOString().slice(0, 10)
      if (filter.periode === 'hari_ini') {
        query = query.eq('tanggal', today)
      } else if (filter.periode === 'minggu') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
        query = query.gte('tanggal', weekAgo)
      } else if (filter.periode === 'bulan') {
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        query = query.gte('tanggal', monthStart)
      }

      const { data, error } = await query
      if (error) throw error

      let orders = (data ?? []) as Order[]
      if (filter.search) {
        const q = filter.search.toLowerCase()
        orders = orders.filter(
          (o) =>
            o.nomor_order.toLowerCase().includes(q) ||
            (o.nama_customer ?? '').toLowerCase().includes(q)
        )
      }
      return orders
    },
  })
}

// ─── Buat Order Baru ──────────────────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      tipeOrder: Order['tipe']
      namaCustomer?: string
      nomorWA?: string
      cart: CartItem[]
      catatanOrder?: string
      totalHarga: number
      metodeBayar: Order['metode_bayar']
      dibayar?: boolean
    }) => {
      const id = crypto.randomUUID()
      const nomorOrder = generateNomorOrder()
      const now = new Date()

      const itemsJson: OrderItem[] = params.cart.map((item) => ({
        id: crypto.randomUUID(),
        order_id: id,
        menu_item_id: item.menu_item_id,
        nama_item: item.nama_item,
        harga_satuan: item.harga_satuan,
        harga_modal: item.harga_modal,
        jumlah: item.jumlah,
        catatan_item: item.catatan_item,
        subtotal: item.harga_satuan * item.jumlah,
      }))

      const order: Order = {
        id,
        nomor_order: nomorOrder,
        tanggal: now.toISOString().slice(0, 10),
        waktu: now.toTimeString().slice(0, 8),
        tipe: params.tipeOrder,
        nama_customer: params.namaCustomer || undefined,
        nomor_wa: params.nomorWA || undefined,
        items_json: itemsJson,
        catatan_order: params.catatanOrder || undefined,
        total_harga: params.totalHarga,
        metode_bayar: params.metodeBayar,
        status: 'proses',
        dibayar: params.dibayar ?? true,
        created_at: now.toISOString(),
      }

      if (!navigator.onLine) {
        await db.orders.add(order)
        await addToSyncQueue('orders', 'INSERT', id, order as unknown as Record<string, unknown>)
        return order
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

      if (error) throw error
      await db.orders.put(data)
      return data as Order
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (e) => {
      console.error('Create order error:', e)
      toast.error('Gagal menyimpan order. Coba lagi.')
    },
  })
}

// ─── Update Status Order ──────────────────────────────────────────────────────

export function useUpdateOrderStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      alasanBatal,
      order,
    }: {
      id: string
      status: Order['status']
      alasanBatal?: string
      order?: Order
    }) => {
      const updates: Record<string, unknown> = { status }
      if (alasanBatal) updates.alasan_batal = alasanBatal

      const supabase = createClient()
      const { error } = await supabase.from('orders').update(updates).eq('id', id)
      if (error) throw error
      await db.orders.update(id, updates as Partial<Order>)

      if (status === 'selesai' && order) {
        await deductStokFromOrder(order.items_json, order.nomor_order)
      }
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['bahan_baku'] })
      if (status === 'selesai') toast.success('Order selesai! 🎉')
      else if (status === 'batal') toast.success('Order dibatalkan')
      else toast.success('Status diperbarui')
    },
    onError: () => toast.error('Gagal memperbarui status'),
  })
}

// ─── Selesaikan + Terima Bayaran (untuk COD) ──────────────────────────────────

export function useSelesaikanDanBayar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      order,
      metodeBayar,
    }: {
      order: Order
      metodeBayar: Order['metode_bayar']
    }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ status: 'selesai', dibayar: true, metode_bayar: metodeBayar })
        .eq('id', order.id)
      if (error) throw error
      await db.orders.update(order.id, { status: 'selesai', dibayar: true, metode_bayar: metodeBayar })
      await deductStokFromOrder(order.items_json, order.nomor_order)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['bahan_baku'] })
      toast.success('Pembayaran diterima! Order selesai 🎉')
    },
    onError: () => toast.error('Gagal memperbarui pembayaran'),
  })
}

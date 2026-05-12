'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'
import type { Pengeluaran, KategoriPengeluaran, PemasukanLain } from '@/types'
import toast from 'react-hot-toast'

export const PENGELUARAN_QUERY_KEY = ['pengeluaran']

export type PeriodePengeluaran = 'hari_ini' | 'minggu' | 'bulan' | 'semua'

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDateRange(periode: PeriodePengeluaran): { from: string; to: string } | null {
  const now = new Date()
  const today = localDate(now)
  if (periode === 'hari_ini') return { from: today, to: today }
  if (periode === 'minggu') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return { from: localDate(d), to: today }
  }
  if (periode === 'bulan') {
    return { from: `${today.slice(0, 7)}-01`, to: today }
  }
  return null
}

async function fetchPengeluaran(periode: PeriodePengeluaran, kategori?: KategoriPengeluaran): Promise<Pengeluaran[]> {
  try {
    const supabase = createClient()
    let q = supabase.from('pengeluaran').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false })

    const range = getDateRange(periode)
    if (range) q = q.gte('tanggal', range.from).lte('tanggal', range.to)
    if (kategori) q = q.eq('kategori', kategori)

    const { data, error } = await q
    if (error) throw error
    if (data && data.length > 0) await db.pengeluaran.bulkPut(data)
    return data ?? []
  } catch {
    let query = db.pengeluaran.orderBy('tanggal').reverse()
    const all = await query.toArray()
    const range = getDateRange(periode)
    return all.filter((p) => {
      if (range && (p.tanggal < range.from || p.tanggal > range.to)) return false
      if (kategori && p.kategori !== kategori) return false
      return true
    })
  }
}

export function usePengeluaran(periode: PeriodePengeluaran, kategori?: KategoriPengeluaran) {
  return useQuery({
    queryKey: [...PENGELUARAN_QUERY_KEY, periode, kategori],
    queryFn: () => fetchPengeluaran(periode, kategori),
  })
}

export function useCreatePengeluaran() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Pengeluaran, 'id' | 'created_at'>) => {
      const id = crypto.randomUUID()
      const item: Pengeluaran = { ...data, id, created_at: new Date().toISOString() }
      const supabase = createClient()
      const { error } = await supabase.from('pengeluaran').insert(item)
      if (error) throw error
      await db.pengeluaran.add(item)
      return item
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENGELUARAN_QUERY_KEY })
      toast.success('Pengeluaran dicatat!')
    },
    onError: () => toast.error('Gagal mencatat pengeluaran'),
  })
}

export function useUpdatePengeluaran() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Pengeluaran> & { id: string }) => {
      const supabase = createClient()
      const { data: updated, error } = await supabase
        .from('pengeluaran').update(data).eq('id', id).select().single()
      if (error) throw error
      await db.pengeluaran.put(updated)
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENGELUARAN_QUERY_KEY })
      toast.success('Pengeluaran diperbarui!')
    },
    onError: () => toast.error('Gagal memperbarui pengeluaran'),
  })
}

export function useDeletePengeluaran() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('pengeluaran').delete().eq('id', id)
      if (error) throw error
      await db.pengeluaran.delete(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PENGELUARAN_QUERY_KEY })
      toast.success('Pengeluaran dihapus')
    },
    onError: () => toast.error('Gagal menghapus pengeluaran'),
  })
}

// Rekap harian: ambil omzet dari orders + pengeluaran + pemasukan lain
export function useRekapHarian(tanggal: string) {
  return useQuery({
    queryKey: ['rekap_harian', tanggal],
    queryFn: async () => {
      const supabase = createClient()
      const [ordersRes, pengeluaranRes, pemasukanRes] = await Promise.all([
        supabase
          .from('orders')
          .select('total_harga, metode_bayar, status, items_json')
          .eq('tanggal', tanggal)
          .eq('status', 'selesai'),
        supabase
          .from('pengeluaran')
          .select('jumlah, kategori')
          .eq('tanggal', tanggal),
        supabase
          .from('pemasukan_lain')
          .select('jumlah, keterangan')
          .eq('tanggal', tanggal),
      ])

      const orders = ordersRes.data ?? []
      const pengeluaranList = pengeluaranRes.data ?? []
      const pemasukanLainList = pemasukanRes.data ?? []

      const omzet = orders.reduce((s, o) => s + o.total_harga, 0)
      const totalOrder = orders.length
      const cash = orders.filter((o) => o.metode_bayar === 'cash').reduce((s, o) => s + o.total_harga, 0)
      const transfer = orders.filter((o) => o.metode_bayar === 'transfer').reduce((s, o) => s + o.total_harga, 0)
      const qris = orders.filter((o) => o.metode_bayar === 'qris').reduce((s, o) => s + o.total_harga, 0)

      const hpp = orders.reduce((s, o) => {
        const items = o.items_json as Array<{ jumlah: number; harga_modal: number }>
        return s + items.reduce((ss, i) => ss + i.jumlah * (i.harga_modal || 0), 0)
      }, 0)

      const totalPemasukanLain = pemasukanLainList.reduce((s, p) => s + p.jumlah, 0)
      const totalPengeluaran = pengeluaranList.reduce((s, p) => s + p.jumlah, 0)
      const labaKotor = omzet - hpp
      const labaBersih = labaKotor + totalPemasukanLain - totalPengeluaran

      const byKategori: Record<string, number> = {}
      pengeluaranList.forEach((p) => {
        byKategori[p.kategori] = (byKategori[p.kategori] ?? 0) + p.jumlah
      })

      return {
        tanggal, omzet, totalOrder, cash, transfer, qris,
        hpp, labaKotor, totalPengeluaran, totalPemasukanLain, labaBersih, byKategori,
      }
    },
    staleTime: 1000 * 60,
  })
}

// ─── Pemasukan Lain ──────────────────────────────────────────────────────────

export const PEMASUKAN_LAIN_QUERY_KEY = ['pemasukan_lain']

export function usePemasukanLain(tanggal?: string) {
  return useQuery({
    queryKey: [...PEMASUKAN_LAIN_QUERY_KEY, tanggal],
    queryFn: async (): Promise<PemasukanLain[]> => {
      try {
        const supabase = createClient()
        let q = supabase.from('pemasukan_lain').select('*').order('tanggal', { ascending: false }).order('created_at', { ascending: false })
        if (tanggal) q = q.eq('tanggal', tanggal)
        const { data, error } = await q
        if (error) throw error
        if (data && data.length > 0) await db.pemasukan_lain.bulkPut(data)
        return data ?? []
      } catch {
        let query = db.pemasukan_lain.orderBy('tanggal').reverse()
        const all = await query.toArray()
        return tanggal ? all.filter((p) => p.tanggal === tanggal) : all
      }
    },
  })
}

export function useCreatePemasukanLain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: { tanggal: string; keterangan: string; jumlah: number }) => {
      const supabase = createClient()
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const record: PemasukanLain = { id, ...data, created_at: now }
      const { error } = await supabase.from('pemasukan_lain').insert(record)
      if (error) throw error
      await db.pemasukan_lain.put(record)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PEMASUKAN_LAIN_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['rekap_harian'] })
      toast.success('Pemasukan lain tercatat!')
    },
    onError: () => toast.error('Gagal menyimpan pemasukan'),
  })
}

export function useDeletePemasukanLain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('pemasukan_lain').delete().eq('id', id)
      if (error) throw error
      await db.pemasukan_lain.delete(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PEMASUKAN_LAIN_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['rekap_harian'] })
      toast.success('Pemasukan dihapus')
    },
    onError: () => toast.error('Gagal menghapus'),
  })
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'
import type { OrderItem, BahanBaku } from '@/types'
import toast from 'react-hot-toast'

export interface DeductResult {
  berhasil: boolean
  lowStockItems: BahanBaku[]
  errorItems: string[]
}

// Minta izin browser notification
export async function requestNotifPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// Kirim browser notification untuk stok rendah
function sendLowStockNotif(items: BahanBaku[]) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  items.forEach((item) => {
    const msg = item.stok_sekarang === 0
      ? `${item.nama} HABIS! Segera restock.`
      : `${item.nama} tinggal ${item.stok_sekarang} ${item.satuan} (min: ${item.stok_minimum})`

    new Notification('⚠️ Stok Hampir Habis — SushiKu', {
      body: msg,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `stok-${item.id}`,
    })
  })
}

// Fungsi utama: deduct stok berdasarkan order yang selesai
export async function deductStokFromOrder(
  orderItems: OrderItem[],
  nomorOrder: string
): Promise<DeductResult> {
  const supabase = createClient()
  const lowStockItems: BahanBaku[] = []
  const errorItems: string[] = []

  // 1. Ambil semua resep untuk menu item yang ada di order ini
  const menuItemIds = Array.from(new Set(orderItems.map((i) => i.menu_item_id)))

  let resepList: Array<{ menu_item_id: string; bahan_baku_id: string; jumlah_pakai: number }> = []

  try {
    const { data, error } = await supabase
      .from('resep')
      .select('menu_item_id, bahan_baku_id, jumlah_pakai')
      .in('menu_item_id', menuItemIds)

    if (!error && data) {
      resepList = data
    } else {
      // Fallback ke local DB
      const localResep = await db.resep
        .where('menu_item_id').anyOf(menuItemIds)
        .toArray()
      resepList = localResep
    }
  } catch {
    const localResep = await db.resep
      .where('menu_item_id').anyOf(menuItemIds)
      .toArray()
    resepList = localResep
  }

  if (resepList.length === 0) return { berhasil: true, lowStockItems: [], errorItems: [] }

  // 2. Hitung total kebutuhan per bahan baku
  const kebutuhan: Record<string, number> = {}
  for (const orderItem of orderItems) {
    const resepUntukMenu = resepList.filter((r) => r.menu_item_id === orderItem.menu_item_id)
    for (const resep of resepUntukMenu) {
      kebutuhan[resep.bahan_baku_id] = (kebutuhan[resep.bahan_baku_id] ?? 0) + resep.jumlah_pakai * orderItem.jumlah
    }
  }

  if (Object.keys(kebutuhan).length === 0) return { berhasil: true, lowStockItems: [], errorItems: [] }

  // 3. Ambil data stok bahan baku terkini
  const bahanIds = Object.keys(kebutuhan)
  const { data: bahanList } = await supabase
    .from('bahan_baku')
    .select('*')
    .in('id', bahanIds)

  if (!bahanList || bahanList.length === 0) return { berhasil: true, lowStockItems: [], errorItems: [] }

  // 4. Deduct satu per satu
  const now = new Date().toISOString()
  for (const bahan of bahanList as BahanBaku[]) {
    const jumlahKurang = kebutuhan[bahan.id] ?? 0
    if (jumlahKurang === 0) continue

    const stokBaru = Math.max(0, bahan.stok_sekarang - jumlahKurang)

    try {
      // Update stok di Supabase
      const { error: updateErr } = await supabase
        .from('bahan_baku')
        .update({ stok_sekarang: stokBaru, updated_at: now })
        .eq('id', bahan.id)

      if (updateErr) throw updateErr

      // Log stok keluar
      const logId = crypto.randomUUID()
      await supabase.from('stok_log').insert({
        id: logId,
        bahan_baku_id: bahan.id,
        jenis: 'keluar',
        jumlah: jumlahKurang,
        keterangan: `Auto: Order #${nomorOrder}`,
        created_at: now,
      })

      // Update local cache
      await db.bahan_baku.update(bahan.id, { stok_sekarang: stokBaru, updated_at: now })
      await db.stok_log.put({
        id: logId,
        bahan_baku_id: bahan.id,
        jenis: 'keluar',
        jumlah: jumlahKurang,
        keterangan: `Auto: Order #${nomorOrder}`,
        created_at: now,
      })

      // Cek apakah stok rendah
      if (stokBaru <= bahan.stok_minimum) {
        lowStockItems.push({ ...bahan, stok_sekarang: stokBaru })
      }
    } catch {
      errorItems.push(bahan.nama)
    }
  }

  // 5. Notifikasi kalau ada stok rendah
  if (lowStockItems.length > 0) {
    // Toast in-app
    const habis = lowStockItems.filter((b) => b.stok_sekarang === 0)
    const hampirHabis = lowStockItems.filter((b) => b.stok_sekarang > 0)

    if (habis.length > 0) {
      toast.error(
        `🚨 ${habis.map((b) => b.nama).join(', ')} HABIS!`,
        { duration: 6000, id: 'stok-habis' }
      )
    }
    if (hampirHabis.length > 0) {
      toast(
        `⚠️ Stok hampir habis: ${hampirHabis.map((b) => `${b.nama} (${b.stok_sekarang} ${b.satuan})`).join(', ')}`,
        { duration: 5000, icon: '📦', id: 'stok-rendah' }
      )
    }

    // Browser notification
    sendLowStockNotif(lowStockItems)
  }

  return { berhasil: errorItems.length === 0, lowStockItems, errorItems }
}

'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type PeriodeLaporan = 'minggu' | 'bulan' | 'bulan_lalu' | '3_bulan'

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getRange(periode: PeriodeLaporan): { from: string; to: string } {
  const now = new Date()
  const today = localDate(now)

  if (periode === 'minggu') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    return { from: localDate(d), to: today }
  }
  if (periode === 'bulan') {
    return { from: `${today.slice(0, 7)}-01`, to: today }
  }
  if (periode === 'bulan_lalu') {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const lastDay = new Date(y, d.getMonth() + 1, 0).getDate()
    return { from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` }
  }
  // 3 bulan
  const d = new Date(now)
  d.setMonth(d.getMonth() - 3)
  return { from: localDate(d), to: today }
}

export function useLaporanOmzet(periode: PeriodeLaporan) {
  return useQuery({
    queryKey: ['laporan_omzet', periode],
    queryFn: async () => {
      const { from, to } = getRange(periode)
      const supabase = createClient()

      const { data: orders } = await supabase
        .from('orders')
        .select('tanggal, total_harga, metode_bayar, status, items_json')
        .gte('tanggal', from)
        .lte('tanggal', to)
        .eq('status', 'selesai')

      const { data: pengeluaran } = await supabase
        .from('pengeluaran')
        .select('tanggal, jumlah, kategori')
        .gte('tanggal', from)
        .lte('tanggal', to)

      const ordersData = orders ?? []
      const pengeluaranData = pengeluaran ?? []

      // Group by tanggal
      const byDate: Record<string, { omzet: number; hpp: number; pengeluaran: number; order: number }> = {}

      ordersData.forEach((o) => {
        if (!byDate[o.tanggal]) byDate[o.tanggal] = { omzet: 0, hpp: 0, pengeluaran: 0, order: 0 }
        byDate[o.tanggal].omzet += o.total_harga
        byDate[o.tanggal].order += 1
        const items = o.items_json as Array<{ jumlah: number; harga_modal: number }>
        byDate[o.tanggal].hpp += items.reduce((s, i) => s + i.jumlah * (i.harga_modal || 0), 0)
      })

      pengeluaranData.forEach((p) => {
        if (!byDate[p.tanggal]) byDate[p.tanggal] = { omzet: 0, hpp: 0, pengeluaran: 0, order: 0 }
        byDate[p.tanggal].pengeluaran += p.jumlah
      })

      // Fill all dates in range
      const chartData: Array<{ tanggal: string; label: string; omzet: number; laba: number; order: number }> = []
      const cur = new Date(from + 'T00:00:00')
      const end = new Date(to + 'T00:00:00')
      while (cur <= end) {
        const tgl = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
        const d = byDate[tgl] ?? { omzet: 0, hpp: 0, pengeluaran: 0, order: 0 }
        chartData.push({
          tanggal: tgl,
          label: cur.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          omzet: d.omzet,
          laba: d.omzet - d.hpp - d.pengeluaran,
          order: d.order,
        })
        cur.setDate(cur.getDate() + 1)
      }

      // Totals
      const totalOmzet = ordersData.reduce((s, o) => s + o.total_harga, 0)
      const totalOrder = ordersData.length
      const totalHPP = ordersData.reduce((s, o) => {
        const items = o.items_json as Array<{ jumlah: number; harga_modal: number }>
        return s + items.reduce((ss, i) => ss + i.jumlah * (i.harga_modal || 0), 0)
      }, 0)
      const totalPengeluaran = pengeluaranData.reduce((s, p) => s + p.jumlah, 0)
      const labaKotor = totalOmzet - totalHPP
      const labaBersih = labaKotor - totalPengeluaran
      const avgPerOrder = totalOrder > 0 ? totalOmzet / totalOrder : 0

      const byMetode = {
        cash: ordersData.filter((o) => o.metode_bayar === 'cash').reduce((s, o) => s + o.total_harga, 0),
        transfer: ordersData.filter((o) => o.metode_bayar === 'transfer').reduce((s, o) => s + o.total_harga, 0),
        qris: ordersData.filter((o) => o.metode_bayar === 'qris').reduce((s, o) => s + o.total_harga, 0),
      }

      return { chartData, totalOmzet, totalOrder, totalHPP, totalPengeluaran, labaKotor, labaBersih, avgPerOrder, byMetode, from, to }
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useLaporanMenu(periode: PeriodeLaporan) {
  return useQuery({
    queryKey: ['laporan_menu', periode],
    queryFn: async () => {
      const { from, to } = getRange(periode)
      const supabase = createClient()

      const { data: orders } = await supabase
        .from('orders')
        .select('items_json')
        .gte('tanggal', from)
        .lte('tanggal', to)
        .eq('status', 'selesai')

      const countMap: Record<string, { nama: string; qty: number; omzet: number }> = {}
      ;(orders ?? []).forEach((o) => {
        const items = o.items_json as Array<{ menu_item_id: string; nama_item: string; jumlah: number; harga_satuan: number }>
        items.forEach((i) => {
          if (!countMap[i.menu_item_id]) {
            countMap[i.menu_item_id] = { nama: i.nama_item, qty: 0, omzet: 0 }
          }
          countMap[i.menu_item_id].qty += i.jumlah
          countMap[i.menu_item_id].omzet += i.jumlah * i.harga_satuan
        })
      })

      return Object.values(countMap)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10)
    },
    staleTime: 1000 * 60 * 5,
  })
}

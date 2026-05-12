'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { THRESHOLD_PELANGGAN } from '@/constants'
import type { LabelPelanggan } from '@/types'

export interface PelangganSummary {
  key: string
  nama: string
  nomor_wa?: string
  total_order: number
  total_belanja: number
  last_order: string
  label: LabelPelanggan
  orders: Array<{
    nomor_order: string
    tanggal: string
    total_harga: number
    items_json: Array<{ nama_item: string; jumlah: number }>
  }>
}

function getLabel(totalOrder: number, totalBelanja: number): LabelPelanggan {
  if (totalOrder >= THRESHOLD_PELANGGAN.vip.minOrder || totalBelanja >= THRESHOLD_PELANGGAN.vip.minBelanja) return 'vip'
  if (totalOrder >= THRESHOLD_PELANGGAN.regular.minOrder) return 'regular'
  return 'baru'
}

export function usePelanggan() {
  return useQuery({
    queryKey: ['pelanggan'],
    queryFn: async (): Promise<PelangganSummary[]> => {
      const supabase = createClient()
      const { data: orders } = await supabase
        .from('orders')
        .select('nomor_order, nama_customer, nomor_wa, total_harga, tanggal, items_json')
        .eq('status', 'selesai')
        .not('nama_customer', 'is', null)
        .order('tanggal', { ascending: false })

      const map: Record<string, PelangganSummary> = {}

      ;(orders ?? []).forEach((o) => {
        const wa = o.nomor_wa?.trim()
        const nama = o.nama_customer?.trim()
        const key = wa ? `wa:${wa}` : nama ? `nama:${nama}` : ''
        if (!key) return

        if (!map[key]) {
          map[key] = {
            key,
            nama: o.nama_customer ?? '',
            nomor_wa: o.nomor_wa?.trim() || undefined,
            total_order: 0,
            total_belanja: 0,
            last_order: o.tanggal,
            label: 'baru',
            orders: [],
          }
        }
        map[key].total_order += 1
        map[key].total_belanja += o.total_harga
        if (o.tanggal > map[key].last_order) map[key].last_order = o.tanggal
        map[key].orders.push({
          nomor_order: o.nomor_order,
          tanggal: o.tanggal,
          total_harga: o.total_harga,
          items_json: o.items_json as Array<{ nama_item: string; jumlah: number }>,
        })
      })

      return Object.values(map)
        .map((p) => ({ ...p, label: getLabel(p.total_order, p.total_belanja) }))
        .sort((a, b) => b.total_belanja - a.total_belanja)
    },
    staleTime: 1000 * 60 * 5,
  })
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'
import type { Resep, BahanBaku } from '@/types'
import toast from 'react-hot-toast'

export const RESEP_QUERY_KEY = (menuItemId: string) => ['resep', menuItemId]

export interface ResepWithBahan extends Resep {
  bahan_baku: BahanBaku
}

export function useResep(menuItemId: string) {
  return useQuery({
    queryKey: RESEP_QUERY_KEY(menuItemId),
    queryFn: async (): Promise<ResepWithBahan[]> => {
      if (!menuItemId) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('resep')
        .select('*, bahan_baku(*)')
        .eq('menu_item_id', menuItemId)
        .order('created_at')

      if (error) {
        // Fallback local
        const localResep = await db.resep
          .where('menu_item_id').equals(menuItemId).toArray()
        const bahanIds = localResep.map((r) => r.bahan_baku_id)
        const bahanList = await db.bahan_baku.where('id').anyOf(bahanIds).toArray()
        const bahanMap = Object.fromEntries(bahanList.map((b) => [b.id, b]))
        return localResep
          .filter((r) => bahanMap[r.bahan_baku_id])
          .map((r) => ({ ...r, bahan_baku: bahanMap[r.bahan_baku_id] }))
      }

      return (data ?? []) as ResepWithBahan[]
    },
    enabled: !!menuItemId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useAddResep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      menuItemId,
      bahanBakuId,
      jumlahPakai,
    }: {
      menuItemId: string
      bahanBakuId: string
      jumlahPakai: number
    }) => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const resep: Resep = {
        id,
        menu_item_id: menuItemId,
        bahan_baku_id: bahanBakuId,
        jumlah_pakai: jumlahPakai,
        created_at: now,
      }
      const supabase = createClient()
      const { error } = await supabase.from('resep').insert(resep)
      if (error) throw error
      await db.resep.put(resep)
      return resep
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: RESEP_QUERY_KEY(vars.menuItemId) })
      toast.success('Bahan ditambahkan ke resep!')
    },
    onError: () => toast.error('Gagal menambahkan bahan'),
  })
}

export function useUpdateResep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, menuItemId, jumlahPakai }: { id: string; menuItemId: string; jumlahPakai: number }) => {
      const supabase = createClient()
      const { error } = await supabase.from('resep').update({ jumlah_pakai: jumlahPakai }).eq('id', id)
      if (error) throw error
      await db.resep.update(id, { jumlah_pakai: jumlahPakai })
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: RESEP_QUERY_KEY(vars.menuItemId) })
    },
    onError: () => toast.error('Gagal update jumlah'),
  })
}

export function useDeleteResep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, menuItemId }: { id: string; menuItemId: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('resep').delete().eq('id', id)
      if (error) throw error
      await db.resep.delete(id)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: RESEP_QUERY_KEY(vars.menuItemId) })
      toast.success('Bahan dihapus dari resep')
    },
    onError: () => toast.error('Gagal menghapus bahan'),
  })
}

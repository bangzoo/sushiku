'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { db, addToSyncQueue } from '@/lib/db'
import type { BahanBaku, StokLog, JenisStokLog } from '@/types'
import toast from 'react-hot-toast'

export const STOK_QUERY_KEY = ['bahan_baku']
export const STOK_LOG_KEY = (id: string) => ['stok_log', id]

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchBahanBaku(): Promise<BahanBaku[]> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return db.bahan_baku.orderBy('nama').toArray()
    }
    const supabase = createClient()
    const { data, error } = await supabase
      .from('bahan_baku')
      .select('*')
      .order('nama', { ascending: true })
    if (error) throw error
    if (data && data.length > 0) await db.bahan_baku.bulkPut(data)
    return data ?? []
  } catch {
    return db.bahan_baku.orderBy('nama').toArray()
  }
}

async function fetchStokLog(bahanId: string): Promise<StokLog[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('stok_log')
      .select('*')
      .eq('bahan_baku_id', bahanId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return data ?? []
  } catch {
    return db.stok_log
      .where('bahan_baku_id').equals(bahanId)
      .sortBy('created_at')
      .then((arr) => arr.reverse())
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBahanBaku() {
  return useQuery({
    queryKey: STOK_QUERY_KEY,
    queryFn: fetchBahanBaku,
    staleTime: 1000 * 60 * 2,
  })
}

export function useStokLog(bahanId: string) {
  return useQuery({
    queryKey: STOK_LOG_KEY(bahanId),
    queryFn: () => fetchStokLog(bahanId),
    enabled: !!bahanId,
  })
}

export function useCreateBahanBaku() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<BahanBaku, 'id' | 'created_at' | 'updated_at'>) => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const item: BahanBaku = { ...data, id, created_at: now, updated_at: now }

      if (!navigator.onLine) {
        await db.bahan_baku.add(item)
        await addToSyncQueue('bahan_baku', 'INSERT', id, item as unknown as Record<string, unknown>)
        return item
      }

      const supabase = createClient()
      const { data: created, error } = await supabase
        .from('bahan_baku').insert(item).select().single()
      if (error) throw error
      await db.bahan_baku.put(created)
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOK_QUERY_KEY })
      toast.success('Bahan baku berhasil ditambahkan!')
    },
    onError: () => toast.error('Gagal menambahkan bahan baku'),
  })
}

export function useUpdateBahanBaku() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BahanBaku> & { id: string }) => {
      const now = new Date().toISOString()
      const updated = { id, ...data, updated_at: now }

      if (!navigator.onLine) {
        await db.bahan_baku.update(id, { ...data, updated_at: now })
        await addToSyncQueue('bahan_baku', 'UPDATE', id, updated as unknown as Record<string, unknown>)
        return updated
      }

      const supabase = createClient()
      const { data: result, error } = await supabase
        .from('bahan_baku').update({ ...data, updated_at: now }).eq('id', id).select().single()
      if (error) throw error
      await db.bahan_baku.put(result)
      return result
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOK_QUERY_KEY })
      toast.success('Bahan baku berhasil diperbarui!')
    },
    onError: () => toast.error('Gagal memperbarui bahan baku'),
  })
}

export function useDeleteBahanBaku() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('bahan_baku').delete().eq('id', id)
      if (error) throw error
      await db.bahan_baku.delete(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOK_QUERY_KEY })
      toast.success('Bahan baku dihapus')
    },
    onError: () => toast.error('Gagal menghapus bahan baku'),
  })
}

export function useAddStokLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      bahanId,
      jenis,
      jumlah,
      keterangan,
      hargaTotal,
      stokSekarang,
    }: {
      bahanId: string
      jenis: JenisStokLog
      jumlah: number
      keterangan?: string
      hargaTotal?: number
      stokSekarang: number
    }) => {
      const logId = crypto.randomUUID()
      const now = new Date().toISOString()

      // Calculate new stok
      let newStok = stokSekarang
      if (jenis === 'masuk') newStok += jumlah
      else if (jenis === 'keluar') newStok -= jumlah
      else if (jenis === 'koreksi') newStok = jumlah

      if (newStok < 0) throw new Error('Stok tidak bisa negatif')

      const supabase = createClient()

      // Insert log
      const logEntry: Omit<StokLog, 'id'> & { id: string } = {
        id: logId,
        bahan_baku_id: bahanId,
        jenis,
        jumlah,
        keterangan,
        harga_total: hargaTotal,
        created_at: now,
      }
      const { error: logError } = await supabase.from('stok_log').insert(logEntry)
      if (logError) throw logError

      // Update stok_sekarang
      const { error: updateError } = await supabase
        .from('bahan_baku')
        .update({ stok_sekarang: newStok, updated_at: now })
        .eq('id', bahanId)
      if (updateError) throw updateError

      // Update local cache
      await db.stok_log.put(logEntry)
      await db.bahan_baku.update(bahanId, { stok_sekarang: newStok, updated_at: now })

      return { newStok, logEntry }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: STOK_QUERY_KEY })
      qc.invalidateQueries({ queryKey: STOK_LOG_KEY(vars.bahanId) })
      toast.success('Stok berhasil dicatat!')
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Gagal mencatat stok'
      toast.error(msg)
    },
  })
}

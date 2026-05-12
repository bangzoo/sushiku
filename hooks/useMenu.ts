'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { db, addToSyncQueue } from '@/lib/db'
import type { MenuItem } from '@/types'
import toast from 'react-hot-toast'

export const MENU_QUERY_KEY = ['menu_items']

async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return db.menu_items.orderBy('urutan_tampil').toArray()
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .is('deleted_at', null)
      .order('urutan_tampil', { ascending: true })

    if (error) throw error

    if (data && data.length > 0) {
      await db.menu_items.bulkPut(data)
    }

    return data ?? []
  } catch {
    return db.menu_items.orderBy('urutan_tampil').toArray()
  }
}

export function useMenuItems() {
  return useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: fetchMenuItems,
  })
}

export function useCreateMenuItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<MenuItem, 'id' | 'created_at'>) => {
      const id = crypto.randomUUID()
      const item: MenuItem = { ...data, id, created_at: new Date().toISOString() }

      if (!navigator.onLine) {
        await db.menu_items.add(item)
        await addToSyncQueue('menu_items', 'INSERT', id, item as unknown as Record<string, unknown>)
        return item
      }

      const supabase = createClient()
      const { data: created, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      await db.menu_items.put(created)
      return created
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MENU_QUERY_KEY })
      toast.success('Menu berhasil ditambahkan!')
    },
    onError: () => {
      toast.error('Gagal menambahkan menu')
    },
  })
}

export function useUpdateMenuItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<MenuItem> & { id: string }) => {
      if (!navigator.onLine) {
        await db.menu_items.update(id, data)
        await addToSyncQueue('menu_items', 'UPDATE', id, { id, ...data } as unknown as Record<string, unknown>)
        return { id, ...data }
      }

      const supabase = createClient()
      const { data: updated, error } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await db.menu_items.put(updated)
      return updated
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MENU_QUERY_KEY })
      toast.success('Menu berhasil diperbarui!')
    },
    onError: () => {
      toast.error('Gagal memperbarui menu')
    },
  })
}

export function useToggleMenuAvailability() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, tersedia }: { id: string; tersedia: boolean }) => {
      if (!navigator.onLine) {
        await db.menu_items.update(id, { tersedia })
        await addToSyncQueue('menu_items', 'UPDATE', id, { id, tersedia })
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('menu_items')
        .update({ tersedia })
        .eq('id', id)

      if (error) throw error
      await db.menu_items.update(id, { tersedia })
    },
    onMutate: async ({ id, tersedia }) => {
      await qc.cancelQueries({ queryKey: MENU_QUERY_KEY })
      const prev = qc.getQueryData<MenuItem[]>(MENU_QUERY_KEY)
      qc.setQueryData<MenuItem[]>(MENU_QUERY_KEY, (old) =>
        old?.map((item) => (item.id === id ? { ...item, tersedia } : item)) ?? []
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(MENU_QUERY_KEY, ctx.prev)
      toast.error('Gagal mengubah status menu')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useDeleteMenuItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const deletedAt = new Date().toISOString()

      if (!navigator.onLine) {
        await db.menu_items.delete(id)
        await addToSyncQueue('menu_items', 'UPDATE', id, { id, deleted_at: deletedAt })
        return
      }

      const supabase = createClient()
      const { error } = await supabase
        .from('menu_items')
        .update({ deleted_at: deletedAt })
        .eq('id', id)

      if (error) throw error
      await db.menu_items.delete(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MENU_QUERY_KEY })
      toast.success('Menu dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus menu')
    },
  })
}

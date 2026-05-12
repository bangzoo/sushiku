'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { BisnisSettings } from '@/types'
import toast from 'react-hot-toast'

export function useBisnisSettings() {
  return useQuery({
    queryKey: ['bisnis_settings'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bisnis_settings')
        .select('*')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return (data ?? null) as BisnisSettings | null
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<BisnisSettings>) => {
      const supabase = createClient()
      const existing = await supabase.from('bisnis_settings').select('id').limit(1).maybeSingle()
      if (existing.data?.id) {
        const { error } = await supabase
          .from('bisnis_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', existing.data.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bisnis_settings')
          .insert({ ...updates, updated_at: new Date().toISOString() })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bisnis_settings'] })
      toast.success('Pengaturan tersimpan!')
    },
    onError: () => toast.error('Gagal menyimpan pengaturan'),
  })
}

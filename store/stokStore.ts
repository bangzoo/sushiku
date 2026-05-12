import { create } from 'zustand'
import type { BahanBaku } from '@/types'

interface StokStore {
  isFormOpen: boolean
  editingItem: BahanBaku | null
  isLogOpen: boolean
  selectedBahan: BahanBaku | null

  openForm: (item?: BahanBaku) => void
  closeForm: () => void
  openLog: (item: BahanBaku) => void
  closeLog: () => void
}

export const useStokStore = create<StokStore>((set) => ({
  isFormOpen: false,
  editingItem: null,
  isLogOpen: false,
  selectedBahan: null,

  openForm: (item) => set({ isFormOpen: true, editingItem: item ?? null }),
  closeForm: () => set({ isFormOpen: false, editingItem: null }),
  openLog: (item) => set({ isLogOpen: true, selectedBahan: item }),
  closeLog: () => set({ isLogOpen: false, selectedBahan: null }),
}))

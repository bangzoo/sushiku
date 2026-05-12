import { create } from 'zustand'
import type { MenuItem } from '@/types'

interface MenuStore {
  isFormOpen: boolean
  editingItem: MenuItem | null
  isDetailOpen: boolean
  selectedItem: MenuItem | null
  openForm: (item?: MenuItem) => void
  closeForm: () => void
  openDetail: (item: MenuItem) => void
  closeDetail: () => void
}

export const useMenuStore = create<MenuStore>((set) => ({
  isFormOpen: false,
  editingItem: null,
  isDetailOpen: false,
  selectedItem: null,
  openForm: (item) => set({ isFormOpen: true, editingItem: item ?? null }),
  closeForm: () => set({ isFormOpen: false, editingItem: null }),
  openDetail: (item) => set({ isDetailOpen: true, selectedItem: item }),
  closeDetail: () => set({ isDetailOpen: false, selectedItem: null }),
}))

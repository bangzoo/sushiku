import { create } from 'zustand'
import type { CartItem, TipeOrder, MetodeBayar, Order } from '@/types'

interface KasirStore {
  tipeOrder: TipeOrder | null
  namaCustomer: string
  nomorWA: string
  cart: CartItem[]
  catatanOrder: string
  metodeBayar: MetodeBayar
  uangDiterima: number
  completedOrder: Order | null

  isKeranjangOpen: boolean
  isBayarOpen: boolean
  isStrukOpen: boolean
  isTipeModalOpen: boolean

  setTipeOrder: (tipe: TipeOrder, nama?: string, wa?: string) => void
  addToCart: (item: Omit<CartItem, 'jumlah' | 'catatan_item'>) => void
  removeFromCart: (menuItemId: string) => void
  updateQty: (menuItemId: string, delta: number) => void
  setQty: (menuItemId: string, qty: number) => void
  setCatatanItem: (menuItemId: string, catatan: string) => void
  setNamaCustomer: (nama: string) => void
  setNomorWA: (wa: string) => void
  setCatatanOrder: (catatan: string) => void
  setMetodeBayar: (metode: MetodeBayar) => void
  setUangDiterima: (jumlah: number) => void
  setCompletedOrder: (order: Order) => void

  openKeranjang: () => void
  closeKeranjang: () => void
  openBayar: () => void
  closeBayar: () => void
  openStruk: () => void
  openTipeModal: () => void
  closeTipeModal: () => void
  resetKasir: () => void

  totalHarga: () => number
  totalItem: () => number
  kembalian: () => number
}

export const useKasirStore = create<KasirStore>((set, get) => ({
  tipeOrder: null,
  namaCustomer: '',
  nomorWA: '',
  cart: [],
  catatanOrder: '',
  metodeBayar: 'cash',
  uangDiterima: 0,
  completedOrder: null,

  isKeranjangOpen: false,
  isBayarOpen: false,
  isStrukOpen: false,
  isTipeModalOpen: false,

  setTipeOrder: (tipe, nama = '', wa = '') =>
    set({ tipeOrder: tipe, namaCustomer: nama, nomorWA: wa, isTipeModalOpen: false }),

  addToCart: (newItem) =>
    set((state) => {
      const existing = state.cart.find((i) => i.menu_item_id === newItem.menu_item_id)
      const tipeOrder = state.tipeOrder ?? 'walkin'
      if (existing) {
        return {
          tipeOrder,
          cart: state.cart.map((i) =>
            i.menu_item_id === newItem.menu_item_id ? { ...i, jumlah: i.jumlah + 1 } : i
          ),
        }
      }
      return { tipeOrder, cart: [...state.cart, { ...newItem, jumlah: 1 }] }
    }),

  removeFromCart: (menuItemId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.menu_item_id !== menuItemId) })),

  updateQty: (menuItemId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((i) =>
          i.menu_item_id === menuItemId ? { ...i, jumlah: Math.max(0, i.jumlah + delta) } : i
        )
        .filter((i) => i.jumlah > 0),
    })),

  setQty: (menuItemId, qty) =>
    set((state) => ({
      cart:
        qty <= 0
          ? state.cart.filter((i) => i.menu_item_id !== menuItemId)
          : state.cart.map((i) =>
              i.menu_item_id === menuItemId ? { ...i, jumlah: qty } : i
            ),
    })),

  setCatatanItem: (menuItemId, catatan) =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.menu_item_id === menuItemId ? { ...i, catatan_item: catatan } : i
      ),
    })),

  setNamaCustomer: (nama) => set({ namaCustomer: nama }),
  setNomorWA: (wa) => set({ nomorWA: wa }),
  setCatatanOrder: (catatan) => set({ catatanOrder: catatan }),
  setMetodeBayar: (metode) => set({ metodeBayar: metode }),
  setUangDiterima: (jumlah) => set({ uangDiterima: jumlah }),
  setCompletedOrder: (order) => set({ completedOrder: order }),

  openKeranjang: () => set({ isKeranjangOpen: true }),
  closeKeranjang: () => set({ isKeranjangOpen: false }),
  openBayar: () => set({ isBayarOpen: true, isKeranjangOpen: false }),
  closeBayar: () => set({ isBayarOpen: false }),
  openStruk: () => set({ isStrukOpen: true, isBayarOpen: false }),
  openTipeModal: () => set({ isTipeModalOpen: true }),
  closeTipeModal: () => set({ isTipeModalOpen: false }),

  resetKasir: () =>
    set({
      tipeOrder: null,
      namaCustomer: '',
      nomorWA: '',
      cart: [],
      catatanOrder: '',
      metodeBayar: 'cash',
      uangDiterima: 0,
      completedOrder: null,
      isKeranjangOpen: false,
      isBayarOpen: false,
      isStrukOpen: false,
      isTipeModalOpen: false,
    }),

  totalHarga: () => get().cart.reduce((sum, i) => sum + i.harga_satuan * i.jumlah, 0),
  totalItem: () => get().cart.reduce((sum, i) => sum + i.jumlah, 0),
  kembalian: () => {
    const { uangDiterima, metodeBayar } = get()
    const total = get().totalHarga()
    return metodeBayar === 'cash' ? Math.max(0, uangDiterima - total) : 0
  },
}))

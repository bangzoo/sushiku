'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import Header from '@/components/layout/Header'
import MenuCard from '@/components/menu/MenuCard'
import KeranjangPanel from '@/components/kasir/KeranjangPanel'
import KeranjangSheet from '@/components/kasir/KeranjangSheet'
import BayarSheet from '@/components/kasir/BayarSheet'
import { useMenuItems } from '@/hooks/useMenu'
import { useKasirStore } from '@/store/kasirStore'
import { KATEGORI_MENU } from '@/constants'
import { cn } from '@/lib/utils'
import type { KategoriMenu } from '@/types'

type FilterKategori = 'semua' | KategoriMenu

const FILTER_OPTIONS: Array<{ value: FilterKategori; label: string; emoji: string }> = [
  { value: 'semua', label: 'Semua', emoji: '🍽️' },
  ...Object.entries(KATEGORI_MENU).map(([key, val]) => ({
    value: key as KategoriMenu,
    label: val.label,
    emoji: val.emoji,
  })),
]

export default function KasirPage() {
  const [filter, setFilter] = useState<FilterKategori>('semua')
  const [search, setSearch] = useState('')

  const { data: menuItems = [], isLoading } = useMenuItems()
  const { cart, addToCart } = useKasirStore()

  const tersediaItems = useMemo(
    () => menuItems.filter((m) => m.tersedia),
    [menuItems]
  )

  const filtered = useMemo(() => {
    return tersediaItems.filter((item) => {
      if (filter !== 'semua' && item.kategori !== filter) return false
      if (search && !item.nama.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tersediaItems, filter, search])

  const getCartCount = (menuItemId: string) =>
    cart.find((i) => i.menu_item_id === menuItemId)?.jumlah ?? 0

  const handleTapMenu = (item: typeof menuItems[0]) => {
    if (!item.tersedia) return
    addToCart({
      menu_item_id: item.id,
      nama_item: item.nama,
      harga_satuan: item.harga_jual,
      harga_modal: item.harga_modal,
      foto_url: item.foto_url,
    })
  }

  return (
    <>
      <Header title="Kasir" />

      <div className="px-4 pt-3 pb-2 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-sushi pl-10 pr-10"
            placeholder="Cari menu..."
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter kategori */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {FILTER_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                filter === value
                  ? 'bg-sushi-red text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid menu */}
      <div className="px-4 pb-36">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-sushi overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2.5 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : tersediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-3">🍣</p>
            <p className="font-semibold text-gray-700">Belum ada menu tersedia</p>
            <p className="text-sm text-gray-400 mt-1">Tambahkan dan aktifkan menu di halaman Menu</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">Tidak ditemukan</p>
            <button
              onClick={() => { setSearch(''); setFilter('semua') }}
              className="mt-3 text-sm text-sushi-red font-semibold"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                mode="kasir"
                cartCount={getCartCount(item.id)}
                onTap={() => handleTapMenu(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals & Sheets */}
      <KeranjangPanel />
      <KeranjangSheet />
      <BayarSheet />
    </>
  )
}

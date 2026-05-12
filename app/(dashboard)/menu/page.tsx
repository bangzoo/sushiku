'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, X, TrendingUp, Star, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import MenuCard from '@/components/menu/MenuCard'
import MenuForm from '@/components/menu/MenuForm'
import MenuDetailSheet from '@/components/menu/MenuDetailSheet'
import {
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useToggleMenuAvailability,
  useDeleteMenuItem,
} from '@/hooks/useMenu'
import { useMenuStore } from '@/store/menuStore'
import { KATEGORI_MENU } from '@/constants'
import { cn } from '@/lib/utils'
import type { KategoriMenu, MenuItem } from '@/types'

type FilterValue = 'semua' | KategoriMenu

const FILTER_OPTIONS: Array<{ value: FilterValue; label: string; emoji: string }> = [
  { value: 'semua', label: 'Semua', emoji: '🍽️' },
  ...Object.entries(KATEGORI_MENU).map(([key, val]) => ({
    value: key as KategoriMenu,
    label: val.label,
    emoji: val.emoji,
  })),
]

export default function MenuPage() {
  const [filter, setFilter] = useState<FilterValue>('semua')
  const [search, setSearch] = useState('')

  const { isFormOpen, editingItem, isDetailOpen, selectedItem, openForm, closeForm, openDetail, closeDetail } =
    useMenuStore()

  const { data: menuItems = [], isLoading } = useMenuItems()
  const createMenu = useCreateMenuItem()
  const updateMenu = useUpdateMenuItem()
  const toggleAvailability = useToggleMenuAvailability()
  const deleteMenu = useDeleteMenuItem()

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      if (filter !== 'semua' && item.kategori !== filter) return false
      if (search && !item.nama.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [menuItems, filter, search])

  const handleSubmit = (data: Omit<MenuItem, 'id' | 'created_at'>) => {
    if (editingItem) {
      updateMenu.mutate({ id: editingItem.id, ...data }, { onSuccess: closeForm })
    } else {
      createMenu.mutate(data, { onSuccess: closeForm })
    }
  }

  const totalTersedia = menuItems.filter((m) => m.tersedia).length
  const totalNonaktif = menuItems.filter((m) => !m.tersedia).length

  const menuByMargin = useMemo(
    () =>
      menuItems
        .filter((m) => m.harga_modal > 0 && m.harga_jual > 0 && m.tersedia)
        .sort(
          (a, b) =>
            (b.harga_jual - b.harga_modal) / b.harga_jual -
            (a.harga_jual - a.harga_modal) / a.harga_jual
        )
        .slice(0, 3),
    [menuItems]
  )

  return (
    <>
      <Header title="Menu Sushi" />

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Summary chips */}
        {menuItems.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">
              ✓ {totalTersedia} tersedia
            </span>
            {totalNonaktif > 0 && (
              <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full font-medium">
                {totalNonaktif} nonaktif
              </span>
            )}
            <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-medium">
              {menuItems.length} total menu
            </span>
          </div>
        )}

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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter kategori (horizontal scroll) */}
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

        {/* Grid menu */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-sushi overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-2.5 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-3">🍣</p>
            {search || filter !== 'semua' ? (
              <>
                <p className="font-semibold text-gray-700">Tidak ditemukan</p>
                <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau kata kunci</p>
                <button
                  onClick={() => {
                    setSearch('')
                    setFilter('semua')
                  }}
                  className="mt-4 text-sm text-sushi-red font-semibold"
                >
                  Reset filter
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700">Belum ada menu</p>
                <p className="text-sm text-gray-400 mt-1 max-w-[220px]">
                  Tambahkan menu sushimu untuk mulai berjualan!
                </p>
                <button
                  onClick={() => openForm()}
                  className="mt-5 btn-primary px-6 py-3 rounded-xl"
                >
                  <Plus size={18} />
                  Tambah Menu Pertama
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onTap={() => openDetail(item)}
                onToggleAvailability={(tersedia) =>
                  toggleAvailability.mutate({ id: item.id, tersedia })
                }
              />
            ))}
          </div>
        )}

        {/* ── Analisis Menu ── */}
        {menuItems.length > 0 && !search && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-gray-700">Performa Menu</h3>

            {/* Top terlaris — placeholder sampai ada data order */}
            <div className="card-sushi p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} className="text-sushi-red" />
                <p className="text-sm font-semibold text-sushi-black">Top Terlaris</p>
              </div>
              <div className="flex flex-col items-center py-3 text-center">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-sm text-gray-400">Data akan muncul setelah ada penjualan</p>
              </div>
            </div>

            {/* Margin tertinggi */}
            {menuByMargin.length > 0 && (
              <div className="card-sushi p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={15} className="text-yellow-500" />
                  <p className="text-sm font-semibold text-sushi-black">Margin Tertinggi</p>
                  <span className="text-[10px] text-gray-400 ml-auto">Rekomendasikan untuk promo</span>
                </div>
                {menuByMargin.map((item, i) => {
                  const m = (
                    ((item.harga_jual - item.harga_modal) / item.harga_jual) *
                    100
                  ).toFixed(0)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-gray-400 shrink-0">#{i + 1}</span>
                        <span className="text-sm text-sushi-black truncate">{item.nama}</span>
                      </div>
                      <span className="text-xs font-bold text-green-600 shrink-0 ml-2">{m}%</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Alert menu nonaktif */}
            {totalNonaktif > 0 && (
              <div className="card-sushi p-4 border-l-4 border-yellow-400">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-sushi-black">
                      {totalNonaktif} menu sedang nonaktif
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Menu ini tidak tampil di kasir. Aktifkan jika sudah siap dijual.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom spacer untuk FAB */}
        <div className="h-4" />
      </div>

      {/* FAB Tambah Menu */}
      <button
        onClick={() => openForm()}
        className="fixed bottom-20 right-4 w-14 h-14 bg-sushi-red text-white rounded-full shadow-lg shadow-red-200 flex items-center justify-center z-30 active:scale-90 transition-transform"
        aria-label="Tambah menu"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Form tambah/edit */}
      {isFormOpen && (
        <MenuForm
          item={editingItem}
          onSubmit={handleSubmit}
          onClose={closeForm}
          isLoading={createMenu.isPending || updateMenu.isPending}
        />
      )}

      {/* Detail bottom sheet */}
      <MenuDetailSheet
        item={selectedItem}
        open={isDetailOpen}
        onClose={closeDetail}
        onEdit={() => {
          closeDetail()
          if (selectedItem) openForm(selectedItem)
        }}
        onDelete={() => {
          if (selectedItem) deleteMenu.mutate(selectedItem.id)
        }}
        onToggleAvailability={(tersedia) => {
          if (selectedItem) toggleAvailability.mutate({ id: selectedItem.id, tersedia })
        }}
      />
    </>
  )
}

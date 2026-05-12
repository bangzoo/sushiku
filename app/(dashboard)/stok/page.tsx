'use client'

import { useMemo, useState } from 'react'
import { Plus, RefreshCw, Package, AlertTriangle, TrendingDown } from 'lucide-react'
import Header from '@/components/layout/Header'
import BahanBakuCard from '@/components/stok/BahanBakuCard'
import BahanBakuForm from '@/components/stok/BahanBakuForm'
import StokLogSheet from '@/components/stok/StokLogSheet'
import { useBahanBaku } from '@/hooks/useStok'
import { useStokStore } from '@/store/stokStore'
import { formatRupiah, KATEGORI_BAHAN } from '@/constants'
import { cn } from '@/lib/utils'
import type { KategoriBahan } from '@/types'

type FilterKat = 'semua' | KategoriBahan

export default function StokPage() {
  const [filter, setFilter] = useState<FilterKat>('semua')
  const { data: items = [], isLoading, refetch, isFetching } = useBahanBaku()
  const { openForm, openLog } = useStokStore()

  const lowStock = useMemo(() => items.filter((i) => i.stok_sekarang <= i.stok_minimum), [items])
  const outStock = useMemo(() => items.filter((i) => i.stok_sekarang === 0), [items])
  const nilaiTotal = useMemo(() => items.reduce((s, i) => s + i.stok_sekarang * i.harga_per_satuan, 0), [items])

  const filtered = useMemo(() =>
    filter === 'semua' ? items : items.filter((i) => i.kategori === filter),
    [items, filter]
  )

  const FILTER_OPTIONS: Array<{ value: FilterKat; label: string; emoji: string }> = [
    { value: 'semua', label: 'Semua', emoji: '📦' },
    ...(Object.entries(KATEGORI_BAHAN) as [KategoriBahan, { label: string; emoji: string }][]).map(([key, val]) => ({
      value: key,
      label: val.label,
      emoji: val.emoji,
    })),
  ]

  return (
    <>
      <Header
        title="Stok Bahan"
        right={
          <button
            onClick={() => refetch()}
            className={cn('p-2 rounded-full hover:bg-gray-100', isFetching && 'animate-spin')}
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-32 space-y-4">
        {/* Alert low stock */}
        {lowStock.length > 0 && !isLoading && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-700">
                {outStock.length > 0
                  ? `${outStock.length} bahan habis, ${lowStock.length - outStock.length} hampir habis`
                  : `${lowStock.length} bahan hampir habis`}
              </p>
              <p className="text-xs text-orange-600 mt-0.5 truncate">
                {lowStock.slice(0, 3).map((i) => i.nama).join(', ')}
                {lowStock.length > 3 && ` +${lowStock.length - 3} lagi`}
              </p>
            </div>
          </div>
        )}

        {/* Summary cards */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="card-sushi p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Total Bahan</p>
              <p className="text-xl font-bold text-sushi-black">{items.length}</p>
            </div>
            <div className={cn('card-sushi p-3 text-center', lowStock.length > 0 && 'border border-orange-200')}>
              <p className="text-xs text-gray-500 mb-0.5">Stok Rendah</p>
              <p className={cn('text-xl font-bold', lowStock.length > 0 ? 'text-orange-500' : 'text-sushi-black')}>
                {lowStock.length}
              </p>
            </div>
            <div className="card-sushi p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Nilai Stok</p>
              <p className="text-sm font-bold text-sushi-red">{formatRupiah(nilaiTotal)}</p>
            </div>
          </div>
        )}

        {/* Filter kategori */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {FILTER_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
                filter === value
                  ? 'bg-sushi-red text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {value !== 'semua' && (
                <span className={cn(
                  'text-[10px] px-1 rounded-full ml-0.5',
                  filter === value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {items.filter((i) => i.kategori === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-sushi h-28 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-semibold text-gray-700">Belum ada bahan baku</p>
            <p className="text-sm text-gray-400 mt-1">Tambahkan bahan baku untuk memantau stok</p>
            <button
              onClick={() => openForm()}
              className="mt-4 btn-primary px-6 py-3 rounded-2xl text-sm"
            >
              Tambah Sekarang
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-700">Tidak ada bahan di kategori ini</p>
            <button onClick={() => setFilter('semua')} className="mt-3 text-sm text-sushi-red font-semibold">
              Lihat semua
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Prioritas: tampilkan habis/low stock duluan */}
            {filtered
              .slice()
              .sort((a, b) => {
                const aLow = a.stok_sekarang <= a.stok_minimum ? (a.stok_sekarang === 0 ? 0 : 1) : 2
                const bLow = b.stok_sekarang <= b.stok_minimum ? (b.stok_sekarang === 0 ? 0 : 1) : 2
                return aLow - bLow || a.nama.localeCompare(b.nama)
              })
              .map((item) => (
                <BahanBakuCard
                  key={item.id}
                  item={item}
                  onLog={() => openLog(item)}
                  onEdit={() => openForm(item)}
                />
              ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {!isLoading && (
        <button
          onClick={() => openForm()}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-sushi-red text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      )}

      <BahanBakuForm />
      <StokLogSheet />
    </>
  )
}

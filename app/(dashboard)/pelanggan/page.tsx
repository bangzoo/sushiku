'use client'

import { useState } from 'react'
import { Search, X, Phone, ShoppingBag, TrendingUp, ChevronRight, Crown, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/layout/Header'
import { usePelanggan, type PelangganSummary } from '@/hooks/usePelanggan'
import { formatRupiah } from '@/constants'
import { cn } from '@/lib/utils'
import type { LabelPelanggan } from '@/types'

const LABEL_CONFIG: Record<LabelPelanggan, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  vip:     { label: 'VIP',     bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Crown size={10} /> },
  regular: { label: 'Regular', bg: 'bg-blue-100',   text: 'text-blue-600',   icon: <Star size={10} /> },
  baru:    { label: 'Baru',    bg: 'bg-gray-100',   text: 'text-gray-500',   icon: null },
}

function DetailSheet({ pelanggan, onClose }: { pelanggan: PelangganSummary; onClose: () => void }) {
  const labelCfg = LABEL_CONFIG[pelanggan.label]
  const noWA = pelanggan.nomor_wa?.replace(/\D/g, '') ?? ''

  const openWA = (text?: string) => {
    const encoded = text ? `?text=${encodeURIComponent(text)}` : ''
    window.open(`https://wa.me/${noWA}${encoded}`, '_blank')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />

        <div className="px-4 pb-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-sushi-black">{pelanggan.nama}</h2>
              {pelanggan.nomor_wa && (
                <p className="text-sm text-gray-400 mt-0.5">{pelanggan.nomor_wa}</p>
              )}
            </div>
            <span className={cn('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', labelCfg.bg, labelCfg.text)}>
              {labelCfg.icon} {labelCfg.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-sushi-black">{pelanggan.total_order}</p>
              <p className="text-[10px] text-gray-400">Total Order</p>
            </div>
            <div className="bg-red-50 rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-sushi-red">{formatRupiah(pelanggan.total_belanja)}</p>
              <p className="text-[10px] text-gray-400">Total Belanja</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-sm font-bold text-sushi-black">
                {formatRupiah(Math.round(pelanggan.total_belanja / pelanggan.total_order))}
              </p>
              <p className="text-[10px] text-gray-400">Rata-rata</p>
            </div>
          </div>

          {pelanggan.nomor_wa && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => openWA()}
                className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Phone size={14} /> Chat WA
              </button>
              <button
                onClick={() => openWA(`Halo ${pelanggan.nama}! 😊\nTerima kasih sudah jadi pelanggan setia SushiKu ya!\nAda menu baru nih, mau coba?`)}
                className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                Follow Up
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Riwayat Order</p>
          <div className="space-y-2">
            {pelanggan.orders.map((o) => (
              <div key={o.nomor_order} className="card-sushi p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{o.nomor_order.slice(-8)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(o.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {o.items_json.map((i) => `${i.nama_item}${i.jumlah > 1 ? ` ×${i.jumlah}` : ''}`).join(', ')}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-sushi-black shrink-0 ml-2">{formatRupiah(o.total_harga)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="safe-bottom" />
        </div>
      </motion.div>
    </>
  )
}

function PelangganCard({ p, onTap }: { p: PelangganSummary; onTap: () => void }) {
  const labelCfg = LABEL_CONFIG[p.label]
  const lastOrder = new Date(p.last_order + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

  return (
    <button
      onClick={onTap}
      className="w-full card-sushi p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
    >
      <div className="w-11 h-11 rounded-full bg-sushi-red/10 flex items-center justify-center shrink-0">
        <span className="text-lg font-bold text-sushi-red">{p.nama.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-sushi-black truncate">{p.nama}</p>
          <span className={cn('flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', labelCfg.bg, labelCfg.text)}>
            {labelCfg.icon} {labelCfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <ShoppingBag size={10} /> {p.total_order}×
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <TrendingUp size={10} /> {formatRupiah(p.total_belanja)}
          </span>
          <span className="text-xs text-gray-300">{lastOrder}</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}

export default function PelangganPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<PelangganSummary | null>(null)
  const [filterLabel, setFilterLabel] = useState<LabelPelanggan | 'semua'>('semua')

  const { data: list = [], isLoading } = usePelanggan()

  const filtered = list.filter((p) => {
    if (filterLabel !== 'semua' && p.label !== filterLabel) return false
    if (search) {
      const q = search.toLowerCase()
      return p.nama.toLowerCase().includes(q) || (p.nomor_wa ?? '').includes(q)
    }
    return true
  })

  const vip = list.filter((p) => p.label === 'vip').length
  const regular = list.filter((p) => p.label === 'regular').length

  return (
    <>
      <Header title="Pelanggan" />

      <div className="px-4 pt-4 pb-28 space-y-4">
        {/* Summary */}
        {!isLoading && list.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="card-sushi p-3 text-center">
              <p className="text-xl font-bold text-sushi-black">{list.length}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="card-sushi p-3 text-center">
              <p className="text-xl font-bold text-yellow-600">{vip}</p>
              <p className="text-xs text-gray-400">VIP</p>
            </div>
            <div className="card-sushi p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{regular}</p>
              <p className="text-xs text-gray-400">Regular</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-sushi pl-10 pr-10"
            placeholder="Cari nama atau nomor WA..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter label */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
          {(['semua', 'vip', 'regular', 'baru'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setFilterLabel(l)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors capitalize',
                filterLabel === l ? 'bg-sushi-black text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              {l === 'semua' ? 'Semua' : l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card-sushi h-16 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-3">👥</p>
            <p className="font-semibold text-gray-700">Belum ada data pelanggan</p>
            <p className="text-sm text-gray-400 mt-1">
              Data muncul otomatis setelah ada order WhatsApp selesai
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-gray-500 text-sm">Tidak ditemukan</p>
            <button onClick={() => { setSearch(''); setFilterLabel('semua') }} className="text-sushi-red text-sm mt-2 font-semibold">Reset</button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <PelangganCard key={p.key} p={p} onTap={() => setSelected(p)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <DetailSheet pelanggan={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  )
}

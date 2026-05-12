'use client'

import Image from 'next/image'
import { X, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRupiah, KATEGORI_MENU } from '@/constants'
import type { MenuItem } from '@/types'
import ResepManager from '@/components/menu/ResepManager'

interface MenuDetailSheetProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleAvailability: (tersedia: boolean) => void
}

export default function MenuDetailSheet({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuDetailSheetProps) {
  if (!item) return null

  const kategori = KATEGORI_MENU[item.kategori]
  const labaPerItem = item.harga_jual - item.harga_modal
  const margin =
    item.harga_jual > 0
      ? ((labaPerItem / item.harga_jual) * 100).toFixed(0)
      : '0'

  const handleDelete = () => {
    if (confirm(`Hapus "${item.nama}"?\n\nMenu tidak akan tampil lagi, tapi tetap tercatat di riwayat order.`)) {
      onDelete()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '85vh' }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: '85vh' }}>
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Kategori & close */}
              <div className="flex items-center justify-between px-4 pb-2">
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {kategori?.emoji} {kategori?.label}
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Foto */}
              {item.foto_url && (
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={item.foto_url}
                    alt={item.nama}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}

              <div className="px-4 py-4 space-y-4">
                {/* Nama & status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-sushi-black leading-tight">{item.nama}</h2>
                    {item.deskripsi && (
                      <p className="text-sm text-gray-500 mt-1">{item.deskripsi}</p>
                    )}
                  </div>
                  {!item.tersedia && (
                    <span className="shrink-0 text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium">
                      Tidak Tersedia
                    </span>
                  )}
                </div>

                {/* Harga cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 mb-1">Harga Jual</p>
                    <p className="text-sm font-bold text-sushi-red leading-tight">
                      {formatRupiah(item.harga_jual)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 mb-1">Modal</p>
                    <p className="text-sm font-bold text-sushi-black leading-tight">
                      {formatRupiah(item.harga_modal)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 mb-1">Margin</p>
                    <p className="text-sm font-bold text-green-600 leading-tight">{margin}%</p>
                  </div>
                </div>

                {/* Statistik */}
                <div className="bg-sushi-cream rounded-xl p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Statistik Bulan Ini
                  </p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xl font-bold text-sushi-black">—</p>
                      <p className="text-xs text-gray-500">Terjual</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-sushi-black">—</p>
                      <p className="text-xs text-gray-500">Total omzet</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Data tersedia setelah ada penjualan
                  </p>
                </div>

                {/* Resep & Auto-Deduct */}
                <div className="border border-gray-100 rounded-2xl p-4">
                  <ResepManager menuItemId={item.id} menuNama={item.nama} />
                </div>

                {/* Tombol aksi */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onToggleAvailability(!item.tersedia)
                      onClose()
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      item.tersedia
                        ? 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        : 'bg-green-50 text-green-700 active:bg-green-100'
                    }`}
                  >
                    {item.tersedia ? <EyeOff size={16} /> : <Eye size={16} />}
                    {item.tersedia ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <button
                    onClick={() => {
                      onEdit()
                      onClose()
                    }}
                    className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold active:bg-blue-100"
                  >
                    <Edit2 size={16} />
                    Edit Menu
                  </button>
                </div>

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold active:bg-red-100"
                >
                  <Trash2 size={16} />
                  Hapus Menu
                </button>
              </div>

              {/* Safe area spacer */}
              <div className="safe-bottom" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

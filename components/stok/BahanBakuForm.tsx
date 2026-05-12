'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStokStore } from '@/store/stokStore'
import { useCreateBahanBaku, useUpdateBahanBaku, useDeleteBahanBaku } from '@/hooks/useStok'
import { KATEGORI_BAHAN, SATUAN_BAHAN } from '@/constants'
import type { KategoriBahan, SatuanBahan } from '@/types'

const schema = z.object({
  nama: z.string().min(2, 'Minimal 2 karakter'),
  kategori: z.enum(['ikan_seafood', 'sayuran', 'bahan_dasar', 'bumbu', 'kemasan']),
  satuan: z.enum(['gram', 'kg', 'pcs', 'lembar', 'botol', 'pack', 'liter', 'ml']),
  stok_sekarang: z.coerce.number().min(0, 'Tidak boleh negatif'),
  stok_minimum: z.coerce.number().min(0, 'Tidak boleh negatif'),
  harga_per_satuan: z.coerce.number().min(0, 'Tidak boleh negatif'),
})

type FormData = z.infer<typeof schema>

export default function BahanBakuForm() {
  const { isFormOpen, editingItem, closeForm } = useStokStore()
  const create = useCreateBahanBaku()
  const update = useUpdateBahanBaku()
  const del = useDeleteBahanBaku()
  const isEdit = !!editingItem

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama: '',
      kategori: 'bahan_dasar',
      satuan: 'gram',
      stok_sekarang: 0,
      stok_minimum: 0,
      harga_per_satuan: 0,
    },
  })

  useEffect(() => {
    if (editingItem) {
      reset({
        nama: editingItem.nama,
        kategori: editingItem.kategori as KategoriBahan,
        satuan: editingItem.satuan as SatuanBahan,
        stok_sekarang: editingItem.stok_sekarang,
        stok_minimum: editingItem.stok_minimum,
        harga_per_satuan: editingItem.harga_per_satuan,
      })
    } else {
      reset({
        nama: '',
        kategori: 'bahan_dasar',
        satuan: 'gram',
        stok_sekarang: 0,
        stok_minimum: 0,
        harga_per_satuan: 0,
      })
    }
  }, [editingItem, reset])

  const onSubmit = async (data: FormData) => {
    if (isEdit && editingItem) {
      await update.mutateAsync({ id: editingItem.id, ...data })
    } else {
      await create.mutateAsync(data)
    }
    closeForm()
  }

  const handleDelete = async () => {
    if (!editingItem) return
    if (!confirm(`Hapus "${editingItem.nama}"? Tindakan ini tidak bisa dibatalkan.`)) return
    await del.mutateAsync(editingItem.id)
    closeForm()
  }

  return (
    <AnimatePresence>
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-sushi-cream flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 safe-top bg-white">
            <h2 className="text-lg font-bold text-sushi-black">
              {isEdit ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}
            </h2>
            <div className="flex items-center gap-2">
              {isEdit && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-full text-red-400 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* Nama */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Bahan</label>
              <input {...register('nama')} className="input-sushi" placeholder="Contoh: Salmon Fillet" />
              {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>}
            </div>

            {/* Kategori */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(KATEGORI_BAHAN) as [KategoriBahan, { label: string; emoji: string }][]).map(([key, val]) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" value={key} {...register('kategori')} className="sr-only" />
                    <div className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors
                      has-[:checked]:bg-sushi-red has-[:checked]:text-white has-[:checked]:border-sushi-red
                      border-gray-200 text-gray-600`}>
                      {val.emoji} {val.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Satuan */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Satuan</label>
              <select {...register('satuan')} className="input-sushi">
                {SATUAN_BAHAN.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Stok & minimum */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stok Sekarang</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('stok_sekarang')}
                  className="input-sushi"
                  placeholder="0"
                />
                {errors.stok_sekarang && <p className="text-xs text-red-500 mt-1">{errors.stok_sekarang.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stok Minimum</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('stok_minimum')}
                  className="input-sushi"
                  placeholder="0"
                />
                {errors.stok_minimum && <p className="text-xs text-red-500 mt-1">{errors.stok_minimum.message}</p>}
              </div>
            </div>

            {/* Harga */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Harga per Satuan (Rp)</label>
              <input
                type="number"
                {...register('harga_per_satuan')}
                className="input-sushi"
                placeholder="0"
              />
              {errors.harga_per_satuan && <p className="text-xs text-red-500 mt-1">{errors.harga_per_satuan.message}</p>}
            </div>
          </form>

          {/* Footer */}
          <div className="px-4 py-4 bg-white border-t border-gray-100 safe-bottom">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Bahan Baku'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

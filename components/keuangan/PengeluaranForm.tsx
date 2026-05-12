'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreatePengeluaran, useUpdatePengeluaran, useDeletePengeluaran } from '@/hooks/useKeuangan'
import { KATEGORI_PENGELUARAN } from '@/constants'
import type { Pengeluaran, KategoriPengeluaran } from '@/types'

const schema = z.object({
  tanggal: z.string().min(1, 'Pilih tanggal'),
  kategori: z.enum(['bahan_baku', 'operasional', 'kemasan', 'transport', 'promosi', 'lain']),
  keterangan: z.string().min(2, 'Minimal 2 karakter'),
  jumlah: z.coerce.number().min(1, 'Minimal Rp 1'),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  editingItem: Pengeluaran | null
  onClose: () => void
}

export default function PengeluaranForm({ isOpen, editingItem, onClose }: Props) {
  const create = useCreatePengeluaran()
  const update = useUpdatePengeluaran()
  const del = useDeletePengeluaran()
  const isEdit = !!editingItem

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tanggal: today, kategori: 'operasional', keterangan: '', jumlah: 0 },
  })

  useEffect(() => {
    if (editingItem) {
      reset({
        tanggal: editingItem.tanggal,
        kategori: editingItem.kategori as KategoriPengeluaran,
        keterangan: editingItem.keterangan,
        jumlah: editingItem.jumlah,
      })
    } else {
      reset({ tanggal: today, kategori: 'operasional', keterangan: '', jumlah: 0 })
    }
  }, [editingItem, reset, today])

  const selectedKat = watch('kategori')

  const onSubmit = async (data: FormData) => {
    if (isEdit && editingItem) {
      await update.mutateAsync({ id: editingItem.id, ...data })
    } else {
      await create.mutateAsync(data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!editingItem) return
    if (!confirm('Hapus pengeluaran ini?')) return
    await del.mutateAsync(editingItem.id)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />

            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sushi-black text-lg">
                {isEdit ? 'Edit Pengeluaran' : 'Catat Pengeluaran'}
              </h3>
              <div className="flex items-center gap-1">
                {isEdit && (
                  <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Kategori */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(KATEGORI_PENGELUARAN) as [KategoriPengeluaran, { label: string; emoji: string; warna: string }][]).map(([key, val]) => (
                    <label key={key} className="cursor-pointer">
                      <input type="radio" value={key} {...register('kategori')} className="sr-only" />
                      <div className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium border-2 transition-colors
                        ${selectedKat === key ? 'border-current' : 'border-gray-100 text-gray-500'}`}
                        style={selectedKat === key ? { backgroundColor: val.warna + '15', color: val.warna, borderColor: val.warna } : {}}
                      >
                        <span className="text-base">{val.emoji}</span>
                        {val.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Keterangan</label>
                <input {...register('keterangan')} className="input-sushi" placeholder="Contoh: Beli salmon 1kg" />
                {errors.keterangan && <p className="text-xs text-red-500 mt-1">{errors.keterangan.message}</p>}
              </div>

              {/* Jumlah */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah (Rp)</label>
                <input
                  type="number"
                  {...register('jumlah')}
                  className="input-sushi text-lg font-semibold"
                  placeholder="0"
                />
                {errors.jumlah && <p className="text-xs text-red-500 mt-1">{errors.jumlah.message}</p>}
              </div>

              {/* Tanggal */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal</label>
                <input type="date" {...register('tanggal')} className="input-sushi" />
                {errors.tanggal && <p className="text-xs text-red-500 mt-1">{errors.tanggal.message}</p>}
              </div>
            </form>

            <div className="px-4 py-4 border-t border-gray-100 safe-bottom">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-60"
              >
                {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KATEGORI_MENU, formatRupiah } from '@/constants'
import type { MenuItem } from '@/types'
import ImageUpload from './ImageUpload'

const menuSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  kategori: z.enum(['nigiri', 'maki', 'sashimi', 'roll', 'set_menu', 'minuman', 'tambahan']),
  deskripsi: z.string().optional(),
  harga_jual: z.coerce.number().min(0, 'Tidak boleh negatif'),
  harga_modal: z.coerce.number().min(0, 'Tidak boleh negatif'),
  urutan_tampil: z.coerce.number().default(0),
  tersedia: z.boolean().default(true),
  foto_url: z.string().nullable().optional(),
})

type MenuFormValues = z.infer<typeof menuSchema>

interface MenuFormProps {
  item?: MenuItem | null
  onSubmit: (data: Omit<MenuItem, 'id' | 'created_at'>) => void
  onClose: () => void
  isLoading?: boolean
}

export default function MenuForm({ item, onSubmit, onClose, isLoading }: MenuFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: item
      ? {
          nama: item.nama,
          kategori: item.kategori,
          deskripsi: item.deskripsi ?? '',
          harga_jual: item.harga_jual,
          harga_modal: item.harga_modal,
          urutan_tampil: item.urutan_tampil,
          tersedia: item.tersedia,
          foto_url: item.foto_url ?? null,
        }
      : {
          tersedia: true,
          urutan_tampil: 0,
          harga_jual: 0,
          harga_modal: 0,
          kategori: 'nigiri',
        },
  })

  const hargaJual = watch('harga_jual') ?? 0
  const hargaModal = watch('harga_modal') ?? 0
  const fotoUrl = watch('foto_url')
  const tersedia = watch('tersedia')

  const labaPerItem = Number(hargaJual) - Number(hargaModal)
  const margin =
    Number(hargaJual) > 0
      ? ((labaPerItem / Number(hargaJual)) * 100).toFixed(0)
      : '0'

  const onValid = (values: MenuFormValues) => {
    onSubmit({
      nama: values.nama,
      kategori: values.kategori,
      deskripsi: values.deskripsi || undefined,
      harga_jual: Number(values.harga_jual),
      harga_modal: Number(values.harga_modal),
      urutan_tampil: Number(values.urutan_tampil),
      tersedia: values.tersedia,
      foto_url: values.foto_url || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sushi-cream">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 safe-top">
        <h2 className="text-lg font-bold text-sushi-black">
          {item ? 'Edit Menu' : 'Tambah Menu Baru'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Scrollable body */}
      <form
        id="menu-form"
        onSubmit={handleSubmit(onValid)}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
        style={{ paddingBottom: '100px' }}
      >
        {/* Foto */}
        <ImageUpload
          value={fotoUrl}
          onChange={(url) => setValue('foto_url', url)}
        />

        {/* Nama */}
        <div>
          <label className="label-sushi">
            Nama Menu <span className="text-sushi-red">*</span>
          </label>
          <input
            {...register('nama')}
            className={cn('input-sushi', errors.nama && 'border-red-400 focus:border-red-400')}
            placeholder="Contoh: Salmon Nigiri"
            autoComplete="off"
          />
          {errors.nama && (
            <p className="text-xs text-red-500 mt-1">{errors.nama.message}</p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="label-sushi">
            Kategori <span className="text-sushi-red">*</span>
          </label>
          <select {...register('kategori')} className="input-sushi bg-white">
            {Object.entries(KATEGORI_MENU).map(([key, { label, emoji }]) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="label-sushi">
            Deskripsi{' '}
            <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            {...register('deskripsi')}
            className="input-sushi resize-none"
            rows={2}
            placeholder="Misal: Salmon segar dengan nasi jepang..."
          />
        </div>

        {/* Harga */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-sushi">
              Harga Jual <span className="text-sushi-red">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                Rp
              </span>
              <input
                {...register('harga_jual')}
                type="number"
                inputMode="numeric"
                className={cn('input-sushi pl-9', errors.harga_jual && 'border-red-400')}
                placeholder="0"
              />
            </div>
            {errors.harga_jual && (
              <p className="text-xs text-red-500 mt-1">{errors.harga_jual.message}</p>
            )}
          </div>

          <div>
            <label className="label-sushi">Harga Modal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                Rp
              </span>
              <input
                {...register('harga_modal')}
                type="number"
                inputMode="numeric"
                className="input-sushi pl-9"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Kalkulasi margin */}
        {Number(hargaJual) > 0 && (
          <div
            className={cn(
              'rounded-xl px-4 py-3 text-sm font-medium',
              labaPerItem >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}
          >
            Laba per item: {formatRupiah(labaPerItem)} · Margin {margin}%
          </div>
        )}

        {/* Urutan tampil */}
        <div>
          <label className="label-sushi">Urutan Tampil di Kasir</label>
          <input
            {...register('urutan_tampil')}
            type="number"
            inputMode="numeric"
            className="input-sushi"
            placeholder="0"
          />
          <p className="text-xs text-gray-400 mt-1">Angka lebih kecil = muncul lebih awal</p>
        </div>

        {/* Toggle tersedia */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
          <div>
            <p className="text-sm font-semibold text-sushi-black">Tersedia untuk dijual</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {tersedia ? 'Menu tampil di kasir' : 'Menu disembunyikan dari kasir'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('tersedia')} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-sushi-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
      </form>

      {/* Sticky submit button */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 safe-bottom">
        <button
          type="submit"
          form="menu-form"
          disabled={isLoading}
          className="btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Menyimpan...
            </>
          ) : item ? (
            'Simpan Perubahan'
          ) : (
            'Tambah Menu'
          )}
        </button>
      </div>
    </div>
  )
}

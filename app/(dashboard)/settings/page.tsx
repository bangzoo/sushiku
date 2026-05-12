'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Store, CreditCard, Target, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useBisnisSettings, useUpdateSettings } from '@/hooks/useSettings'
import { formatRupiah } from '@/constants'
import toast from 'react-hot-toast'

const schema = z.object({
  nama_bisnis: z.string().min(2, 'Minimal 2 karakter'),
  alamat: z.string().optional(),
  nomor_wa_bisnis: z.string().optional(),
  rekening_bank: z.string().optional(),
  nomor_rekening: z.string().optional(),
  nama_rekening: z.string().optional(),
  nomor_qris: z.string().optional(),
  target_omzet_bulanan: z.coerce.number().min(0).optional(),
  jam_buka: z.string().optional(),
  jam_tutup: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-7 h-7 rounded-lg bg-sushi-red/10 flex items-center justify-center text-sushi-red">
        {icon}
      </div>
      <p className="text-sm font-bold text-sushi-black">{title}</p>
    </div>
  )
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useBisnisSettings()
  const update = useUpdateSettings()

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama_bisnis: 'SushiKu',
      alamat: '',
      nomor_wa_bisnis: '',
      rekening_bank: '',
      nomor_rekening: '',
      nama_rekening: '',
      nomor_qris: '',
      target_omzet_bulanan: 0,
      jam_buka: '08:00',
      jam_tutup: '21:00',
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        nama_bisnis: settings.nama_bisnis ?? 'SushiKu',
        alamat: settings.alamat ?? '',
        nomor_wa_bisnis: settings.nomor_wa_bisnis ?? '',
        rekening_bank: settings.rekening_bank ?? '',
        nomor_rekening: settings.nomor_rekening ?? '',
        nama_rekening: settings.nama_rekening ?? '',
        nomor_qris: settings.nomor_qris ?? '',
        target_omzet_bulanan: settings.target_omzet_bulanan ?? 0,
        jam_buka: settings.jam_buka ?? '08:00',
        jam_tutup: settings.jam_tutup ?? '21:00',
      })
    }
  }, [settings, reset])

  const targetVal = watch('target_omzet_bulanan') ?? 0

  const onSubmit = async (data: FormData) => {
    await update.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <>
        <Header title="Pengaturan" />
        <div className="px-4 pt-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-2xl animate-pulse bg-gray-100" />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Pengaturan" />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-40 space-y-4">
        {/* Profil Bisnis */}
        <SectionTitle icon={<Store size={14} />} title="Profil Bisnis" />

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Bisnis</label>
            <input {...register('nama_bisnis')} className="input-sushi" placeholder="SushiKu" />
            {errors.nama_bisnis && <p className="text-xs text-red-500 mt-1">{errors.nama_bisnis.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Alamat (opsional)</label>
            <input {...register('alamat')} className="input-sushi" placeholder="Jl. Contoh No. 1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nomor WhatsApp Bisnis</label>
            <input
              {...register('nomor_wa_bisnis')}
              className="input-sushi"
              placeholder="628123456789"
              type="tel"
            />
            <p className="text-xs text-gray-400 mt-1">Nomor ini dipakai untuk tombol "Kirim ke WA" di struk</p>
          </div>
        </div>

        {/* Jam Operasional */}
        <SectionTitle icon={<Clock size={14} />} title="Jam Operasional" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jam Buka</label>
            <input type="time" {...register('jam_buka')} className="input-sushi" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jam Tutup</label>
            <input type="time" {...register('jam_tutup')} className="input-sushi" />
          </div>
        </div>

        {/* Pembayaran */}
        <SectionTitle icon={<CreditCard size={14} />} title="Rekening & Pembayaran" />

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Bank</label>
            <input {...register('rekening_bank')} className="input-sushi" placeholder="BCA / Mandiri / BRI / dll" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">No. Rekening</label>
              <input {...register('nomor_rekening')} className="input-sushi" placeholder="1234567890" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Pemilik</label>
              <input {...register('nama_rekening')} className="input-sushi" placeholder="Nama" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">No. QRIS / GoPay / OVO</label>
            <input {...register('nomor_qris')} className="input-sushi" placeholder="08123456789" />
          </div>
        </div>

        {/* Target */}
        <SectionTitle icon={<Target size={14} />} title="Target Bisnis" />

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Omzet Bulanan (Rp)</label>
          <input
            type="number"
            {...register('target_omzet_bulanan')}
            className="input-sushi text-lg font-semibold"
            placeholder="0"
          />
          {targetVal > 0 && (
            <p className="text-xs text-gray-400 mt-1">Target: {formatRupiah(Number(targetVal))}</p>
          )}
        </div>

        {/* Save button sticky */}
        <div className="fixed bottom-16 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100 z-50">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-50"
          >
            <Save size={18} />
            {isSubmitting ? 'Menyimpan...' : isDirty ? 'Simpan Pengaturan' : 'Tersimpan'}
          </button>
        </div>
      </form>
    </>
  )
}

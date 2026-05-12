'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, ImageIcon, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS } from '@/constants'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.menuFotos)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKETS.menuFotos).getPublicUrl(path)

      onChange(publicUrl)
    } catch {
      toast.error('Gagal upload foto. Cek koneksi internet.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="label-sushi">Foto Menu</label>

      {value ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
          <Image src={value} alt="Foto menu" fill className="object-cover" sizes="100vw" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-gray-50">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 size={24} className="text-sushi-red animate-spin" />
              <p className="text-sm text-gray-400">Mengupload foto...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-400">Foto opsional tapi bikin menu lebih menarik</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-sushi-red text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                >
                  <Camera size={16} />
                  Kamera
                </button>
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                >
                  <ImageIcon size={16} />
                  Galeri
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

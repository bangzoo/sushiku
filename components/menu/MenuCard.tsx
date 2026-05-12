'use client'

import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah, KATEGORI_MENU } from '@/constants'
import type { MenuItem } from '@/types'

interface MenuCardProps {
  item: MenuItem
  onTap?: () => void
  onToggleAvailability?: (tersedia: boolean) => void
  mode?: 'list' | 'kasir'
  cartCount?: number
}

export default function MenuCard({
  item,
  onTap,
  onToggleAvailability,
  mode = 'list',
  cartCount,
}: MenuCardProps) {
  const kategori = KATEGORI_MENU[item.kategori]

  return (
    <div
      className={cn(
        'card-sushi overflow-hidden relative select-none',
        mode === 'kasir' && item.tersedia && 'active:scale-95 transition-transform cursor-pointer',
        mode === 'kasir' && !item.tersedia && 'opacity-50 cursor-not-allowed',
        mode === 'list' && 'cursor-pointer active:scale-[0.98] transition-transform'
      )}
      onClick={mode === 'list' || item.tersedia ? onTap : undefined}
    >
      {/* Foto */}
      <div className="relative aspect-square bg-gray-100">
        {item.foto_url ? (
          <Image
            src={item.foto_url}
            alt={item.nama}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {kategori?.emoji ?? '🍣'}
          </div>
        )}

        {/* Overlay tidak tersedia */}
        {!item.tersedia && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold bg-black/60 px-2 py-1 rounded-full">
              Tidak Tersedia
            </span>
          </div>
        )}

        {/* Cart count badge */}
        {cartCount !== undefined && cartCount > 0 && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-sushi-red rounded-full flex items-center justify-center z-10">
            <span className="text-white text-[10px] font-bold">{cartCount}</span>
          </div>
        )}

        {/* Kategori chip */}
        <div className="absolute top-1.5 left-1.5">
          <span className="text-[10px] bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full font-medium text-gray-700 leading-none">
            {kategori?.emoji} {kategori?.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-sm font-semibold text-sushi-black line-clamp-1">{item.nama}</p>
        <p className="text-sm font-bold text-sushi-red mt-0.5">{formatRupiah(item.harga_jual)}</p>

        {mode === 'list' && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
            <span className="text-[11px] text-gray-400">
              Modal {formatRupiah(item.harga_modal)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleAvailability?.(!item.tersedia)
              }}
              className={cn(
                'p-1 rounded-full transition-colors',
                item.tersedia ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
              )}
            >
              {item.tersedia ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

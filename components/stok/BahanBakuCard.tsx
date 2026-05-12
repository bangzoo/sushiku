'use client'

import { Package, Edit3, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah, KATEGORI_BAHAN } from '@/constants'
import type { BahanBaku } from '@/types'

interface Props {
  item: BahanBaku
  onLog: () => void
  onEdit: () => void
}

export default function BahanBakuCard({ item, onLog, onEdit }: Props) {
  const isLow = item.stok_sekarang <= item.stok_minimum
  const isOut = item.stok_sekarang === 0
  const pct = item.stok_minimum > 0
    ? Math.min(100, (item.stok_sekarang / (item.stok_minimum * 2)) * 100)
    : 100

  const kat = KATEGORI_BAHAN[item.kategori]

  return (
    <div className={cn(
      'card-sushi border overflow-hidden',
      isOut ? 'border-red-300' : isLow ? 'border-orange-300' : 'border-transparent'
    )}>
      {(isLow || isOut) && (
        <div className={cn('h-1 w-full', isOut ? 'bg-red-500' : 'bg-orange-400')} />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sushi-black truncate">{item.nama}</span>
              {isOut ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium flex items-center gap-0.5">
                  <AlertTriangle size={9} /> Habis
                </span>
              ) : isLow ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium flex items-center gap-0.5">
                  <AlertTriangle size={9} /> Hampir habis
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-400">{kat.emoji} {kat.label}</span>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 shrink-0"
          >
            <Edit3 size={14} />
          </button>
        </div>

        {/* Stok display */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className={cn(
              'text-2xl font-bold',
              isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-sushi-black'
            )}>
              {item.stok_sekarang}
              <span className="text-sm font-normal text-gray-400 ml-1">{item.satuan}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Min: {item.stok_minimum} {item.satuan} · {formatRupiah(item.harga_per_satuan)}/{item.satuan}
            </p>
          </div>

          <button
            onClick={onLog}
            className="flex items-center gap-1.5 px-3 py-2 bg-sushi-black text-white rounded-xl text-xs font-semibold active:scale-95 transition-transform shrink-0"
          >
            <Package size={13} />
            Update Stok
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isOut ? 'bg-red-500' : isLow ? 'bg-orange-400' : 'bg-green-400'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Nilai stok */}
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          Nilai: {formatRupiah(item.stok_sekarang * item.harga_per_satuan)}
        </p>
      </div>
    </div>
  )
}

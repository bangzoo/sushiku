'use client'

import { ShoppingBag, ChevronUp } from 'lucide-react'
import { useKasirStore } from '@/store/kasirStore'
import { formatRupiah } from '@/constants'

export default function KeranjangPanel() {
  const { cart, totalHarga, totalItem, openKeranjang, openBayar } = useKasirStore()

  if (cart.length === 0) return null

  const total = totalHarga()
  const items = totalItem()

  return (
    <div className="fixed left-0 right-0 z-50 px-4" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: '8px' }}>
      {/* Panel */}
      <div className="bg-sushi-black rounded-2xl p-3 flex items-center gap-3 shadow-2xl">
        {/* Ikon keranjang */}
        <button
          onClick={openKeranjang}
          className="relative w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0"
        >
          <ShoppingBag size={20} className="text-white" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-sushi-red rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {items}
          </span>
        </button>

        {/* Info */}
        <button onClick={openKeranjang} className="flex-1 text-left">
          <p className="text-xs text-white/60">{items} item dipilih</p>
          <p className="text-base font-bold text-white">{formatRupiah(total)}</p>
        </button>

        {/* Expand icon */}
        <button onClick={openKeranjang} className="text-white/60 mr-1">
          <ChevronUp size={18} />
        </button>

        {/* Bayar button */}
        <button
          onClick={openBayar}
          className="bg-sushi-red text-white font-bold px-5 py-3 rounded-xl text-sm shrink-0 active:scale-95 transition-transform"
        >
          Bayar
        </button>
      </div>
    </div>
  )
}

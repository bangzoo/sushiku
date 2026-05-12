'use client'

import { useState } from 'react'
import { X, Loader2, CreditCard, Smartphone, Banknote, Bike } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKasirStore } from '@/store/kasirStore'
import { useCreateOrder } from '@/hooks/useOrders'
import { useBisnisSettings } from '@/hooks/useSettings'
import { formatRupiah } from '@/constants'
import { cn } from '@/lib/utils'

const METODE_OPTIONS = [
  { value: 'cash' as const, label: 'Cash', emoji: '💵', icon: Banknote },
  { value: 'transfer' as const, label: 'Transfer', emoji: '🏦', icon: CreditCard },
  { value: 'qris' as const, label: 'QRIS', emoji: '📱', icon: Smartphone },
]

export default function BayarSheet() {
  const [isCOD, setIsCOD] = useState(false)
  const {
    isBayarOpen,
    closeBayar,
    openStruk,
    cart,
    tipeOrder,
    namaCustomer,
    nomorWA,
    catatanOrder,
    metodeBayar,
    uangDiterima,
    setMetodeBayar,
    setUangDiterima,
    setCompletedOrder,
    totalHarga,
    kembalian,
  } = useKasirStore()

  const { data: settings } = useBisnisSettings()
  const createOrder = useCreateOrder()

  const total = totalHarga()
  const kemb = kembalian()
  const kurang = !isCOD && metodeBayar === 'cash' && uangDiterima > 0 && uangDiterima < total

  const handleSelesaikan = async () => {
    if (!isCOD && metodeBayar === 'cash' && uangDiterima < total) return

    createOrder.mutate(
      {
        tipeOrder: tipeOrder ?? 'walkin',
        namaCustomer,
        nomorWA,
        cart,
        catatanOrder,
        totalHarga: total,
        metodeBayar: isCOD ? 'cash' : metodeBayar,
        dibayar: !isCOD,
      },
      {
        onSuccess: (order) => {
          setCompletedOrder(order)
          openStruk()
        },
      }
    )
  }

  return (
    <AnimatePresence>
      {isBayarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeBayar}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-sushi-black">Pembayaran</h2>
              <button
                onClick={closeBayar}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Total */}
              <div className="bg-sushi-black rounded-2xl p-5 text-center">
                <p className="text-white/60 text-sm mb-1">Total Pembayaran</p>
                <p className="text-white text-3xl font-bold">{formatRupiah(total)}</p>
                {namaCustomer && (
                  <p className="text-white/50 text-xs mt-1">untuk {namaCustomer}</p>
                )}
              </div>

              {/* COD Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsCOD(false)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-colors',
                    !isCOD ? 'border-sushi-red bg-red-50 text-sushi-red' : 'border-gray-200 bg-gray-50 text-gray-500'
                  )}
                >
                  💳 Bayar Sekarang
                </button>
                <button
                  onClick={() => setIsCOD(true)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-2xl border-2 text-sm font-semibold transition-colors',
                    isCOD ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-gray-50 text-gray-500'
                  )}
                >
                  <Bike size={15} /> COD / Antar
                </button>
              </div>

              {isCOD && (
                <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-blue-700">
                  <p className="font-semibold mb-0.5">💡 Bayar Saat Diantar</p>
                  <p className="text-xs text-blue-600">Pembayaran (cash/transfer) dikonfirmasi di halaman Antrian setelah diantar.</p>
                </div>
              )}

              {/* Metode bayar — hanya tampil kalau bukan COD */}
              {!isCOD && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Metode Pembayaran</p>
                    <div className="grid grid-cols-3 gap-2">
                      {METODE_OPTIONS.map(({ value, label, emoji }) => (
                        <button
                          key={value}
                          onClick={() => setMetodeBayar(value)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-4 rounded-2xl border-2 transition-colors',
                            metodeBayar === value
                              ? 'border-sushi-red bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          )}
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span className={cn('text-xs font-semibold', metodeBayar === value ? 'text-sushi-red' : 'text-gray-500')}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash: input uang + kembalian */}
                  {metodeBayar === 'cash' && (
                    <div className="space-y-3">
                      <div>
                        <label className="label-sushi">Uang Diterima</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={uangDiterima || ''}
                            onChange={(e) => setUangDiterima(Number(e.target.value))}
                            className="input-sushi pl-10 text-lg font-semibold"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {[total, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000, Math.ceil(total / 100000) * 100000]
                            .filter((v, i, arr) => arr.indexOf(v) === i)
                            .slice(0, 4)
                            .map((v) => (
                              <button key={v} onClick={() => setUangDiterima(v)}
                                className="text-xs px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 font-medium active:bg-gray-200">
                                {formatRupiah(v)}
                              </button>
                            ))}
                        </div>
                      </div>
                      {uangDiterima > 0 && (
                        <div className={cn('rounded-2xl p-4', kurang ? 'bg-red-50' : 'bg-green-50')}>
                          {kurang ? (
                            <div className="text-center">
                              <p className="text-sm text-red-600 font-medium">Uang kurang</p>
                              <p className="text-lg font-bold text-red-600">{formatRupiah(total - uangDiterima)}</p>
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-sm text-green-600">Kembalian</p>
                              <p className="text-2xl font-bold text-green-700">{formatRupiah(kemb)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transfer info */}
                  {metodeBayar === 'transfer' && (
                    <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
                      <p className="text-sm font-semibold text-blue-800">Info Transfer</p>
                      {settings?.rekening_bank && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Bank</span>
                          <span className="font-semibold text-blue-800">{settings.rekening_bank}</span>
                        </div>
                      )}
                      {settings?.nomor_rekening && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">No. Rekening</span>
                          <span className="font-semibold text-blue-800 font-mono">{settings.nomor_rekening}</span>
                        </div>
                      )}
                      {settings?.nama_rekening && (
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">a/n</span>
                          <span className="font-semibold text-blue-800">{settings.nama_rekening}</span>
                        </div>
                      )}
                      {!settings?.rekening_bank && (
                        <p className="text-sm text-blue-500 italic">Lengkapi info rekening di Settings</p>
                      )}
                    </div>
                  )}

                  {/* QRIS info */}
                  {metodeBayar === 'qris' && (
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-sm font-semibold text-purple-800 mb-1">Pembayaran QRIS</p>
                      {settings?.nomor_qris ? (
                        <p className="text-sm text-purple-600">
                          Scan QRIS: <span className="font-mono font-semibold">{settings.nomor_qris}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-purple-500 italic">Lengkapi info QRIS di Settings</p>
                      )}
                      <div className="mt-3 h-20 bg-white rounded-xl flex items-center justify-center">
                        <span className="text-4xl">📱</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="h-4" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100 px-4 py-4 bg-white safe-bottom">
              <button
                onClick={handleSelesaikan}
                disabled={
                  createOrder.isPending ||
                  (!isCOD && metodeBayar === 'cash' && uangDiterima < total)
                }
                className="btn-primary w-full py-4 text-base rounded-2xl disabled:opacity-50"
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  '✓ Selesaikan Order'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

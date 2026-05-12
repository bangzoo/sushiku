'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle, User, MessageCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useAntrian, useUpdateOrderStatus, useSelesaikanDanBayar } from '@/hooks/useOrders'
import { useKasirStore } from '@/store/kasirStore'
import { formatRupiah } from '@/constants'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

function getWaitMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

function getWaitColor(menit: number) {
  if (menit < 15) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-400' }
  if (menit < 30) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-400' }
  return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-400' }
}

function OrderCard({ order, onSelesai, onBatal, onSelesaikanDanBayar }: {
  order: Order
  onSelesai: () => void
  onBatal: (alasan: string) => void
  onSelesaikanDanBayar: (metode: Order['metode_bayar']) => void
}) {
  const [showBatalForm, setShowBatalForm] = useState(false)
  const [showBayarForm, setShowBayarForm] = useState(false)
  const [alasan, setAlasan] = useState('')
  const menit = getWaitMinutes(order.created_at)
  const warna = getWaitColor(menit)
  const itemSummary = order.items_json.map((i) => `${i.nama_item}${i.jumlah > 1 ? ` ×${i.jumlah}` : ''}`).join(', ')

  return (
    <div className={cn('card-sushi border overflow-hidden', warna.border)}>
      <div className={cn('h-1.5 w-full', warna.bar)} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-sushi-black font-mono">#{order.nomor_order.slice(-8)}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium bg-white border', warna.border, warna.text)}>
                {menit < 1 ? 'Baru masuk' : `${menit} mnt`}
              </span>
            </div>
            {order.nama_customer && (
              <div className="flex items-center gap-1 mt-1">
                {order.tipe === 'whatsapp' ? <MessageCircle size={11} className="text-green-500" /> : <User size={11} className="text-gray-400" />}
                <span className="text-sm text-gray-600">{order.nama_customer}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-sushi-black">{formatRupiah(order.total_harga)}</p>
            <p className="text-xs text-gray-400">{order.waktu.slice(0, 5)}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-1">{itemSummary}</p>
        {order.catatan_order && (
          <p className="text-xs text-gray-400 italic mb-1">📝 {order.catatan_order}</p>
        )}

        {/* Badge COD */}
        {!order.dibayar && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold mb-1">
            🛵 COD · Belum Bayar
          </span>
        )}

        {showBayarForm ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Terima pembayaran via:</p>
            <div className="grid grid-cols-2 gap-2">
              {([['cash', '💵 Cash'], ['transfer', '🏦 Transfer']] as [Order['metode_bayar'], string][]).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => onSelesaikanDanBayar(m)}
                  className="py-3 rounded-xl bg-sushi-black text-white text-sm font-semibold active:scale-95 transition-transform"
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowBayarForm(false)} className="w-full py-2 text-xs text-gray-400">
              Batal
            </button>
          </div>
        ) : !showBatalForm ? (
          <div className="flex gap-2 mt-3">
            <button
              onClick={order.dibayar ? onSelesai : () => setShowBayarForm(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sushi-black text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
            >
              <CheckCircle size={15} />
              {order.dibayar ? 'Tandai Selesai' : 'Selesai & Terima Bayaran'}
            </button>
            <button
              onClick={() => setShowBatalForm(true)}
              className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-semibold"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            <input
              autoFocus
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="input-sushi text-sm"
              placeholder="Alasan pembatalan..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => alasan.trim() && onBatal(alasan)}
                disabled={!alasan.trim()}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Konfirmasi Batal
              </button>
              <button
                onClick={() => { setShowBatalForm(false); setAlasan('') }}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm"
              >
                Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AntrianPage() {
  const { data: orders = [], isLoading, refetch, isFetching } = useAntrian()
  const updateStatus = useUpdateOrderStatus()
  const selesaikanDanBayar = useSelesaikanDanBayar()
  const { setCompletedOrder, setNamaCustomer, setNomorWA, openStruk } = useKasirStore()

  const terlambat = orders.filter((o) => getWaitMinutes(o.created_at) > 30).length

  return (
    <>
      <Header
        title="Antrian Order"
        right={
          <button onClick={() => refetch()} className={cn('p-2 rounded-full hover:bg-gray-100', isFetching && 'animate-spin')}>
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-sushi h-40 animate-pulse bg-gray-100" />
          ))
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-3">✅</p>
            <p className="font-semibold text-gray-700">Tidak ada antrian!</p>
            <p className="text-sm text-gray-400 mt-1">Semua order sudah selesai diproses</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-3 py-1.5 bg-sushi-black text-white rounded-full font-medium">{orders.length} order aktif</span>
              {terlambat > 0 && (
                <span className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-medium">⚠️ {terlambat} perlu diprioritaskan</span>
              )}
            </div>

            <div className="flex gap-3 text-[11px] text-gray-400 pb-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> &lt;15 mnt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> 15-30 mnt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &gt;30 mnt</span>
            </div>

            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelesai={() => updateStatus.mutate({ id: order.id, status: 'selesai', order })}
                onBatal={(alasanBatal) => updateStatus.mutate({ id: order.id, status: 'batal', alasanBatal })}
                onSelesaikanDanBayar={(metode) =>
                  selesaikanDanBayar.mutate(
                    { order, metodeBayar: metode },
                    {
                      onSuccess: () => {
                        const updatedOrder: Order = { ...order, status: 'selesai', dibayar: true, metode_bayar: metode }
                        setNamaCustomer(order.nama_customer ?? '')
                        setNomorWA(order.nomor_wa ?? '')
                        setCompletedOrder(updatedOrder)
                        openStruk()
                      },
                    }
                  )
                }
              />
            ))}
          </>
        )}
      </div>
    </>
  )
}

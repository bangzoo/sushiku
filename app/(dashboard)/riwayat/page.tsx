'use client'

import { useState } from 'react'
import { Search, X, ChevronRight, User, MessageCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useRiwayatOrders, useUpdateOrderStatus, type RiwayatFilter } from '@/hooks/useOrders'
import { formatRupiah, STATUS_ORDER, METODE_BAYAR } from '@/constants'
import { cn } from '@/lib/utils'
import type { Order } from '@/types'

const PERIODE_OPTIONS: Array<{ value: RiwayatFilter['periode']; label: string }> = [
  { value: 'hari_ini', label: 'Hari Ini' },
  { value: 'minggu', label: '7 Hari' },
  { value: 'bulan', label: 'Bulan Ini' },
  { value: 'semua', label: 'Semua' },
]

const TIPE_OPTIONS: Array<{ value: RiwayatFilter['tipe']; label: string }> = [
  { value: 'semua', label: 'Semua' },
  { value: 'walkin', label: '🚶 Walk-in' },
  { value: 'whatsapp', label: '📱 WhatsApp' },
]

function OrderRow({ order, onDetail }: { order: Order; onDetail: () => void }) {
  const status = STATUS_ORDER[order.status]
  const metode = METODE_BAYAR[order.metode_bayar]
  const waktu = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <button
      onClick={onDetail}
      className="w-full card-sushi p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
    >
      {/* Status dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
        style={{ backgroundColor: status.warna }}
      />

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">#{order.nomor_order.slice(-8)}</span>
          {order.tipe === 'whatsapp' ? (
            <MessageCircle size={11} className="text-green-500 shrink-0" />
          ) : (
            <User size={11} className="text-gray-400 shrink-0" />
          )}
        </div>
        <p className="text-sm font-semibold text-sushi-black mt-0.5 truncate">
          {order.nama_customer || 'Walk-in'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: status.bg, color: status.warna }}>
            {status.label}
          </span>
          <span className="text-[11px] text-gray-400">{metode.emoji} {metode.label}</span>
          <span className="text-[11px] text-gray-400">{waktu}</span>
        </div>
      </div>

      {/* Total */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-sushi-black">{formatRupiah(order.total_harga)}</p>
        <p className="text-xs text-gray-400">{order.items_json.length} item</p>
      </div>

      <ChevronRight size={16} className="text-gray-300 shrink-0" />
    </button>
  )
}

function OrderDetailSheet({ order, onClose, onBatal }: {
  order: Order | null
  onClose: () => void
  onBatal: (id: string, alasan: string) => void
}) {
  const [showBatalForm, setShowBatalForm] = useState(false)
  const [alasan, setAlasan] = useState('')

  if (!order) return null

  const status = STATUS_ORDER[order.status]
  const metode = METODE_BAYAR[order.metode_bayar]
  const tgl = new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  const waktu = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 safe-top">
        <div>
          <h2 className="text-lg font-bold text-sushi-black font-mono">#{order.nomor_order}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{tgl} · {waktu}</p>
        </div>
        <button onClick={onClose} className="text-sm text-sushi-red font-semibold px-4 py-2 bg-red-50 rounded-full">
          Tutup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Status & info */}
        <div className="card-sushi p-4 flex items-center justify-between">
          <div>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: status.bg, color: status.warna }}>
              {status.label}
            </span>
            {order.alasan_batal && (
              <p className="text-xs text-gray-400 mt-1">Alasan: {order.alasan_batal}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{order.tipe === 'whatsapp' ? '📱 WhatsApp' : '🚶 Walk-in'}</p>
            {order.nama_customer && <p className="text-sm font-semibold text-sushi-black">{order.nama_customer}</p>}
            {order.nomor_wa && <p className="text-xs text-gray-400">{order.nomor_wa}</p>}
          </div>
        </div>

        {/* Items */}
        <div className="card-sushi p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Detail Item</p>
          <div className="space-y-2">
            {order.items_json.map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sushi-black">{item.nama_item} <span className="text-gray-400">×{item.jumlah}</span></p>
                  {item.catatan_item && <p className="text-xs text-gray-400 italic">"{item.catatan_item}"</p>}
                </div>
                <p className="text-sm font-semibold text-sushi-black ml-3 shrink-0">{formatRupiah(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-sushi-red">{formatRupiah(order.total_harga)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{metode.emoji} {metode.label}</p>
          {order.catatan_order && <p className="text-xs text-gray-400 mt-1">📝 {order.catatan_order}</p>}
        </div>

        {/* Batalkan (hanya jika belum batal/selesai) */}
        {(order.status === 'proses' || order.status === 'pending') && (
          <div className="card-sushi p-4">
            {!showBatalForm ? (
              <button
                onClick={() => setShowBatalForm(true)}
                className="w-full py-3 text-red-500 text-sm font-semibold bg-red-50 rounded-xl"
              >
                Batalkan Order Ini
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="Alasan pembatalan..."
                />
                <div className="flex gap-2">
                  <button
                    disabled={!alasan.trim()}
                    onClick={() => { onBatal(order.id, alasan); onClose() }}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    Konfirmasi Batal
                  </button>
                  <button
                    onClick={() => setShowBatalForm(false)}
                    className="px-4 py-3 bg-gray-100 rounded-xl text-sm"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RiwayatPage() {
  const [periode, setPeriode] = useState<RiwayatFilter['periode']>('hari_ini')
  const [tipe, setTipe] = useState<RiwayatFilter['tipe']>('semua')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders = [], isLoading } = useRiwayatOrders({ periode, tipe, search })
  const updateStatus = useUpdateOrderStatus()

  const totalOmzet = orders.filter((o) => o.status === 'selesai').reduce((s, o) => s + o.total_harga, 0)
  const totalSelesai = orders.filter((o) => o.status === 'selesai').length

  return (
    <>
      <Header title="Riwayat Order" />

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Filter periode */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {PERIODE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriode(value)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
                periode === value ? 'bg-sushi-red text-white' : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filter tipe + search */}
        <div className="flex gap-2">
          {TIPE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTipe(value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                tipe === value ? 'bg-sushi-black text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-sushi pl-10 pr-10"
            placeholder="Cari nama customer / no. order..."
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Summary */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="card-sushi p-3">
              <p className="text-xs text-gray-500">Order Selesai</p>
              <p className="text-xl font-bold text-sushi-black mt-0.5">{totalSelesai}</p>
            </div>
            <div className="card-sushi p-3">
              <p className="text-xs text-gray-500">Total Omzet</p>
              <p className="text-xl font-bold text-sushi-red mt-0.5">{formatRupiah(totalOmzet)}</p>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card-sushi h-20 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-semibold text-gray-700">Belum ada order</p>
            <p className="text-sm text-gray-400 mt-1">
              {periode === 'hari_ini' ? 'Belum ada order hari ini' : 'Tidak ada data untuk periode ini'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onDetail={() => setSelectedOrder(order)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail sheet */}
      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onBatal={(id, alasan) => updateStatus.mutate({ id, status: 'batal', alasanBatal: alasan })}
        />
      )}
    </>
  )
}

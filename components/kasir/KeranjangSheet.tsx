'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Minus, Trash2, ChevronDown, MessageCircle, User, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKasirStore } from '@/store/kasirStore'
import { usePelanggan } from '@/hooks/usePelanggan'
import { formatRupiah } from '@/constants'
import { cn } from '@/lib/utils'

export default function KeranjangSheet() {
  const {
    cart,
    isKeranjangOpen,
    closeKeranjang,
    openBayar,
    updateQty,
    setCatatanItem,
    catatanOrder,
    setCatatanOrder,
    totalHarga,
    tipeOrder,
    namaCustomer,
    nomorWA,
    setTipeOrder,
    setNamaCustomer,
    setNomorWA,
    resetKasir,
  } = useKasirStore()

  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const namaInputRef = useRef<HTMLInputElement>(null)

  const { data: pelangganList = [] } = usePelanggan()

  const suggestions = namaCustomer.trim().length > 0
    ? pelangganList.filter((p) =>
        p.nama.toLowerCase().includes(namaCustomer.toLowerCase()) ||
        (p.nomor_wa ?? '').includes(namaCustomer)
      ).slice(0, 5)
    : pelangganList.slice(0, 5)

  const pilihPelanggan = (nama: string, wa?: string) => {
    setNamaCustomer(nama)
    if (wa) {
      setNomorWA(wa)
      setTipeOrder('whatsapp', nama, wa)
    }
    setShowSuggestions(false)
    namaInputRef.current?.blur()
  }

  const total = totalHarga()

  return (
    <AnimatePresence>
      {isKeranjangOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeKeranjang}
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
            <div className="px-4 pt-2 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-sushi-black">Keranjang</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { if (confirm('Batalkan order ini?')) { resetKasir() } }}
                    className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-full bg-red-50"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={closeKeranjang}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <ChevronDown size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Tipe order selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setTipeOrder('walkin', namaCustomer, '')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors',
                    tipeOrder !== 'whatsapp'
                      ? 'border-sushi-red bg-red-50 text-sushi-red'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  )}
                >
                  <User size={14} /> Walk-in
                </button>
                <button
                  onClick={() => setTipeOrder('whatsapp', namaCustomer, nomorWA)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors',
                    tipeOrder === 'whatsapp'
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                  )}
                >
                  <MessageCircle size={14} /> WhatsApp
                </button>
              </div>

              {/* Input nama + autocomplete */}
              <div className="mt-2 space-y-1.5">
                <div className="relative">
                  <input
                    ref={namaInputRef}
                    value={namaCustomer}
                    onChange={(e) => { setNamaCustomer(e.target.value); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="input-sushi text-sm py-2 w-full"
                    placeholder={tipeOrder === 'whatsapp' ? 'Nama customer *' : 'Nama customer (opsional)'}
                    autoComplete="off"
                  />

                  {/* Dropdown suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase px-3 pt-2 pb-1">Pelanggan Sebelumnya</p>
                      {suggestions.map((p) => (
                        <button
                          key={p.key}
                          onMouseDown={() => pilihPelanggan(p.nama, p.nomor_wa)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 active:bg-gray-100 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-sushi-red/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-sushi-red">{p.nama.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-sushi-black truncate">{p.nama}</p>
                            {p.nomor_wa && (
                              <p className="text-[11px] text-gray-400 truncate">{p.nomor_wa}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-300 shrink-0">
                            <Clock size={10} />
                            <span>{p.total_order}×</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {tipeOrder === 'whatsapp' && (
                  <input
                    value={nomorWA}
                    onChange={(e) => setNomorWA(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    className="input-sushi text-sm py-2"
                    placeholder="Nomor WhatsApp (628xxx)"
                  />
                )}
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((item) => (
                <div key={item.menu_item_id} className="bg-sushi-cream rounded-2xl p-3">
                  <div className="flex items-start gap-3">
                    {/* Foto / emoji */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.foto_url ? (
                        <Image
                          src={item.foto_url}
                          alt={item.nama_item}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🍣
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sushi-black line-clamp-1">
                        {item.nama_item}
                      </p>
                      <p className="text-xs text-gray-500">{formatRupiah(item.harga_satuan)}/pcs</p>
                      <p className="text-sm font-bold text-sushi-red mt-0.5">
                        {formatRupiah(item.harga_satuan * item.jumlah)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(item.menu_item_id, -1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center active:scale-90"
                      >
                        {item.jumlah === 1 ? (
                          <Trash2 size={14} className="text-red-400" />
                        ) : (
                          <Minus size={14} className="text-gray-600" />
                        )}
                      </button>
                      <span className="text-sm font-bold text-sushi-black w-5 text-center">
                        {item.jumlah}
                      </span>
                      <button
                        onClick={() => updateQty(item.menu_item_id, 1)}
                        className="w-8 h-8 rounded-full bg-sushi-red text-white flex items-center justify-center active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Catatan item */}
                  <button
                    onClick={() =>
                      setExpandedNotes(
                        expandedNotes === item.menu_item_id ? null : item.menu_item_id
                      )
                    }
                    className="mt-2 text-xs text-gray-400 flex items-center gap-1"
                  >
                    + {item.catatan_item ? `"${item.catatan_item}"` : 'Tambah catatan'}
                  </button>
                  {expandedNotes === item.menu_item_id && (
                    <input
                      autoFocus
                      value={item.catatan_item ?? ''}
                      onChange={(e) => setCatatanItem(item.menu_item_id, e.target.value)}
                      className="mt-1.5 w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-sushi-red"
                      placeholder="Contoh: tidak pedas, extra wasabi..."
                      onBlur={() => setExpandedNotes(null)}
                    />
                  )}
                </div>
              ))}

              {/* Catatan order */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  Catatan Order (opsional)
                </label>
                <textarea
                  value={catatanOrder}
                  onChange={(e) => setCatatanOrder(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-sushi-red resize-none bg-white"
                  rows={2}
                  placeholder="Catatan untuk seluruh order..."
                />
              </div>

              <div className="h-28" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-100 px-4 py-4 bg-white safe-bottom">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Total Bayar</span>
                <span className="text-xl font-bold text-sushi-black">{formatRupiah(total)}</span>
              </div>
              <button
                onClick={openBayar}
                className="btn-primary w-full py-4 text-base rounded-2xl"
              >
                Bayar Sekarang →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

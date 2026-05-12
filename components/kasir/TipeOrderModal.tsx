'use client'

import { useState } from 'react'
import { X, User, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKasirStore } from '@/store/kasirStore'
import { cn } from '@/lib/utils'

export default function TipeOrderModal() {
  const { isTipeModalOpen, closeTipeModal, setTipeOrder } = useKasirStore()
  const [tipe, setTipe] = useState<'walkin' | 'whatsapp'>('walkin')
  const [nama, setNama] = useState('')
  const [wa, setWa] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (tipe === 'whatsapp') {
      if (!nama.trim()) { setError('Nama customer wajib untuk order WA'); return }
      if (!wa.trim()) { setError('Nomor WA wajib untuk order WA'); return }
    }
    setTipeOrder(tipe, nama.trim(), wa.trim())
    setNama('')
    setWa('')
    setError('')
  }

  const handleClose = () => {
    closeTipeModal()
    setNama('')
    setWa('')
    setError('')
  }

  return (
    <AnimatePresence>
      {isTipeModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-sushi-black">Tipe Order</h2>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {/* Pilih tipe */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => { setTipe('walkin'); setError('') }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors',
                  tipe === 'walkin'
                    ? 'border-sushi-red bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <User size={28} className={tipe === 'walkin' ? 'text-sushi-red' : 'text-gray-400'} />
                <span className={cn('text-sm font-semibold', tipe === 'walkin' ? 'text-sushi-red' : 'text-gray-500')}>
                  🚶 Walk-in
                </span>
                <span className="text-[10px] text-gray-400 text-center">Langsung di tempat</span>
              </button>

              <button
                onClick={() => { setTipe('whatsapp'); setError('') }}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors',
                  tipe === 'whatsapp'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                )}
              >
                <MessageCircle size={28} className={tipe === 'whatsapp' ? 'text-green-500' : 'text-gray-400'} />
                <span className={cn('text-sm font-semibold', tipe === 'whatsapp' ? 'text-green-600' : 'text-gray-500')}>
                  📱 WhatsApp
                </span>
                <span className="text-[10px] text-gray-400 text-center">Order via WA</span>
              </button>
            </div>

            {/* Input customer */}
            <div className="space-y-2 mb-4">
              <input
                value={nama}
                onChange={(e) => { setNama(e.target.value); setError('') }}
                className="input-sushi"
                placeholder={tipe === 'walkin' ? 'Nama customer (opsional)' : 'Nama customer *'}
              />
              {tipe === 'whatsapp' && (
                <input
                  value={wa}
                  onChange={(e) => { setWa(e.target.value); setError('') }}
                  className="input-sushi"
                  placeholder="Nomor WhatsApp (628xxx) *"
                  type="tel"
                  inputMode="tel"
                />
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <button
              onClick={handleConfirm}
              className="btn-primary w-full py-3.5 rounded-2xl text-base"
            >
              Mulai Order
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

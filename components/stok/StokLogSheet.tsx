'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStokStore } from '@/store/stokStore'
import { useAddStokLog, useStokLog } from '@/hooks/useStok'
import { cn } from '@/lib/utils'
import type { JenisStokLog } from '@/types'

const JENIS_OPTIONS: Array<{ value: JenisStokLog; label: string; icon: React.ReactNode; color: string; bg: string }> = [
  { value: 'masuk', label: 'Stok Masuk', icon: <TrendingUp size={16} />, color: 'text-green-700', bg: 'bg-green-50 border-green-300' },
  { value: 'keluar', label: 'Stok Keluar', icon: <TrendingDown size={16} />, color: 'text-red-700', bg: 'bg-red-50 border-red-300' },
  { value: 'koreksi', label: 'Koreksi', icon: <RefreshCw size={16} />, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300' },
]

export default function StokLogSheet() {
  const { isLogOpen, selectedBahan, closeLog } = useStokStore()
  const [jenis, setJenis] = useState<JenisStokLog>('masuk')
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const addLog = useAddStokLog()
  const { data: logs = [] } = useStokLog(selectedBahan?.id ?? '')

  if (!selectedBahan) return null

  const jumlahNum = parseFloat(jumlah) || 0
  const previewStok = (() => {
    if (!jumlahNum) return selectedBahan.stok_sekarang
    if (jenis === 'masuk') return selectedBahan.stok_sekarang + jumlahNum
    if (jenis === 'keluar') return selectedBahan.stok_sekarang - jumlahNum
    return jumlahNum
  })()

  const handleSubmit = async () => {
    if (!jumlahNum || jumlahNum <= 0) return
    await addLog.mutateAsync({
      bahanId: selectedBahan.id,
      jenis,
      jumlah: jumlahNum,
      keterangan: keterangan.trim() || undefined,
      stokSekarang: selectedBahan.stok_sekarang,
    })
    setJumlah('')
    setKeterangan('')
    closeLog()
  }

  return (
    <AnimatePresence>
      {isLogOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeLog}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sushi-black">{selectedBahan.nama}</h3>
                <p className="text-sm text-gray-500">
                  Stok saat ini: <span className="font-semibold text-sushi-black">{selectedBahan.stok_sekarang} {selectedBahan.satuan}</span>
                </p>
              </div>
              <button onClick={closeLog} className="p-2 rounded-full hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Jenis */}
              <div className="grid grid-cols-3 gap-2">
                {JENIS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setJenis(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-semibold transition-all',
                      jenis === opt.value
                        ? `${opt.bg} ${opt.color} border-current`
                        : 'border-gray-100 text-gray-500 bg-gray-50'
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Input jumlah */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {jenis === 'koreksi' ? 'Stok baru' : 'Jumlah'} ({selectedBahan.satuan})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  autoFocus
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="input-sushi text-lg font-semibold"
                  placeholder="0"
                />

                {/* Preview */}
                {jumlahNum > 0 && (
                  <div className={cn(
                    'mt-2 px-3 py-2 rounded-xl text-sm font-medium',
                    previewStok < 0 ? 'bg-red-50 text-red-600' :
                    previewStok <= selectedBahan.stok_minimum ? 'bg-orange-50 text-orange-600' :
                    'bg-green-50 text-green-700'
                  )}>
                    Stok setelah: <span className="font-bold">{previewStok.toFixed(1)} {selectedBahan.satuan}</span>
                    {previewStok < 0 && ' ⚠️ Tidak bisa negatif!'}
                  </div>
                )}
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Keterangan (opsional)</label>
                <input
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="input-sushi"
                  placeholder="Contoh: Beli di Pasar Induk"
                />
              </div>

              {/* Log history */}
              {logs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1">
                    <Clock size={11} /> Riwayat
                  </p>
                  <div className="space-y-2">
                    {logs.slice(0, 5).map((log) => {
                      const opt = JENIS_OPTIONS.find((o) => o.value === log.jenis)!
                      const tgl = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                      const jam = new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={log.id} className="flex items-center gap-2 text-sm">
                          <span className={cn('flex-shrink-0', opt.color)}>{opt.icon}</span>
                          <span className="font-semibold text-sushi-black">{log.jumlah} {selectedBahan.satuan}</span>
                          {log.keterangan && <span className="text-gray-400 truncate flex-1">· {log.keterangan}</span>}
                          <span className="text-gray-400 text-xs shrink-0">{tgl} {jam}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="px-4 py-4 border-t border-gray-100 safe-bottom">
              <button
                onClick={handleSubmit}
                disabled={!jumlahNum || jumlahNum <= 0 || previewStok < 0 || addLog.isPending}
                className="btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-50"
              >
                {addLog.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

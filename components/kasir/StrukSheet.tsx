'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Share2, RefreshCw, ImageDown, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKasirStore } from '@/store/kasirStore'
import { useBisnisSettings } from '@/hooks/useSettings'
import { formatRupiah, WA_TEMPLATE, METODE_BAYAR } from '@/constants'
import type { Order } from '@/types'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

// ─── Komponen pembantu ────────────────────────────────────────────────────────

function DashedDivider() {
  return <div className="border-t border-dashed border-gray-200 my-3" />
}

function TornEdge({ flip }: { flip?: boolean }) {
  return (
    <div
      className="w-full overflow-hidden leading-none"
      style={{ transform: flip ? 'rotate(180deg)' : undefined, marginBottom: flip ? undefined : -1, marginTop: flip ? -1 : undefined }}
    >
      <svg viewBox="0 0 400 12" preserveAspectRatio="none" className="w-full h-3 block">
        <path
          d="M0,12 L0,6 L10,0 L20,6 L30,0 L40,6 L50,0 L60,6 L70,0 L80,6 L90,0 L100,6 L110,0 L120,6 L130,0 L140,6 L150,0 L160,6 L170,0 L180,6 L190,0 L200,6 L210,0 L220,6 L230,0 L240,6 L250,0 L260,6 L270,0 L280,6 L290,0 L300,6 L310,0 L320,6 L330,0 L340,6 L350,0 L360,6 L370,0 L380,6 L390,0 L400,6 L400,12 Z"
          fill="white"
        />
      </svg>
    </div>
  )
}

function Barcode() {
  const bars = [3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,2,3,1,2,1,3,2,1,2,1,3]
  return (
    <div className="flex items-end justify-center gap-px h-8 mt-1">
      {bars.map((h, i) => (
        <div key={i} className="bg-gray-800 rounded-sm" style={{ width: i % 3 === 0 ? 3 : 1.5, height: `${h * 28}%` }} />
      ))}
    </div>
  )
}

// ─── Receipt untuk di-capture (off-screen) ────────────────────────────────────

function PrintReceipt({ namaBisnis, alamat, order, namaCustomer, uangDiterima, kemb }: {
  namaBisnis: string
  alamat: string
  order: Order
  namaCustomer: string
  uangDiterima: number
  kemb: number
}) {
  const waktu = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const tanggal = new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const tipe = order.tipe === 'whatsapp' ? 'WhatsApp' : 'Walk-in'
  const totalItem = order.items_json.reduce((s, i) => s + i.jumlah, 0)

  return (
    <div style={{
      width: 360,
      background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '28px 24px 24px',
      borderRadius: 16,
    }}>
      {/* Kop */}
      <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1.5px dashed #e5e7eb' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#0F0F0F', letterSpacing: -0.5 }}>🍣 {namaBisnis}</div>
        {alamat && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{alamat}</div>}
        <div style={{ marginTop: 10, background: '#f9fafb', borderRadius: 8, padding: '5px 12px', display: 'inline-block' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', letterSpacing: 2 }}>#{order.nomor_order}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
          <span>{tanggal}</span><span>·</span><span>{waktu}</span><span>·</span><span>{tipe}</span>
        </div>
        {namaCustomer && (
          <div style={{ marginTop: 6, fontSize: 13, color: '#374151' }}>
            untuk <strong style={{ color: '#0F0F0F' }}>{namaCustomer}</strong>
          </div>
        )}
      </div>

      {/* Header kolom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, marginBottom: 8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>
        <span>Item</span><span>Subtotal</span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 }}>
        {order.items_json.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F0F0F' }}>{item.nama_item}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                {item.jumlah} × {formatRupiah(item.harga_satuan)}
              </div>
              {item.catatan_item && (
                <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 1 }}>"{item.catatan_item}"</div>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: '#0F0F0F', flexShrink: 0 }}>
              {formatRupiah(item.subtotal)}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '12px 0' }} />

      {/* Info pembayaran */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {[
          ['Total item', `${totalItem} pcs`],
          ['Pembayaran', order.dibayar ? `${METODE_BAYAR[order.metode_bayar].emoji} ${METODE_BAYAR[order.metode_bayar].label}` : '🛵 COD'],
          ...(order.dibayar && order.metode_bayar === 'cash' && uangDiterima > 0 ? [
            ['Uang diterima', formatRupiah(uangDiterima)],
            ['Kembalian', formatRupiah(kemb)],
          ] : []),
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
            <span>{label}</span>
            <span style={{ fontFamily: 'monospace', color: label === 'Kembalian' ? '#16a34a' : '#374151', fontWeight: label === 'Kembalian' ? 700 : 400 }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Total box */}
      <div style={{ background: '#0F0F0F', borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Total</span>
        <span style={{ color: '#fff', fontSize: 20, fontWeight: 900, fontFamily: 'monospace' }}>{formatRupiah(order.total_harga)}</span>
      </div>

      {/* COD badge */}
      {!order.dibayar && (
        <div style={{ background: '#eff6ff', borderRadius: 10, padding: '8px 12px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>🛵</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8' }}>COD — Bayar Saat Diantar</div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '12px 0' }} />

      {/* Barcode */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 1.5, height: 32 }}>
        {[3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,2,3,1,2,1,3,2,1,2,1,3].map((h, i) => (
          <div key={i} style={{ background: '#1f2937', borderRadius: 2, width: i % 3 === 0 ? 3 : 1.5, height: `${h * 28}%` }} />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 9, color: '#d1d5db', marginTop: 4, letterSpacing: 2 }}>
        {order.nomor_order.replace(/-/g, '')}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '12px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F0F0F' }}>Terima kasih! 🙏</div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Sampai jumpa lagi ya~ 🍣</div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StrukSheet() {
  const {
    isStrukOpen,
    completedOrder,
    namaCustomer,
    nomorWA,
    uangDiterima,
    kembalian,
    metodeBayar,
    resetKasir,
  } = useKasirStore()

  const { data: settings } = useBisnisSettings()
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isSharing, setIsSharing] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStrukOpen) {
      setShowConfetti(true)
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      const t = setTimeout(() => setShowConfetti(false), 3500)
      return () => clearTimeout(t)
    }
  }, [isStrukOpen])

  if (!completedOrder) return null

  const namaBisnis = settings?.nama_bisnis ?? 'SushiKu'
  const alamat = settings?.alamat ?? ''
  const kemb = kembalian()
  const totalItem = completedOrder.items_json.reduce((s, i) => s + i.jumlah, 0)

  const waktu = new Date(completedOrder.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  const tanggal = new Date(completedOrder.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const tanggalShort = new Date(completedOrder.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

  const handleKirimWA = () => {
    const pesan = WA_TEMPLATE.struk({
      namaBisnis,
      namaCustomer: namaCustomer || 'Kak',
      nomorOrder: completedOrder.nomor_order,
      items: completedOrder.items_json.map((i) => ({ nama: i.nama_item, qty: i.jumlah, harga: i.harga_satuan })),
      total: completedOrder.total_harga,
      metodeBayar: METODE_BAYAR[completedOrder.metode_bayar].label,
      kembalian: metodeBayar === 'cash' && kemb > 0 ? kemb : undefined,
    })
    const noWA = nomorWA.replace(/\D/g, '')
    const url = noWA ? `https://wa.me/${noWA}?text=${encodeURIComponent(pesan)}` : `https://wa.me/?text=${encodeURIComponent(pesan)}`
    window.open(url, '_blank')
  }

  const handleBagikanGambar = async () => {
    if (!printRef.current) return
    setIsSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(printRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      canvas.toBlob(async (blob) => {
        if (!blob) { setIsSharing(false); return }

        const fileName = `Struk-${completedOrder.nomor_order}.png`
        const file = new File([blob], fileName, { type: 'image/png' })

        // Web Share API (iOS Safari, Android Chrome)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Struk ${namaBisnis}`,
            })
          } catch {
            // user cancel / not supported — fallback download
            downloadBlob(blob, fileName)
          }
        } else {
          // Fallback: download file
          downloadBlob(blob, fileName)
        }
        setIsSharing(false)
      }, 'image/png', 1.0)
    } catch {
      setIsSharing(false)
    }
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isStrukOpen && (
        <>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={220}
              colors={['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']}
              style={{ position: 'fixed', zIndex: 999, pointerEvents: 'none' }}
            />
          )}

          {/* Print receipt (off-screen, untuk di-capture) */}
          <div style={{ position: 'fixed', top: 0, left: '-9999px', zIndex: -1 }}>
            <div ref={printRef}>
              <PrintReceipt
                namaBisnis={namaBisnis}
                alamat={alamat}
                order={completedOrder}
                namaCustomer={namaCustomer}
                uangDiterima={uangDiterima}
                kemb={kemb}
              />
            </div>
          </div>

          {/* ══ COD: konfirmasi singkat, bukan struk ══ */}
          {!completedOrder.dibayar ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sushi-black px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-blue-900/40"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <p className="text-3xl mb-2">🛵</p>
                <h2 className="text-white text-2xl font-bold">Order Diterima!</h2>
                <p className="text-white/50 text-sm mt-1">{tanggal} · {waktu}</p>

                <div className="mt-6 bg-white/10 rounded-2xl px-5 py-4 text-left space-y-2 w-full max-w-xs mx-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Order</span>
                    <span className="text-white font-mono font-bold text-xs">#{completedOrder.nomor_order}</span>
                  </div>
                  {namaCustomer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Customer</span>
                      <span className="text-white font-semibold">{namaCustomer}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Total</span>
                    <span className="text-white font-bold font-mono">{formatRupiah(completedOrder.total_harga)}</span>
                  </div>
                  <div className="pt-1 border-t border-white/10">
                    <p className="text-blue-300 text-xs text-center">Pembayaran dikonfirmasi saat pesanan diantar</p>
                  </div>
                </div>

                <p className="text-white/40 text-xs mt-4 max-w-[240px] mx-auto">
                  Cek halaman <span className="text-white/70 font-semibold">Antrian</span> untuk konfirmasi pembayaran setelah diantar
                </p>
              </motion.div>

              <div className="absolute bottom-0 left-0 right-0 px-4 pb-safe pt-3 space-y-2.5">
                <button
                  onClick={() => { resetKasir(); window.location.href = '/antrian' }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 text-white font-bold rounded-2xl text-sm active:scale-95 transition-transform"
                >
                  Lihat Antrian →
                </button>
                <button
                  onClick={resetKasir}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/10 text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform"
                >
                  <RefreshCw size={16} /> Order Baru
                </button>
                <div className="pb-2" />
              </div>
            </motion.div>
          ) : (

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col bg-sushi-black"
          >
            {/* ── Header sukses ── */}
            <div className="shrink-0 px-4 pt-safe flex flex-col items-center text-center pb-4 pt-10">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 220, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-3 shadow-lg shadow-green-900/40"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-white" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="text-white text-xl font-bold tracking-tight">Pembayaran Berhasil!</h2>
                <p className="text-white/50 text-xs mt-1">{tanggal} · {waktu}</p>
              </motion.div>
            </div>

            {/* ── Receipt paper ── */}
            <div className="flex-1 overflow-y-auto">
              <TornEdge />
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white px-5 pb-2"
              >
                {/* Kop */}
                <div className="text-center pt-1 pb-3">
                  <p className="text-2xl font-black tracking-tight text-sushi-black">🍣 {namaBisnis}</p>
                  {alamat && <p className="text-[11px] text-gray-400 mt-0.5">{alamat}</p>}
                  <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 inline-block">
                    <p className="font-mono text-xs text-gray-500 tracking-widest">#{completedOrder.nomor_order}</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>{tanggalShort}</span><span>·</span><span>{waktu}</span><span>·</span>
                    <span>{completedOrder.tipe === 'whatsapp' ? '📱 WA' : '🏪 Walk-in'}</span>
                  </div>
                  {namaCustomer && (
                    <p className="text-sm text-gray-600 mt-1.5 font-medium">untuk <span className="text-sushi-black font-bold">{namaCustomer}</span></p>
                  )}
                </div>

                <DashedDivider />

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-0.5">
                  <span>Item</span><span>Subtotal</span>
                </div>

                <div className="space-y-2.5 mb-1">
                  {completedOrder.items_json.map((item) => (
                    <div key={item.id}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-sushi-black leading-tight">{item.nama_item}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {item.jumlah} × <span className="font-mono">{formatRupiah(item.harga_satuan)}</span>
                          </p>
                          {item.catatan_item && (
                            <p className="text-[11px] text-gray-400 italic mt-0.5">"{item.catatan_item}"</p>
                          )}
                        </div>
                        <p className="text-sm font-bold font-mono text-sushi-black shrink-0">{formatRupiah(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <DashedDivider />

                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Total item</span>
                    <span className="font-mono">{totalItem} pcs</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Pembayaran</span>
                    {completedOrder.dibayar
                      ? <span>{METODE_BAYAR[completedOrder.metode_bayar].emoji} {METODE_BAYAR[completedOrder.metode_bayar].label}</span>
                      : <span className="text-blue-600 font-semibold">🛵 COD</span>
                    }
                  </div>
                  {completedOrder.dibayar && completedOrder.metode_bayar === 'cash' && uangDiterima > 0 && (
                    <>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Uang diterima</span>
                        <span className="font-mono">{formatRupiah(uangDiterima)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>Kembalian</span>
                        <span className="font-mono font-bold text-green-600">{formatRupiah(kemb)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-sushi-black rounded-2xl px-4 py-3.5 flex items-center justify-between mb-3">
                  <span className="text-white/70 text-sm font-semibold tracking-wide uppercase">Total</span>
                  <span className="text-white text-xl font-black font-mono">{formatRupiah(completedOrder.total_harga)}</span>
                </div>

                {!completedOrder.dibayar && (
                  <div className="bg-blue-50 rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2">
                    <span className="text-lg">🛵</span>
                    <div>
                      <p className="text-xs font-bold text-blue-700">COD — Bayar Saat Diantar</p>
                      <p className="text-[11px] text-blue-500">Konfirmasi di halaman Antrian</p>
                    </div>
                  </div>
                )}

                <DashedDivider />
                <Barcode />
                <p className="text-center text-[10px] font-mono text-gray-300 mt-1 tracking-widest">
                  {completedOrder.nomor_order.replace(/-/g, '')}
                </p>
                <DashedDivider />

                <div className="text-center pb-4 space-y-0.5">
                  <p className="text-sm font-bold text-sushi-black">Terima kasih! 🙏</p>
                  <p className="text-[11px] text-gray-400">Sampai jumpa lagi ya~ 🍣</p>
                </div>
              </motion.div>
              <TornEdge flip />
              <div className="h-4 bg-sushi-black" />
            </div>

            {/* ── Tombol aksi ── */}
            <div className="shrink-0 bg-sushi-black px-4 pb-safe pt-3 space-y-2.5">
              {/* Bagikan sebagai gambar */}
              <button
                onClick={handleBagikanGambar}
                disabled={isSharing}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-sushi-red text-white font-bold rounded-2xl text-sm active:scale-95 transition-transform shadow-lg shadow-red-900/30 disabled:opacity-70"
              >
                {isSharing ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyiapkan gambar...</>
                ) : (
                  <><ImageDown size={16} /> Bagikan Struk sebagai Gambar</>
                )}
              </button>

              {/* Kirim WA teks (fallback) */}
              {(nomorWA || completedOrder.tipe === 'whatsapp') && (
                <button
                  onClick={handleKirimWA}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-500 text-white font-bold rounded-2xl text-sm active:scale-95 transition-transform shadow-lg shadow-green-900/30"
                >
                  <Share2 size={16} />
                  Kirim Teks ke WhatsApp
                </button>
              )}

              <button
                onClick={resetKasir}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/10 text-white font-semibold rounded-2xl text-sm active:scale-95 transition-transform"
              >
                <RefreshCw size={16} />
                Order Baru
              </button>
              <div className="pb-2" />
            </div>
          </motion.div>
          )} {/* end else (bukan COD) */}
        </>
      )}
    </AnimatePresence>
  )
}

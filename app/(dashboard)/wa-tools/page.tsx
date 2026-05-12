'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, MessageCircle, ChevronDown, ChevronUp, Megaphone, Navigation, Receipt, Star, Send } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useMenuItems } from '@/hooks/useMenu'
import { usePelanggan } from '@/hooks/usePelanggan'
import { useBisnisSettings } from '@/hooks/useSettings'
import { WA_TEMPLATE, formatRupiah, KATEGORI_MENU } from '@/constants'
import { cn } from '@/lib/utils'

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }, [])

  return { copiedKey, copy }
}

function CopyButton({ text, id, className }: { text: string; id: string; className?: string }) {
  const { copiedKey, copy } = useCopy()
  const copied = copiedKey === id

  return (
    <button
      onClick={() => copy(text, id)}
      className={cn(
        'flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors',
        copied
          ? 'bg-green-500 text-white'
          : 'bg-sushi-black text-white active:scale-95 transition-transform',
        className
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Tersalin!' : 'Salin'}
    </button>
  )
}

function PreviewBox({ text }: { text: string }) {
  return (
    <div className="bg-[#ECE5DD] rounded-2xl p-3 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed relative">
      <div className="absolute top-2 right-2 w-3 h-3 bg-[#ECE5DD]" />
      <div className="bg-white rounded-xl rounded-tr-none px-3 py-2.5 shadow-sm text-sm whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    </div>
  )
}

function SectionCard({
  icon,
  title,
  subtitle,
  color,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="card-sushi overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-sushi-black">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  )
}

export default function WAToolsPage() {
  const { data: menuItems = [] } = useMenuItems()
  const { data: pelanggan = [] } = usePelanggan()
  const { data: settings } = useBisnisSettings()
  const { copiedKey, copy } = useCopy()

  const namaBisnis = settings?.nama_bisnis ?? 'SushiKu'

  // ── Broadcast ──────────────────────────────────────────────────────────────
  const [broadcastCatatan, setBroadcastCatatan] = useState('')
  const menuTersedia = menuItems.filter((m) => m.tersedia)

  const broadcastText = WA_TEMPLATE.broadcast({
    namaBisnis,
    items: menuTersedia.map((m) => ({ nama: m.nama, harga: m.harga_jual })),
    catatan: broadcastCatatan || undefined,
  })

  // ── Konfirmasi ─────────────────────────────────────────────────────────────
  const [konfNama, setKonfNama] = useState('')
  const [konfNomor, setKonfNomor] = useState('')
  const konfText = WA_TEMPLATE.konfirmasi(konfNama || 'Kak', konfNomor || 'ORD-XXXX')

  // ── Siap Antar ─────────────────────────────────────────────────────────────
  const [antarNama, setAntarNama] = useState('')
  const [antarAlamat, setAntarAlamat] = useState('')
  const antarText = WA_TEMPLATE.siapAntar(antarNama || 'Kak', antarAlamat || undefined)

  // ── Tagihan COD ────────────────────────────────────────────────────────────
  const [codNama, setCodNama] = useState('')
  const [codItems, setCodItems] = useState('')
  const [codTotal, setCodTotal] = useState('')
  const parsedCodItems = codItems
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)(?:\s*x(\d+))?\s*[-–]\s*(\d+)/)
      if (!match) return { nama: line.trim(), qty: 1, harga: 0 }
      return { nama: match[1].trim(), qty: Number(match[2] ?? 1), harga: Number(match[3]) }
    })
  const codText = WA_TEMPLATE.tagihanCOD({
    namaCustomer: codNama || 'Kak',
    items: parsedCodItems.length > 0 ? parsedCodItems : [{ nama: 'Sushi Roll', qty: 1, harga: 0 }],
    total: Number(codTotal) || 0,
  })

  // ── Follow-up ──────────────────────────────────────────────────────────────
  const [fuNama, setFuNama] = useState('')
  const fuText = WA_TEMPLATE.followUp(fuNama || 'Kak')

  return (
    <>
      <Header title="WA Tools" />

      <div className="px-4 pt-4 pb-28 space-y-4">
        {/* Tip */}
        <div className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-2xl p-3">
          <MessageCircle size={15} className="text-green-600 shrink-0 mt-0.5" />
          <p className="text-xs text-green-700">
            Salin template lalu kirim via WhatsApp. Sesuaikan teks sebelum dikirim jika perlu.
          </p>
        </div>

        {/* 1. Broadcast Harian */}
        <SectionCard
          icon={<Megaphone size={17} className="text-orange-500" />}
          title="Broadcast Harian"
          subtitle={`${menuTersedia.length} menu tersedia · otomatis dari data menu`}
          color="bg-orange-50"
        >
          {menuTersedia.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Belum ada menu yang tersedia. Aktifkan menu di halaman Menu.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Catatan tambahan (opsional)</label>
                <input
                  value={broadcastCatatan}
                  onChange={(e) => setBroadcastCatatan(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="Contoh: Pesan sebelum jam 10 siang ya!"
                />
              </div>

              {/* Preview per kategori */}
              <div className="space-y-1">
                {Object.entries(
                  menuTersedia.reduce<Record<string, typeof menuTersedia>>((acc, m) => {
                    const kat = m.kategori ?? 'lain'
                    if (!acc[kat]) acc[kat] = []
                    acc[kat].push(m)
                    return acc
                  }, {})
                ).map(([kat, items]) => (
                  <div key={kat} className="text-xs text-gray-500">
                    <span className="font-semibold">{KATEGORI_MENU[kat as keyof typeof KATEGORI_MENU]?.emoji ?? '🍽️'} {KATEGORI_MENU[kat as keyof typeof KATEGORI_MENU]?.label ?? kat}</span>
                    {' · '}{items.length} item
                  </div>
                ))}
              </div>

              <PreviewBox text={broadcastText} />

              <div className="flex gap-2">
                <CopyButton text={broadcastText} id="broadcast" className="flex-1 justify-center" />
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(broadcastText)}`, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-green-500 text-white active:scale-95 transition-transform"
                >
                  <Send size={13} /> Kirim WA
                </button>
              </div>
            </div>
          )}
        </SectionCard>

        {/* 2. Konfirmasi Order */}
        <SectionCard
          icon={<Check size={17} className="text-blue-500" />}
          title="Konfirmasi Order"
          subtitle="Kirim saat order masuk dari japri"
          color="bg-blue-50"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Pelanggan</label>
                <input
                  value={konfNama}
                  onChange={(e) => setKonfNama(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="Kak Ana"
                  list="pelanggan-list"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">No. Order</label>
                <input
                  value={konfNomor}
                  onChange={(e) => setKonfNomor(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="ORD-001"
                />
              </div>
            </div>

            <PreviewBox text={konfText} />

            <CopyButton text={konfText} id="konfirmasi" />
          </div>
        </SectionCard>

        {/* 3. Siap Diantar */}
        <SectionCard
          icon={<Navigation size={17} className="text-purple-500" />}
          title="Siap Diantar"
          subtitle="Kirim saat sushi sudah siap & mau diantar"
          color="bg-purple-50"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Pelanggan</label>
                <input
                  value={antarNama}
                  onChange={(e) => setAntarNama(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="Kak Budi"
                  list="pelanggan-list"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Alamat (opsional)</label>
                <input
                  value={antarAlamat}
                  onChange={(e) => setAntarAlamat(e.target.value)}
                  className="input-sushi text-sm"
                  placeholder="Blok C No. 5"
                />
              </div>
            </div>

            <PreviewBox text={antarText} />

            <CopyButton text={antarText} id="siap-antar" />
          </div>
        </SectionCard>

        {/* 4. Tagihan COD */}
        <SectionCard
          icon={<Receipt size={17} className="text-sushi-red" />}
          title="Tagihan COD"
          subtitle="Kirim saat menagih pembayaran COD"
          color="bg-red-50"
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Pelanggan</label>
              <input
                value={codNama}
                onChange={(e) => setCodNama(e.target.value)}
                className="input-sushi text-sm"
                placeholder="Kak Sari"
                list="pelanggan-list"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Item (format: Nama x2 - 25000)</label>
              <textarea
                value={codItems}
                onChange={(e) => setCodItems(e.target.value)}
                className="input-sushi text-sm resize-none"
                rows={3}
                placeholder={'Salmon Roll x2 - 30000\nMiso Soup - 15000'}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Total (angka)</label>
              <input
                value={codTotal}
                onChange={(e) => setCodTotal(e.target.value)}
                className="input-sushi text-sm"
                type="number"
                inputMode="numeric"
                placeholder="75000"
              />
            </div>

            <PreviewBox text={codText} />

            <CopyButton text={codText} id="tagihan-cod" />
          </div>
        </SectionCard>

        {/* 5. Follow-up */}
        <SectionCard
          icon={<Star size={17} className="text-yellow-500" />}
          title="Follow-up Pelanggan"
          subtitle="Kirim setelah order diterima untuk review"
          color="bg-yellow-50"
        >
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Nama Pelanggan</label>
              <input
                value={fuNama}
                onChange={(e) => setFuNama(e.target.value)}
                className="input-sushi text-sm"
                placeholder="Kak Rina"
                list="pelanggan-list"
              />
            </div>

            {/* Quick select dari pelanggan */}
            {pelanggan.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Pilih dari pelanggan:</p>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-0 pb-1">
                  {pelanggan.slice(0, 8).map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setFuNama(p.nama)}
                      className={cn(
                        'shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors whitespace-nowrap',
                        fuNama === p.nama
                          ? 'border-sushi-red bg-red-50 text-sushi-red'
                          : 'border-gray-200 text-gray-600'
                      )}
                    >
                      {p.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <PreviewBox text={fuText} />

            <CopyButton text={fuText} id="follow-up" />
          </div>
        </SectionCard>

        {/* Datalist pelanggan names */}
        <datalist id="pelanggan-list">
          {pelanggan.map((p) => (
            <option key={p.key} value={p.nama} />
          ))}
        </datalist>
      </div>
    </>
  )
}

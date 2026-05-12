'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import PengeluaranForm from '@/components/keuangan/PengeluaranForm'
import {
  usePengeluaran, useRekapHarian, useDeletePengeluaran,
  usePemasukanLain, useCreatePemasukanLain, useDeletePemasukanLain,
  type PeriodePengeluaran,
} from '@/hooks/useKeuangan'
import { formatRupiah, KATEGORI_PENGELUARAN } from '@/constants'
import { cn } from '@/lib/utils'
import type { Pengeluaran, KategoriPengeluaran } from '@/types'

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const PERIODE_OPTIONS: Array<{ value: PeriodePengeluaran; label: string }> = [
  { value: 'hari_ini', label: 'Hari Ini' },
  { value: 'minggu', label: '7 Hari' },
  { value: 'bulan', label: 'Bulan Ini' },
  { value: 'semua', label: 'Semua' },
]

type TabType = 'pengeluaran' | 'pemasukan'

function PengeluaranRow({ item, onEdit }: { item: Pengeluaran; onEdit: () => void }) {
  const kat = KATEGORI_PENGELUARAN[item.kategori]
  const tgl = new Date(item.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return (
    <button
      onClick={onEdit}
      className="w-full card-sushi p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
        style={{ backgroundColor: kat.warna + '15' }}
      >
        {kat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-sushi-black truncate">{item.keterangan}</p>
        <p className="text-xs text-gray-400 mt-0.5">{kat.label} · {tgl}</p>
      </div>
      <p className="text-sm font-bold text-red-500 shrink-0">{formatRupiah(item.jumlah)}</p>
    </button>
  )
}

// ─── Form Pemasukan Lain (inline sheet) ──────────────────────────────────────

function PemasukanLainForm({ onClose }: { onClose: () => void }) {
  const create = useCreatePemasukanLain()
  const [keterangan, setKeterangan] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [tanggal, setTanggal] = useState(localDate(new Date()))

  const handleSubmit = async () => {
    if (!keterangan.trim() || !jumlah || Number(jumlah) <= 0) return
    await create.mutateAsync({ tanggal, keterangan: keterangan.trim(), jumlah: Number(jumlah) })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl px-4 pt-5 pb-safe space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-1" />
        <h3 className="text-base font-bold text-sushi-black">Catat Pemasukan Lain</h3>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Keterangan</label>
          <input
            autoFocus
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="input-sushi"
            placeholder="Contoh: Modal tambahan, pengembalian uang..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Jumlah (Rp)</label>
          <input
            type="number"
            inputMode="numeric"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className="input-sushi text-lg font-semibold"
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            max={localDate(new Date())}
            onChange={(e) => setTanggal(e.target.value)}
            className="input-sushi"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!keterangan.trim() || !jumlah || Number(jumlah) <= 0 || create.isPending}
          className="btn-primary w-full py-4 rounded-2xl disabled:opacity-50"
        >
          {create.isPending ? 'Menyimpan...' : 'Simpan Pemasukan'}
        </button>
        <div className="pb-2" />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KeuanganPage() {
  const [tab, setTab] = useState<TabType>('pengeluaran')
  const [periode, setPeriode] = useState<PeriodePengeluaran>('hari_ini')
  const [filterKat, setFilterKat] = useState<KategoriPengeluaran | undefined>()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Pengeluaran | null>(null)
  const [isPemasukanFormOpen, setIsPemasukanFormOpen] = useState(false)

  const [rekapDate, setRekapDate] = useState(() => localDate(new Date()))

  const { data: pengeluaranList = [], isLoading: loadingPengeluaran } = usePengeluaran(periode, filterKat)
  const { data: pemasukanLainList = [], isLoading: loadingPemasukan } = usePemasukanLain()
  const { data: rekap } = useRekapHarian(rekapDate)
  const deletePemasukan = useDeletePemasukanLain()
  const deletePengeluaran = useDeletePengeluaran()

  const totalPengeluaran = pengeluaranList.reduce((s, p) => s + p.jumlah, 0)
  const totalPemasukanLain = pemasukanLainList.reduce((s, p) => s + p.jumlah, 0)

  const today = localDate(new Date())

  const prevDay = () => {
    const d = new Date(rekapDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    setRekapDate(localDate(d))
  }
  const nextDay = () => {
    const d = new Date(rekapDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    if (localDate(d) <= today) setRekapDate(localDate(d))
  }

  const rekapTglLabel = new Date(rekapDate + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const openEdit = (item: Pengeluaran) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  return (
    <>
      <Header title="Keuangan" />

      <div className="px-4 pt-4 pb-32 space-y-4">
        {/* Rekap Harian */}
        <div className="card-sushi p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevDay} className="p-1.5 rounded-full hover:bg-gray-100">
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <p className="text-sm font-semibold text-sushi-black">{rekapTglLabel}</p>
            <button
              onClick={nextDay}
              disabled={rekapDate >= today}
              className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>

          {!rekap ? (
            <div className="py-4 text-center text-sm text-gray-400 animate-pulse">Memuat data...</div>
          ) : rekap.totalOrder === 0 && rekap.totalPengeluaran === 0 && rekap.totalPemasukanLain === 0 ? (
            <div className="py-4 text-center text-sm text-gray-400">Belum ada transaksi hari ini</div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-green-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-green-600 font-medium">Omzet</p>
                  <p className="text-sm font-bold text-green-700 mt-0.5">{formatRupiah(rekap.omzet)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-red-600 font-medium">Pengeluaran</p>
                  <p className="text-sm font-bold text-red-500 mt-0.5">{formatRupiah(rekap.totalPengeluaran)}</p>
                </div>
                <div className={cn('rounded-xl p-2.5 text-center', rekap.labaBersih >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
                  <p className={cn('text-[10px] font-medium', rekap.labaBersih >= 0 ? 'text-blue-600' : 'text-orange-600')}>
                    Laba Bersih
                  </p>
                  <p className={cn('text-sm font-bold mt-0.5', rekap.labaBersih >= 0 ? 'text-blue-700' : 'text-orange-500')}>
                    {formatRupiah(rekap.labaBersih)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-3">
                <div>
                  <p className="text-[10px] text-gray-400">Order</p>
                  <p className="text-xs font-semibold text-sushi-black">{rekap.totalOrder}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">HPP</p>
                  <p className="text-xs font-semibold text-sushi-black">{formatRupiah(rekap.hpp)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Laba Kotor</p>
                  <p className="text-xs font-semibold text-sushi-black">{formatRupiah(rekap.labaKotor)}</p>
                </div>
              </div>

              {rekap.totalPemasukanLain > 0 && (
                <div className="mt-3 flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-emerald-700 font-medium">💰 Pemasukan Lain</p>
                  <p className="text-xs font-bold text-emerald-700">+{formatRupiah(rekap.totalPemasukanLain)}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {([['pengeluaran', '💸 Pengeluaran'], ['pemasukan', '💰 Pemasukan Lain']] as [TabType, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-semibold transition-colors',
                tab === t ? 'bg-white text-sushi-black shadow-sm' : 'text-gray-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── TAB PENGELUARAN ─── */}
        {tab === 'pengeluaran' && (
          <>
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

            <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setFilterKat(undefined)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0',
                  !filterKat ? 'bg-sushi-black text-white' : 'bg-gray-100 text-gray-600'
                )}
              >
                Semua
              </button>
              {(Object.entries(KATEGORI_PENGELUARAN) as [KategoriPengeluaran, { label: string; emoji: string; warna: string }][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFilterKat(filterKat === key ? undefined : key)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
                    filterKat === key ? 'text-white' : 'bg-gray-100 text-gray-600'
                  )}
                  style={filterKat === key ? { backgroundColor: val.warna } : {}}
                >
                  {val.emoji} {val.label}
                </button>
              ))}
            </div>

            {pengeluaranList.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-red-50 rounded-xl">
                <span className="text-sm text-red-600 font-medium">{pengeluaranList.length} pengeluaran</span>
                <span className="text-sm font-bold text-red-600">{formatRupiah(totalPengeluaran)}</span>
              </div>
            )}

            {loadingPengeluaran ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card-sushi h-16 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : pengeluaranList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">💸</p>
                <p className="font-semibold text-gray-700">Belum ada pengeluaran</p>
                <p className="text-sm text-gray-400 mt-1">
                  {periode === 'hari_ini' ? 'Belum ada pengeluaran hari ini' : 'Tidak ada data untuk periode ini'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pengeluaranList.map((item) => (
                  <PengeluaranRow key={item.id} item={item} onEdit={() => openEdit(item)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── TAB PEMASUKAN LAIN ─── */}
        {tab === 'pemasukan' && (
          <>
            {pemasukanLainList.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl">
                <span className="text-sm text-emerald-700 font-medium">{pemasukanLainList.length} pemasukan</span>
                <span className="text-sm font-bold text-emerald-700">+{formatRupiah(totalPemasukanLain)}</span>
              </div>
            )}

            {loadingPemasukan ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card-sushi h-16 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : pemasukanLainList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">💰</p>
                <p className="font-semibold text-gray-700">Belum ada pemasukan lain</p>
                <p className="text-sm text-gray-400 mt-1">Modal tambahan, pengembalian uang, dll</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pemasukanLainList.map((item) => {
                  const tgl = new Date(item.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  return (
                    <div key={item.id} className="card-sushi p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-base shrink-0">
                        💰
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-sushi-black truncate">{item.keterangan}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{tgl}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600 shrink-0">{formatRupiah(item.jumlah)}</p>
                      <button
                        onClick={() => deletePemasukan.mutate(item.id)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      {tab === 'pengeluaran' ? (
        <button
          onClick={() => { setEditingItem(null); setIsFormOpen(true) }}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-sushi-red text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      ) : (
        <button
          onClick={() => setIsPemasukanFormOpen(true)}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      )}

      <PengeluaranForm
        isOpen={isFormOpen}
        editingItem={editingItem}
        onClose={() => { setIsFormOpen(false); setEditingItem(null) }}
      />

      {isPemasukanFormOpen && (
        <PemasukanLainForm onClose={() => setIsPemasukanFormOpen(false)} />
      )}
    </>
  )
}

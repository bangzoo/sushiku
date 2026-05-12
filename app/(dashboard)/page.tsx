'use client'

import Link from 'next/link'
import { Plus, Wallet, ListOrdered, BarChart2, AlertTriangle, Clock, TrendingUp, ShoppingBag, Package, Users, MessageCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Header from '@/components/layout/Header'
import { useRekapHarian } from '@/hooks/useKeuangan'
import { useAntrian } from '@/hooks/useOrders'
import { useBahanBaku } from '@/hooks/useStok'
import { useLaporanOmzet } from '@/hooks/useLaporan'
import { useBisnisSettings } from '@/hooks/useSettings'
import { formatRupiah, formatRupiahShort } from '@/constants'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const { data: rekap } = useRekapHarian(today)
  const { data: antrian = [] } = useAntrian()
  const { data: bahanBaku = [] } = useBahanBaku()
  const { data: omzet7hari } = useLaporanOmzet('minggu')
  const { data: settings } = useBisnisSettings()

  const namaBisnis = settings?.nama_bisnis ?? 'SushiKu'
  const lowStock = bahanBaku.filter((b) => b.stok_sekarang <= b.stok_minimum)
  const pending = antrian.filter((o) => o.status === 'pending' || o.status === 'proses')

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat pagi'
    if (h < 15) return 'Selamat siang'
    if (h < 18) return 'Selamat sore'
    return 'Selamat malam'
  })()

  return (
    <>
      <Header title={namaBisnis} showSettings showBell />

      <div className="px-4 pt-4 pb-28 space-y-5">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-sushi-black">{greeting}! 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Alert stok */}
        {lowStock.length > 0 && (
          <Link href="/stok" className="flex items-center gap-2.5 bg-orange-50 border border-orange-200 rounded-2xl p-3">
            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
            <p className="text-sm text-orange-700 font-medium flex-1">
              {lowStock.filter((b) => b.stok_sekarang === 0).length > 0
                ? `${lowStock.filter((b) => b.stok_sekarang === 0).length} bahan habis`
                : `${lowStock.length} bahan hampir habis`}
              {' · '}
              <span className="font-normal">{lowStock.slice(0, 2).map((b) => b.nama).join(', ')}</span>
            </p>
            <span className="text-xs text-orange-500 font-semibold shrink-0">Lihat →</span>
          </Link>
        )}

        {/* Stats hari ini */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-sushi p-4">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-sushi-red" />
            </div>
            <p className="text-xs text-gray-500">Omzet Hari Ini</p>
            <p className="text-lg font-bold text-sushi-black mt-0.5">
              {rekap ? formatRupiah(rekap.omzet) : 'Rp 0'}
            </p>
          </div>
          <div className="card-sushi p-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
              <ShoppingBag size={18} className="text-blue-500" />
            </div>
            <p className="text-xs text-gray-500">Order Hari Ini</p>
            <p className="text-lg font-bold text-sushi-black mt-0.5">
              {rekap ? rekap.totalOrder : 0}
            </p>
          </div>
          <div className="card-sushi p-4">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mb-2">
              <Wallet size={18} className="text-green-500" />
            </div>
            <p className="text-xs text-gray-500">Laba Bersih</p>
            <p className={cn('text-lg font-bold mt-0.5', rekap && rekap.labaBersih < 0 ? 'text-red-500' : 'text-sushi-black')}>
              {rekap ? formatRupiah(rekap.labaBersih) : 'Rp 0'}
            </p>
          </div>
          <Link href="/antrian" className={cn(
            'card-sushi p-4 block',
            pending.length > 0 && 'border border-yellow-200'
          )}>
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center mb-2">
              <Clock size={18} className="text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500">Order Antrian</p>
            <p className={cn('text-lg font-bold mt-0.5', pending.length > 0 ? 'text-yellow-600' : 'text-sushi-black')}>
              {pending.length}
            </p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/kasir" className="btn-primary py-4 rounded-2xl">
              <Plus size={20} />
              <span>Order Baru</span>
            </Link>
            <Link href="/antrian" className="btn-secondary py-4 rounded-2xl">
              <ListOrdered size={20} />
              <span>Lihat Antrian</span>
            </Link>
            <Link href="/pelanggan" className="btn-secondary py-4 rounded-2xl">
              <Users size={20} />
              <span>Pelanggan</span>
            </Link>
            <Link href="/wa-tools" className="btn-secondary py-4 rounded-2xl">
              <MessageCircle size={20} />
              <span>WA Tools</span>
            </Link>
            <Link href="/keuangan" className="btn-secondary py-4 rounded-2xl">
              <Wallet size={20} />
              <span>Catat Pengeluaran</span>
            </Link>
            <Link href="/laporan" className="btn-secondary py-4 rounded-2xl">
              <BarChart2 size={20} />
              <span>Laporan</span>
            </Link>
          </div>
        </div>

        {/* Chart 7 hari */}
        {(() => {
          const peak = omzet7hari?.chartData.reduce((m, d) => d.omzet > m.omzet ? d : m, { omzet: 0, label: '' })
          const hasPeak = peak && peak.omzet > 0
          return (
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-sushi-black to-[#1a0a0a]">
              {/* Header */}
              <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">7 Hari Terakhir</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {omzet7hari ? formatRupiah(omzet7hari.totalOmzet) : 'Rp 0'}
                  </p>
                  {hasPeak && (
                    <p className="text-[11px] text-white/40 mt-0.5">
                      Puncak: <span className="text-white/70 font-semibold">{peak.label} · {formatRupiahShort(peak.omzet)}</span>
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded-xl bg-sushi-red/20 flex items-center justify-center">
                  <TrendingUp size={16} className="text-sushi-red" />
                </div>
              </div>

              {/* Chart */}
              {omzet7hari && omzet7hari.totalOmzet > 0 ? (
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={omzet7hari.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="omzetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#DC2626" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.35)', fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      dy={4}
                    />
                    <YAxis hide domain={[0, 'dataMax']} />
                    <Tooltip
                      formatter={(v: number) => [formatRupiah(v), 'Omzet']}
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 10,
                        border: 'none',
                        background: 'rgba(15,15,15,0.92)',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="omzet"
                      stroke="#DC2626"
                      strokeWidth={2}
                      fill="url(#omzetGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#DC2626', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center pb-4">
                  <p className="text-2xl mb-1">📊</p>
                  <p className="text-xs text-white/30">Belum ada data penjualan</p>
                </div>
              )}
            </div>
          )
        })()}

        {/* Stok rendah section */}
        {lowStock.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">⚠️ Stok Perlu Diisi</h3>
              <Link href="/stok" className="text-xs text-sushi-red font-semibold">Kelola →</Link>
            </div>
            <div className="space-y-2">
              {lowStock.slice(0, 3).map((b) => (
                <div key={b.id} className="card-sushi px-3 py-2.5 flex items-center gap-3">
                  <Package size={14} className="text-orange-400 shrink-0" />
                  <span className="flex-1 text-sm font-medium text-sushi-black">{b.nama}</span>
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    b.stok_sekarang === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  )}>
                    {b.stok_sekarang === 0 ? 'Habis' : `${b.stok_sekarang} ${b.satuan}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup prompt jika belum ada settings */}
        {!settings?.nama_bisnis || settings.nama_bisnis === 'SushiKu' ? (
          <div className="card-sushi p-4 border-l-4 border-sushi-red">
            <p className="text-sm font-semibold text-sushi-black mb-1">🎉 Selamat datang di SushiKu!</p>
            <p className="text-xs text-gray-500">
              Lengkapi nama bisnis, rekening, dan info lainnya agar struk dan pengaturan berjalan sempurna.
            </p>
            <Link href="/settings" className="text-xs text-sushi-red font-semibold mt-2 block">
              Lengkapi pengaturan →
            </Link>
          </div>
        ) : null}
      </div>
    </>
  )
}

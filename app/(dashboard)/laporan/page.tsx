'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import Header from '@/components/layout/Header'
import { useLaporanOmzet, useLaporanMenu, type PeriodeLaporan } from '@/hooks/useLaporan'
import { useBisnisSettings } from '@/hooks/useSettings'
import { formatRupiah, formatRupiahShort } from '@/constants'
import { cn } from '@/lib/utils'

const PERIODE_OPTIONS: Array<{ value: PeriodeLaporan; label: string }> = [
  { value: 'minggu', label: '7 Hari' },
  { value: 'bulan', label: 'Bulan Ini' },
  { value: 'bulan_lalu', label: 'Bulan Lalu' },
  { value: '3_bulan', label: '3 Bulan' },
]

type TabType = 'omzet' | 'menu'

function SkeletonCard() {
  return <div className="card-sushi h-24 animate-pulse bg-gray-100" />
}

export default function LaporanPage() {
  const [periode, setPeriode] = useState<PeriodeLaporan>('bulan')
  const [tab, setTab] = useState<TabType>('omzet')

  const { data: omzetData, isLoading: loadingOmzet } = useLaporanOmzet(periode)
  const { data: menuData = [], isLoading: loadingMenu } = useLaporanMenu(periode)
  const { data: settings } = useBisnisSettings()

  const target = settings?.target_omzet_bulanan ?? 0
  const targetPct = target > 0 && omzetData ? Math.min(100, (omzetData.totalOmzet / target) * 100) : 0

  return (
    <>
      <Header title="Laporan" />

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

        {/* Tab */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {([['omzet', '📊 Omzet & Laba'], ['menu', '🍣 Menu Terlaris']] as [TabType, string][]).map(([t, label]) => (
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

        {tab === 'omzet' && (
          <>
            {/* Summary cards */}
            {loadingOmzet ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : omzetData && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-sushi p-3">
                    <p className="text-xs text-gray-500">Total Omzet</p>
                    <p className="text-xl font-bold text-sushi-red mt-0.5">{formatRupiah(omzetData.totalOmzet)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{omzetData.totalOrder} order</p>
                  </div>
                  <div className="card-sushi p-3">
                    <p className="text-xs text-gray-500">Laba Bersih</p>
                    <p className={cn('text-xl font-bold mt-0.5', omzetData.labaBersih >= 0 ? 'text-green-600' : 'text-red-500')}>
                      {formatRupiah(omzetData.labaBersih)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Margin {omzetData.totalOmzet > 0
                        ? `${((omzetData.labaBersih / omzetData.totalOmzet) * 100).toFixed(0)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="card-sushi p-3">
                    <p className="text-xs text-gray-500">HPP</p>
                    <p className="text-lg font-bold text-sushi-black mt-0.5">{formatRupiah(omzetData.totalHPP)}</p>
                  </div>
                  <div className="card-sushi p-3">
                    <p className="text-xs text-gray-500">Avg per Order</p>
                    <p className="text-lg font-bold text-sushi-black mt-0.5">{formatRupiah(omzetData.avgPerOrder)}</p>
                  </div>
                </div>

                {/* Target omzet */}
                {target > 0 && periode === 'bulan' && (
                  <div className="card-sushi p-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-sushi-black">Target Bulanan</p>
                      <p className="text-sm font-bold text-sushi-red">{targetPct.toFixed(0)}%</p>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', targetPct >= 100 ? 'bg-green-500' : 'bg-sushi-red')}
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <p className="text-xs text-gray-400">{formatRupiah(omzetData.totalOmzet)}</p>
                      <p className="text-xs text-gray-400">Target: {formatRupiah(target)}</p>
                    </div>
                  </div>
                )}

                {/* Chart */}
                {omzetData.chartData.length > 0 && (
                  <div className="card-sushi p-4">
                    <p className="text-sm font-semibold text-sushi-black mb-3">Grafik Omzet Harian</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={omzetData.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9, fill: '#9CA3AF' }}
                          tickLine={false}
                          axisLine={false}
                          interval={Math.floor(omzetData.chartData.length / 6)}
                        />
                        <YAxis hide tickFormatter={(v) => formatRupiahShort(v)} />
                        <Tooltip
                          formatter={(v: number) => [formatRupiah(v), '']}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: '#F3F4F6' }}
                        />
                        <Bar dataKey="omzet" fill="#DC2626" radius={[3, 3, 0, 0]} name="Omzet" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Laba chart */}
                {omzetData.chartData.some((d) => d.laba !== 0) && (
                  <div className="card-sushi p-4">
                    <p className="text-sm font-semibold text-sushi-black mb-3">Grafik Laba Bersih</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={omzetData.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 9, fill: '#9CA3AF' }}
                          tickLine={false}
                          axisLine={false}
                          interval={Math.floor(omzetData.chartData.length / 6)}
                        />
                        <Tooltip
                          formatter={(v: number) => [formatRupiah(v), 'Laba']}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="laba" stroke="#10B981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Metode bayar */}
                {omzetData.totalOmzet > 0 && (
                  <div className="card-sushi p-4">
                    <p className="text-sm font-semibold text-sushi-black mb-3">Metode Pembayaran</p>
                    <div className="space-y-2.5">
                      {([
                        ['💵 Cash', omzetData.byMetode.cash],
                        ['🏦 Transfer', omzetData.byMetode.transfer],
                        ['📱 QRIS', omzetData.byMetode.qris],
                      ] as [string, number][]).map(([label, val]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 w-20 shrink-0">{label}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sushi-red rounded-full"
                              style={{ width: `${omzetData.totalOmzet > 0 ? (val / omzetData.totalOmzet) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-sushi-black w-20 text-right shrink-0">
                            {formatRupiah(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {omzetData.totalOmzet === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <p className="text-5xl mb-3">📊</p>
                    <p className="font-semibold text-gray-700">Belum ada data</p>
                    <p className="text-sm text-gray-400 mt-1">Mulai jualan untuk melihat laporan</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {tab === 'menu' && (
          <>
            {loadingMenu ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="card-sushi h-14 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : menuData.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-5xl mb-3">🍣</p>
                <p className="font-semibold text-gray-700">Belum ada data menu</p>
                <p className="text-sm text-gray-400 mt-1">Data akan muncul setelah ada order</p>
              </div>
            ) : (
              <div className="space-y-2">
                {menuData.map((item, i) => (
                  <div key={item.nama} className="card-sushi p-3.5 flex items-center gap-3">
                    <span className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      i === 0 ? 'bg-yellow-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-white' :
                      i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-500'
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sushi-black truncate">{item.nama}</p>
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sushi-red rounded-full"
                          style={{ width: `${menuData[0] ? (item.qty / menuData[0].qty) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-sushi-black">{item.qty}×</p>
                      <p className="text-xs text-gray-400">{formatRupiah(item.omzet)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

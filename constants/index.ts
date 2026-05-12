import type { KategoriMenu, KategoriPengeluaran, KategoriBahan, SatuanBahan } from '@/types'

// ─── Brand ───────────────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  red: '#DC2626',
  black: '#0F0F0F',
  cream: '#FAF7F2',
  surface: '#F3F4F6',
  white: '#FFFFFF',
} as const

// ─── Kategori Menu ───────────────────────────────────────────────────────────

export const KATEGORI_MENU: Record<KategoriMenu, { label: string; emoji: string }> = {
  nigiri:   { label: 'Nigiri',    emoji: '🍣' },
  maki:     { label: 'Maki',      emoji: '🌀' },
  sashimi:  { label: 'Sashimi',   emoji: '🐟' },
  roll:     { label: 'Roll',      emoji: '🍱' },
  set_menu: { label: 'Set Menu',  emoji: '🎁' },
  minuman:  { label: 'Minuman',   emoji: '🍵' },
  tambahan: { label: 'Tambahan',  emoji: '➕' },
}

// ─── Kategori Pengeluaran ────────────────────────────────────────────────────

export const KATEGORI_PENGELUARAN: Record<KategoriPengeluaran, { label: string; emoji: string; warna: string }> = {
  bahan_baku:   { label: 'Bahan Baku',   emoji: '🛒', warna: '#EF4444' },
  operasional:  { label: 'Operasional',  emoji: '🔥', warna: '#F97316' },
  kemasan:      { label: 'Kemasan',      emoji: '📦', warna: '#EAB308' },
  transport:    { label: 'Transport',    emoji: '🚗', warna: '#22C55E' },
  promosi:      { label: 'Promosi',      emoji: '📱', warna: '#3B82F6' },
  lain:         { label: 'Lain-lain',    emoji: '💰', warna: '#8B5CF6' },
}

// ─── Kategori Bahan Baku ─────────────────────────────────────────────────────

export const KATEGORI_BAHAN: Record<KategoriBahan, { label: string; emoji: string }> = {
  ikan_seafood: { label: 'Ikan & Seafood', emoji: '🐠' },
  sayuran:      { label: 'Sayuran',        emoji: '🥬' },
  bahan_dasar:  { label: 'Bahan Dasar',    emoji: '🍚' },
  bumbu:        { label: 'Bumbu',          emoji: '🧂' },
  kemasan:      { label: 'Kemasan',        emoji: '📦' },
}

// ─── Satuan Bahan ────────────────────────────────────────────────────────────

export const SATUAN_BAHAN: SatuanBahan[] = ['gram', 'kg', 'pcs', 'lembar', 'botol', 'pack', 'liter', 'ml']

// ─── Status Order ────────────────────────────────────────────────────────────

export const STATUS_ORDER = {
  pending:  { label: 'Pending',   warna: '#F59E0B', bg: '#FEF3C7' },
  proses:   { label: 'Diproses',  warna: '#3B82F6', bg: '#DBEAFE' },
  selesai:  { label: 'Selesai',   warna: '#10B981', bg: '#D1FAE5' },
  batal:    { label: 'Dibatal',   warna: '#EF4444', bg: '#FEE2E2' },
} as const

// ─── Metode Bayar ────────────────────────────────────────────────────────────

export const METODE_BAYAR = {
  cash:     { label: 'Cash',      emoji: '💵' },
  transfer: { label: 'Transfer',  emoji: '🏦' },
  qris:     { label: 'QRIS',      emoji: '📱' },
} as const

// ─── Format Rupiah ───────────────────────────────────────────────────────────

export const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka)
}

export const formatRupiahShort = (angka: number): string => {
  if (angka >= 1_000_000) return `Rp ${(angka / 1_000_000).toFixed(1)}jt`
  if (angka >= 1_000)     return `Rp ${(angka / 1_000).toFixed(0)}rb`
  return `Rp ${angka}`
}

// ─── Template WhatsApp ───────────────────────────────────────────────────────

export const WA_TEMPLATE = {
  struk: (params: {
    namaBisnis: string
    namaCustomer: string
    nomorOrder: string
    items: Array<{ nama: string; qty: number; harga: number }>
    total: number
    metodeBayar: string
    kembalian?: number
  }) => {
    const itemLines = params.items
      .map(i => `  • ${i.nama} x${i.qty} — ${formatRupiah(i.harga * i.qty)}`)
      .join('\n')
    return `🍣 *${params.namaBisnis}*

Halo ${params.namaCustomer}!
Terima kasih sudah order ya 😊

📋 *Detail Order #${params.nomorOrder}*
${itemLines}
─────────────────
💰 *Total: ${formatRupiah(params.total)}*
💳 Bayar via: ${params.metodeBayar}${params.kembalian ? `\n💵 Kembalian: ${formatRupiah(params.kembalian)}` : ''}

Pesanan sedang disiapkan!
Est. selesai: 15-20 menit 🍱`
  },

  konfirmasi: (namaCustomer: string, nomorOrder: string) =>
    `Halo ${namaCustomer}! 👋\nOrder #${nomorOrder} sudah kami terima ya.\nSedang kami siapkan, estimasi 15-20 menit 🍣`,

  siap: (namaCustomer: string) =>
    `Halo ${namaCustomer}! 🎉\nPesanan kamu sudah siap! Silakan diambil ya 😊🍱`,

  followUp: (namaCustomer: string) =>
    `Halo ${namaCustomer}! 😊\nGimana pesanan sushi-nya tadi? Enak? 🍣\nKalau ada saran atau kritik, boleh kasih tau kita ya!\nSampai ketemu lagi! 👋`,

  broadcast: (params: {
    namaBisnis: string
    items: Array<{ nama: string; harga: number; kategori?: string }>
    catatan?: string
  }) => {
    const lines = params.items
      .map(i => `• ${i.nama} — ${formatRupiah(i.harga)}`)
      .join('\n')
    const catatan = params.catatan ? `\n📝 ${params.catatan}` : ''
    const now = new Date()
    const hari = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    return `🍣 *${params.namaBisnis}*
📅 ${hari}

Assalamualaikum, halo semuanya! 👋
Hari ini ada menu sushi segar nih~ 😋

*🍱 Menu Hari Ini:*
${lines}${catatan}

Mau pesan? Langsung japri ya! 📩
Stok terbatas, first come first served 🙏`
  },

  siapAntar: (namaCustomer: string, alamat?: string) => {
    const loc = alamat ? `\n📍 Alamat: ${alamat}` : ''
    return `Halo ${namaCustomer}! 🛵\nPesanan kamu sudah siap diantar ya!${loc}\nEstimasi sampai 10-15 menit 🍱\nSiapkan pembayarannya ya, terima kasih! 😊`
  },

  tagihanCOD: (params: {
    namaCustomer: string
    items: Array<{ nama: string; qty: number; harga: number }>
    total: number
  }) => {
    const lines = params.items
      .map(i => `  • ${i.nama}${i.qty > 1 ? ` x${i.qty}` : ''} — ${formatRupiah(i.harga * i.qty)}`)
      .join('\n')
    return `Halo ${params.namaCustomer}! 😊
Ini detail pesanannya ya:

${lines}
──────────────
💰 *Total: ${formatRupiah(params.total)}*

Bisa transfer ke rekening atau bayar cash saat diterima ya 🙏
Terima kasih sudah order! 🍣`
  },
}

// ─── Lokasi File ─────────────────────────────────────────────────────────────

export const STORAGE_BUCKETS = {
  menuFotos: 'menu-fotos',
  buktiBayar: 'bukti-bayar',
  logo: 'bisnis-logo',
} as const

// ─── Threshold Label Pelanggan ───────────────────────────────────────────────

export const THRESHOLD_PELANGGAN = {
  vip: { minOrder: 10, minBelanja: 500_000 },
  regular: { minOrder: 3 },
} as const

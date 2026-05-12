// ─── Menu ────────────────────────────────────────────────────────────────────

export type KategoriMenu =
  | 'nigiri'
  | 'maki'
  | 'sashimi'
  | 'roll'
  | 'set_menu'
  | 'minuman'
  | 'tambahan'

export interface MenuItem {
  id: string
  nama: string
  deskripsi?: string
  harga_jual: number
  harga_modal: number
  kategori: KategoriMenu
  foto_url?: string
  tersedia: boolean
  urutan_tampil: number
  created_at: string
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type TipeOrder = 'walkin' | 'whatsapp'
export type MetodeBayar = 'cash' | 'transfer' | 'qris'
export type StatusOrder = 'pending' | 'proses' | 'selesai' | 'batal'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  nama_item: string
  harga_satuan: number
  harga_modal: number
  jumlah: number
  catatan_item?: string
  subtotal: number
}

export interface Order {
  id: string
  nomor_order: string
  tanggal: string
  waktu: string
  tipe: TipeOrder
  nama_customer?: string
  nomor_wa?: string
  customer_id?: string
  items_json: OrderItem[]
  catatan_order?: string
  total_harga: number
  metode_bayar: MetodeBayar
  status: StatusOrder
  dibayar: boolean
  alasan_batal?: string
  created_at: string
}

// ─── Stok ────────────────────────────────────────────────────────────────────

export type SatuanBahan = 'gram' | 'kg' | 'pcs' | 'lembar' | 'botol' | 'pack' | 'liter' | 'ml'
export type KategoriBahan = 'ikan_seafood' | 'sayuran' | 'bahan_dasar' | 'bumbu' | 'kemasan'
export type JenisStokLog = 'masuk' | 'keluar' | 'koreksi'

export interface BahanBaku {
  id: string
  nama: string
  satuan: SatuanBahan
  stok_sekarang: number
  stok_minimum: number
  harga_per_satuan: number
  kategori: KategoriBahan
  created_at: string
  updated_at: string
}

export interface StokLog {
  id: string
  bahan_baku_id: string
  jenis: JenisStokLog
  jumlah: number
  keterangan?: string
  harga_total?: number
  created_at: string
}

export interface Resep {
  id: string
  menu_item_id: string
  bahan_baku_id: string
  jumlah_pakai: number  // per 1 porsi
  created_at: string
}

// ─── Keuangan ────────────────────────────────────────────────────────────────

export type KategoriPengeluaran =
  | 'bahan_baku'
  | 'operasional'
  | 'kemasan'
  | 'transport'
  | 'promosi'
  | 'lain'

export interface Pengeluaran {
  id: string
  tanggal: string
  kategori: KategoriPengeluaran
  keterangan: string
  jumlah: number
  bukti_url?: string
  created_at: string
}

export interface PemasukanLain {
  id: string
  tanggal: string
  keterangan: string
  jumlah: number
  created_at: string
}

// ─── Pelanggan ───────────────────────────────────────────────────────────────

export type LabelPelanggan = 'vip' | 'regular' | 'baru'

export interface Customer {
  id: string
  nama: string
  nomor_wa?: string
  alamat?: string
  total_order: number
  total_belanja: number
  pertama_order?: string
  terakhir_order?: string
  catatan?: string
  created_at: string
  label?: LabelPelanggan
}

// ─── Daily Summary ───────────────────────────────────────────────────────────

export interface DailySummary {
  id: string
  tanggal: string
  total_order: number
  total_omzet: number
  total_cash: number
  total_transfer: number
  hpp_total: number
  laba_kotor: number
  pengeluaran_operasional: number
  laba_bersih: number
  created_at: string
}

// ─── Settings Bisnis ─────────────────────────────────────────────────────────

export interface BisnisSettings {
  nama_bisnis: string
  logo_url?: string
  alamat?: string
  nomor_wa_bisnis?: string
  rekening_bank?: string
  nomor_rekening?: string
  nama_rekening?: string
  nomor_qris?: string
  target_omzet_bulanan?: number
  jam_buka?: string
  jam_tutup?: string
}

// ─── Kasir (local state) ─────────────────────────────────────────────────────

export interface CartItem {
  menu_item_id: string
  nama_item: string
  harga_satuan: number
  harga_modal: number
  jumlah: number
  catatan_item?: string
  foto_url?: string
}

export interface KasirState {
  tipe_order: TipeOrder | null
  nama_customer?: string
  nomor_wa?: string
  cart: CartItem[]
  catatan_order?: string
}

// ─── Notifikasi Push ─────────────────────────────────────────────────────────

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

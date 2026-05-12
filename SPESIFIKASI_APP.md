# SushiKu — Spesifikasi Aplikasi Lengkap
**Progressive Web App (PWA) Manajemen Bisnis Sushi Rumahan**
Versi 1.0 | Solo Owner UMKM | iPhone Safari + Android Chrome

---

## 1. RINGKASAN BISNIS

| Item | Detail |
|------|--------|
| Nama App | SushiKu |
| Jenis Bisnis | Sushi rumahan, UMKM solo owner |
| Channel Order | WhatsApp + Walk-in langsung |
| Pembayaran | Cash · Transfer Bank · QRIS |
| Platform | PWA — install ke Home Screen iPhone tanpa App Store |
| Target Utama | Owner bisa kelola bisnis dari 1 app, berjalan < 15 detik per order |

---

## 2. STACK TEKNOLOGI

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Database Cloud | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Database Lokal | IndexedDB via Dexie.js (offline support) |
| State Global | Zustand |
| Data Fetching | TanStack React Query v5 |
| Charts | Recharts |
| PDF Export | jsPDF + html2canvas |
| PWA | next-pwa (manifest + service worker) |
| Push Notif | Web Push API via `web-push` |
| Deploy | Vercel (gratis, auto-deploy dari GitHub) |
| Icons | Lucide React |

### Supabase Project
- **Project Ref:** `gpodzjzzybhpuiwzdowt`
- **URL:** `https://gpodzjzzybhpuiwzdowt.supabase.co`

---

## 3. BRAND & DESIGN SYSTEM

### Warna
```
Merah Jepang  : #DC2626  → aksen utama, tombol CTA
Hitam Elegan  : #0F0F0F  → teks utama
Krem Hangat   : #FAF7F2  → background halaman
Abu Lembut    : #F3F4F6  → surface / card secondary
Putih         : #FFFFFF  → card utama
```

### Prinsip UI
- **Mobile-first** — semua didesain untuk layar HP 375px ke atas
- **Touch-friendly** — semua tombol minimal 44×44px (Apple HIG)
- **Cepat** — kasir harus bisa catat order dalam < 15 detik
- **Bahasa** — Indonesia casual & friendly
- **Vibe** — modern, bersih, sedikit Japanese aesthetic

### Komponen CSS Global
```css
.card-sushi     → white card, rounded-2xl, shadow-sm
.btn-primary    → merah #DC2626, text putih, min-h 48px
.btn-secondary  → abu #F3F4F6, text hitam, min-h 48px
.input-sushi    → border abu, focus ring merah, min-h 48px
.bottom-nav     → fixed bottom, height 64px + safe-area
.page-container → pb calc(80px + safe-area)
```

---

## 4. ARSITEKTUR DATABASE (Supabase)

### Tabel Utama

#### `menu_items`
```
id             uuid PK
nama           text NOT NULL
deskripsi      text
harga_jual     integer NOT NULL
harga_modal    integer NOT NULL
kategori       enum: nigiri|maki|sashimi|roll|set_menu|minuman|tambahan
foto_url       text
tersedia       boolean DEFAULT true
urutan_tampil  integer DEFAULT 0
deleted_at     timestamptz  ← soft delete
created_at     timestamptz
```

#### `orders`
```
id             uuid PK
nomor_order    text UNIQUE (format: ORD-YYYYMMDD-XXX)
tanggal        date
waktu          time
tipe           enum: walkin|whatsapp
nama_customer  text
nomor_wa       text
customer_id    uuid FK → customers
items_json     jsonb  ← snapshot item saat order
catatan_order  text
total_harga    integer
metode_bayar   enum: cash|transfer|qris
status         enum: pending|proses|selesai|batal
dibayar        boolean DEFAULT false
alasan_batal   text
created_at     timestamptz
```

#### `order_items`
```
id             uuid PK
order_id       uuid FK → orders (cascade delete)
menu_item_id   uuid FK → menu_items
nama_item      text  ← snapshot nama saat order
harga_satuan   integer
jumlah         integer
catatan_item   text
subtotal       integer
```

#### `customers`
```
id             uuid PK
nama           text
nomor_wa       text
alamat         text
total_order    integer DEFAULT 0
total_belanja  integer DEFAULT 0
pertama_order  date
terakhir_order date
catatan        text
poin           integer DEFAULT 0
created_at     timestamptz
```

#### `bahan_baku`
```
id               uuid PK
nama             text
satuan           enum: gram|kg|pcs|lembar|botol|pack|liter|ml
stok_sekarang    numeric(10,2)
stok_minimum     numeric(10,2)
harga_per_satuan integer
kategori         enum: ikan_seafood|sayuran|bahan_dasar|bumbu|kemasan
created_at       timestamptz
updated_at       timestamptz (auto via trigger)
```

#### `stok_log`
```
id             uuid PK
bahan_baku_id  uuid FK → bahan_baku
jenis          enum: masuk|keluar|koreksi
jumlah         numeric(10,2)
keterangan     text
harga_total    integer
created_at     timestamptz
```

#### `pengeluaran`
```
id          uuid PK
tanggal     date
kategori    enum: bahan_baku|operasional|kemasan|transport|promosi|lain
keterangan  text NOT NULL
jumlah      integer
bukti_url   text
created_at  timestamptz
```

#### `pemasukan_lain`
```
id          uuid PK
tanggal     date
keterangan  text NOT NULL
jumlah      integer
created_at  timestamptz
```

#### `daily_summary` (auto via trigger)
```
id                      uuid PK
tanggal                 date UNIQUE
total_order             integer
total_omzet             integer
total_cash              integer
total_transfer          integer
hpp_total               integer
laba_kotor              integer
pengeluaran_operasional integer
laba_bersih             integer
created_at              timestamptz
```

#### `bisnis_settings` (1 row only)
```
id                    uuid PK
nama_bisnis           text DEFAULT 'SushiKu'
logo_url              text
alamat                text
nomor_wa_bisnis       text
rekening_bank         text
nomor_rekening        text
nama_rekening         text
nomor_qris            text
target_omzet_bulanan  integer
jam_buka              text DEFAULT '08:00'
jam_tutup             text DEFAULT '21:00'
onboarding_done       boolean DEFAULT false
updated_at            timestamptz
```

#### `push_subscriptions`
```
id          uuid PK
endpoint    text UNIQUE
p256dh      text
auth        text
created_at  timestamptz
```

### Triggers Database
1. `trg_bahan_baku_updated_at` — auto update `updated_at` di bahan_baku
2. `trg_order_update_customer` — update stats pelanggan saat order selesai
3. `trg_order_daily_summary` — upsert daily_summary saat order selesai & dibayar

### Row Level Security
- Semua tabel RLS enabled
- Policy `allow_all` (using true) — app single owner, proteksi via anon key

---

## 5. OFFLINE SUPPORT (Dexie.js / IndexedDB)

### Tabel Lokal (lib/db.ts)
- `menu_items` — mirror dari Supabase
- `orders` — order yang belum sync
- `order_items` — detail order offline
- `pengeluaran` — pengeluaran offline
- `bahan_baku` — stok bahan offline
- `sync_queue` — antrian operasi yang belum ter-sync

### Strategi Sync
- **Online:** fetch dari Supabase → update IndexedDB cache
- **Offline:** baca dari IndexedDB, tulis ke sync_queue
- **Reconnect:** `window.addEventListener('online', syncToSupabase)`
- **Konflik:** last-write-wins berdasarkan timestamp

---

## 6. PWA REQUIREMENTS

### Wajib untuk iOS Safari
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="SushiKu">
```

### manifest.json
- `display: standalone`
- Icons semua ukuran: 72, 96, 128, 144, 152, 192, 384, 512
- `theme_color: #DC2626`
- `start_url: /`
- `orientation: portrait`

### Service Worker (next-pwa)
- Network-first untuk Supabase API calls
- Cache-first untuk static assets & gambar
- Offline fallback page (`/offline`)

### Install Prompt
- Komponen `InstallPrompt.tsx` muncul di Safari
- Instruksi: "Tap ikon Share → Add to Home Screen"
- Dismiss → muncul lagi setelah 3 hari
- Detect `standalone` mode → sembunyikan prompt

---

## 7. FITUR PER TAHAP

---

### ✅ TAHAP 1 — FONDASI PWA + DATABASE + SETUP
**Status: SELESAI**

- [x] Struktur folder Next.js 14 App Router
- [x] package.json semua dependencies
- [x] PWA setup (manifest, service worker, meta tags)
- [x] InstallPrompt.tsx
- [x] Database schema Supabase (migration SQL)
- [x] Sample data 15+ menu sushi
- [x] Dexie.js IndexedDB + sync queue
- [x] TypeScript types lengkap
- [x] Constants (formatRupiah, WA template, kategori)
- [x] Supabase client & server helpers
- [x] Layout: Header, BottomNav, OfflineIndicator
- [x] Dashboard halaman (skeleton)
- [x] `.env.local` dengan Supabase credentials

---

### ✅ TAHAP 2 — MANAJEMEN MENU SUSHI
**Status: SELESAI**

#### Halaman `/menu`
- [x] Grid 2 kolom semua menu
- [x] Filter horizontal scroll per kategori: Semua | Nigiri | Maki | Sashimi | Roll | Set Menu | Minuman | Tambahan
- [x] Search by nama
- [x] Summary chips (tersedia / nonaktif / total)
- [x] Toggle tersedia/tidak tersedia (optimistic update)
- [x] Empty state friendly
- [x] Skeleton loading

#### FAB & Form Tambah/Edit
- [x] FAB `+` fixed bottom-right
- [x] Full-screen form dengan:
  - Upload foto (kamera / galeri)
  - Nama menu (required)
  - Kategori dropdown
  - Deskripsi (opsional)
  - Harga jual + harga modal
  - **Kalkulasi margin otomatis** (laba per item + %)
  - Urutan tampil
  - Toggle tersedia
- [x] Validasi Zod + react-hook-form
- [x] Loading state saat submit

#### Detail Bottom Sheet
- [x] Tap menu → slide up sheet
- [x] Foto besar + info lengkap
- [x] Cards: harga jual / modal / margin
- [x] Statistik bulan ini (placeholder)
- [x] Tombol: Aktifkan/Nonaktifkan, Edit, Hapus
- [x] Soft delete (tetap ada di riwayat order)

#### Analisis Menu
- [x] Top terlaris (placeholder sampai ada order)
- [x] Menu dengan margin tertinggi (top 3)
- [x] Alert menu nonaktif

#### Komponen Reusable
- [x] `MenuCard.tsx` — dipakai juga di Kasir (mode: list/kasir)
- [x] `MenuForm.tsx`
- [x] `ImageUpload.tsx` — upload ke Supabase Storage
- [x] `MenuDetailSheet.tsx`

#### Hooks & Store
- [x] `hooks/useMenu.ts` — React Query CRUD
- [x] `store/menuStore.ts` — Zustand UI state

---

### 🔲 TAHAP 3 — KASIR & CATAT ORDER
**Status: BELUM**

#### Halaman `/kasir`
- [ ] Layout 2 bagian: Grid Menu (atas) + Keranjang Panel (bawah sticky)
- [ ] Tap menu → +1 ke keranjang dengan animasi
- [ ] Long press → modal pilih jumlah (1-50)
- [ ] Badge counter di card jika di keranjang
- [ ] Filter kategori horizontal scroll
- [ ] Search menu
- [ ] Menu tidak tersedia → tampil redup, tidak bisa di-tap

#### Pilih Tipe Order
- [ ] Modal muncul sebelum order pertama:
  - 🚶 Walk-in (nama opsional)
  - 📱 WhatsApp Order (nama + nomor WA wajib)

#### Keranjang
- [ ] Panel sticky bottom → expand full-screen
- [ ] List item: nama, qty ±, hapus, catatan per item
- [ ] Total harga realtime
- [ ] Tombol [Bayar Sekarang] merah besar

#### Layar Pembayaran
- [ ] Total besar dan jelas
- [ ] Pilih metode: Cash | Transfer | QRIS
- [ ] Cash → input uang diterima → tampil kembalian
- [ ] Transfer/QRIS → tampil info rekening dari settings
- [ ] Catatan order (opsional)
- [ ] Tombol [Selesaikan Order]
- [ ] Animasi sukses + konfeti kecil

#### Struk Digital
- [ ] Tampil setelah order selesai
- [ ] Nomor order, tanggal, jam, list item, total, metode, kembalian
- [ ] Tombol [Kirim ke WhatsApp Customer]
  ```
  Format pesan:
  🍣 *[Nama Bisnis]*
  Halo [Nama]! Terima kasih sudah order 😊
  📋 *Detail Order #XXX*
  • [Item] x[qty] — Rp [harga]
  ─────────────
  💰 *Total: Rp XXX*
  Pesanan sedang disiapkan! Est. 15-20 menit 🍱
  ```
- [ ] Tombol [Order Baru] → reset kasir

#### Antrian Order `/antrian`
- [ ] List order status "proses"
- [ ] Warna kartu: hijau (<15 mnt) | kuning (15-30 mnt) | merah (>30 mnt)
- [ ] Tap → detail + tombol [Tandai Selesai]
- [ ] Push notif saat order WhatsApp baru

#### Riwayat Order `/riwayat`
- [ ] List semua order, terbaru di atas
- [ ] Filter: hari ini | minggu | bulan | semua
- [ ] Filter tipe: walk-in | WhatsApp | semua
- [ ] Search by nama customer / nomor order
- [ ] Tap → detail order + opsi batalkan (dengan alasan)
- [ ] Infinite scroll

#### Offline Support
- [ ] Menu tersimpan IndexedDB → kasir jalan tanpa internet
- [ ] Order tersimpan lokal jika offline
- [ ] Indikator "Offline Mode" di header
- [ ] Auto-sync saat koneksi kembali

---

### 🔲 TAHAP 4 — MANAJEMEN STOK BAHAN BAKU
**Status: BELUM**

#### Halaman `/stok`
- [ ] List bahan dengan indikator stok:
  - 🟢 Hijau: stok aman (> min × 2)
  - 🟡 Kuning: stok menipis (antara min dan min×2)
  - 🔴 Merah: stok kritis (≤ min) + badge "Perlu Beli!"
- [ ] Summary: "X bahan kritis, Y bahan menipis"
- [ ] Sort: nama | kritis dulu | kategori
- [ ] Search bahan
- [ ] FAB tambah bahan baru

#### Form Tambah Bahan
- [ ] Nama, kategori, satuan, stok awal, stok minimum, harga/satuan

#### Update Stok
- [ ] Stok Masuk (belanja) → jumlah, harga total, tanggal, keterangan
  - Auto catat ke pengeluaran kategori `bahan_baku`
- [ ] Stok Keluar (pemakaian) → jumlah, link order, keterangan
- [ ] Koreksi Stok → jumlah aktual, alasan wajib

#### Riwayat Stok
- [ ] Per bahan: timeline masuk/keluar
- [ ] Total masuk vs keluar bulan ini

#### Alert & Daftar Belanja
- [ ] Push notif saat stok turun ke minimum
- [ ] Halaman "Perlu Dibeli" — list bahan kritis
- [ ] Tombol [Buat Daftar Belanja] → generate teks share via WhatsApp

#### Kalkulasi HPP Otomatis
- [ ] Link menu ke bahan baku (berapa gram/pcs dipakai)
- [ ] Auto kalkulasi HPP dari harga bahan terkini
- [ ] Update harga modal di menu secara otomatis

---

### 🔲 TAHAP 5 — KEUANGAN & PETTY CASH
**Status: BELUM**

#### Halaman `/keuangan`
- [ ] 4 kartu summary: pemasukan hari ini | pengeluaran | laba bersih | saldo kas
- [ ] List pengeluaran + pemasukan lain hari ini

#### Catat Pengeluaran
- [ ] Kategori: 🛒 Bahan Baku | 📦 Kemasan | 🔥 Operasional | 🚗 Transport | 📱 Promosi | 💰 Lain
- [ ] Field: kategori, jumlah (Rp), keterangan, foto bukti struk, tanggal
- [ ] Kategori bahan_baku bisa input manual atau auto dari Tahap 4

#### Catat Pemasukan Lain
- [ ] Modal tambahan, pengembalian uang, dll
- [ ] Field: keterangan, jumlah, tanggal

#### Rekap Harian `/keuangan/rekap`
- [ ] Breakdown pemasukan: cash | transfer | pemasukan lain | TOTAL
- [ ] Breakdown pengeluaran per kategori | TOTAL
- [ ] Hasil: Laba Bersih + Margin %
- [ ] Export PDF laporan harian

#### Formula Keuangan
```
HPP Total    = Σ (harga_modal × jumlah) dari semua order selesai
Laba Kotor   = Total Omzet - HPP Total
Laba Bersih  = Laba Kotor - Pengeluaran Operasional - Kemasan - Transport - Promosi - Lain
Margin       = (Laba Bersih / Total Omzet) × 100%
```

---

### 🔲 TAHAP 6 — LAPORAN & ANALISIS BISNIS
**Status: BELUM**

#### Laporan Mingguan `/laporan/mingguan`
- [ ] Bar chart omzet per hari (7 hari)
- [ ] Line chart laba bersih per hari
- [ ] Hari terbaik & paling sepi
- [ ] Perbandingan vs minggu lalu (%)
- [ ] Rata-rata order/hari + Average Order Value

#### Laporan Bulanan `/laporan/bulanan`
- [ ] Grafik tren omzet per minggu
- [ ] Pie chart omzet per kategori menu
- [ ] Pie chart pengeluaran per kategori
- [ ] Perbandingan bulan ini vs bulan lalu
- [ ] Total order, pelanggan unik, repeat customer %
- [ ] Best seller top 5 + bottom 3 menu

#### Analisis Menu `/laporan/menu`
- [ ] Tabel ranking: nama | qty | omzet | margin | rating
- [ ] Filter: minggu ini | bulan ini | semua waktu
- [ ] Sort: terlaris | omzet tertinggi | margin tertinggi
- [ ] Rekomendasi rule-based:
  - Margin >50% tapi penjualan rendah → rekomendasikan promo
  - Tidak terjual 14 hari → pertimbangkan hapus
  - Menu terlaris + stok bahan kritis → alert beli bahan

#### Analisis Waktu
- [ ] Heatmap jam ramai (per jam)
- [ ] Per hari dalam seminggu
- [ ] Insight otomatis: "Order terbanyak Jumat-Minggu jam 11-13"

#### Target & Pencapaian
- [ ] Set target omzet bulanan di settings
- [ ] Progress bar pencapaian
- [ ] Estimasi akhir bulan

#### Export PDF
- [ ] Cover page + executive summary
- [ ] Detail tabel + grafik
- [ ] Rekomendasi bisnis dari data

---

### 🔲 TAHAP 7 — FITUR PELANGGAN & ORDER WHATSAPP
**Status: BELUM**

#### Database Pelanggan `/pelanggan`
- [ ] List: nama, nomor WA, total order, total belanja, terakhir order, label
- [ ] Label otomatis: VIP (>10 order atau >Rp 500rb) | Regular (3-10x) | Baru (<3x)
- [ ] Search nama / nomor WA
- [ ] Tap → profil lengkap

#### Profil Pelanggan
- [ ] Stats: total order, total belanja, menu favorit
- [ ] Riwayat semua order
- [ ] Tombol [Chat WhatsApp] → buka WA
- [ ] Catatan (alergi, preferensi)
- [ ] Tombol [Kirim Promo] → generate pesan personal

#### WA Tools `/wa-tools`

**A. Generator Menu Digital**
- [ ] Generate teks menu rapi untuk di-share ke WA grup
- [ ] Auto update saat ada perubahan menu/harga
- [ ] Format:
  ```
  🍣 *MENU SUSHI [NAMA BISNIS]*
  
  *NIGIRI*
  • Salmon Nigiri — Rp 15.000/pcs
  ...
  ```

**B. Template Pesan Cepat**
- [ ] Konfirmasi order diterima
- [ ] Estimasi waktu siap
- [ ] Struk pembayaran
- [ ] Konfirmasi pembayaran diterima
- [ ] Pesanan siap
- [ ] Follow-up kepuasan
- [ ] Semua bisa dikustomisasi

**C. Quick Reply Generator**
- [ ] Input nomor order → generate semua pesan untuk order itu

#### Program Loyalitas
- [ ] Rp 10.000 = 1 poin
- [ ] 100 poin = diskon Rp 10.000
- [ ] Catat poin di profil pelanggan
- [ ] Redeem poin saat bayar
- [ ] Generate pesan poin ke WA

#### Broadcast Promo
- [ ] Target: semua | VIP | Regular | Baru
- [ ] Template: flash sale | menu baru | hari spesial
- [ ] Generate teks → paste ke WA
- [ ] History promo yang pernah dikirim

---

### 🔲 TAHAP 8 — DASHBOARD OWNER + POLISH + DEPLOY
**Status: BELUM**

#### Dashboard Real-time `/`
- [ ] Greeting dinamis (Selamat pagi/siang/sore/malam)
- [ ] 4 kartu: Omzet hari ini | Order hari ini | Laba bersih | Order pending
- [ ] Alert stok kritis
- [ ] Alert order pending >30 menit
- [ ] Bar chart omzet 7 hari (compact Recharts)
- [ ] Quick Actions: Order Baru | Pengeluaran | Antrian | Laporan
- [ ] Aktivitas terbaru (5 order terakhir)

#### Settings `/settings`
- [ ] Profil bisnis: nama, logo, alamat, nomor WA
- [ ] Info rekening bank + QRIS
- [ ] Target omzet bulanan
- [ ] Jam operasional
- [ ] Notifikasi on/off per kategori
- [ ] Export data CSV semua tabel
- [ ] Reset data (konfirmasi 2x)
- [ ] Tentang app + versi

#### Onboarding Flow (3 step, tidak bisa skip)
- [ ] Step 1: Nama bisnis + upload logo
- [ ] Step 2: Info rekening bank / QRIS
- [ ] Step 3: Tambah minimal 1 menu
- [ ] Selesai → ke dashboard + tour singkat

#### Polish UI
- [ ] Skeleton loading setiap halaman
- [ ] Empty state friendly semua halaman
- [ ] Error state informatif (bukan error code)
- [ ] Format Rupiah konsisten semua angka
- [ ] Animasi transisi halaman smooth
- [ ] Pull-to-refresh di semua list

#### Deploy ke Vercel
- [ ] Push ke GitHub
- [ ] Connect ke Vercel
- [ ] Set environment variables
- [ ] Generate VAPID keys untuk Web Push
- [ ] Custom domain (opsional)
- [ ] Test PWA di iPhone Safari
- [ ] Checklist pre-launch

---

## 8. NAVIGASI UTAMA

### Bottom Navigation (5 tab)
```
🏠 Home    → /
🍱 Kasir   → /kasir
📦 Stok    → /stok
💰 Keuangan → /keuangan
📊 Laporan  → /laporan
```

### Sub-routes
```
/kasir
/antrian
/riwayat
/menu
/stok
/keuangan
/keuangan/rekap
/laporan
/laporan/mingguan
/laporan/bulanan
/laporan/menu
/pelanggan
/wa-tools
/settings
/offline
```

---

## 9. STRUKTUR FOLDER

```
F:\project bisnis sushi\
├── app/
│   ├── (auth)/login/           → halaman login
│   ├── (dashboard)/
│   │   ├── layout.tsx          → shell: BottomNav + OfflineIndicator
│   │   ├── page.tsx            → Dashboard Home
│   │   ├── kasir/page.tsx      → Kasir
│   │   ├── antrian/page.tsx    → Antrian Order
│   │   ├── riwayat/page.tsx    → Riwayat Order
│   │   ├── menu/page.tsx       → Manajemen Menu ✅
│   │   ├── stok/page.tsx       → Manajemen Stok
│   │   ├── keuangan/
│   │   │   ├── page.tsx        → Keuangan
│   │   │   └── rekap/page.tsx  → Rekap Harian
│   │   ├── laporan/
│   │   │   ├── page.tsx        → Laporan Home
│   │   │   ├── mingguan/       → Laporan Mingguan
│   │   │   └── bulanan/        → Laporan Bulanan
│   │   ├── pelanggan/page.tsx  → Database Pelanggan
│   │   ├── wa-tools/page.tsx   → WA Tools
│   │   └── settings/page.tsx   → Settings
│   ├── offline/page.tsx        → Halaman offline fallback
│   ├── onboarding/page.tsx     → Onboarding flow
│   ├── globals.css
│   └── layout.tsx              → root layout + Providers
├── components/
│   ├── providers.tsx           → QueryClientProvider + Toaster ✅
│   ├── InstallPrompt.tsx       ✅
│   ├── layout/
│   │   ├── Header.tsx          ✅
│   │   └── BottomNav.tsx       ✅
│   ├── shared/
│   │   └── OfflineIndicator.tsx ✅
│   ├── menu/
│   │   ├── MenuCard.tsx        ✅ (reusable di Kasir)
│   │   ├── MenuForm.tsx        ✅
│   │   ├── ImageUpload.tsx     ✅
│   │   └── MenuDetailSheet.tsx ✅
│   ├── kasir/                  → [Tahap 3]
│   ├── keuangan/               → [Tahap 5]
│   ├── stok/                   → [Tahap 4]
│   ├── laporan/                → [Tahap 6]
│   └── ui/                     → shadcn/ui components
├── hooks/
│   └── useMenu.ts              ✅
├── store/
│   └── menuStore.ts            ✅
├── lib/
│   ├── db.ts                   → Dexie.js IndexedDB ✅
│   ├── utils.ts                ✅
│   └── supabase/
│       ├── client.ts           ✅
│       └── server.ts           ✅
├── types/index.ts              → semua TypeScript interfaces ✅
├── constants/index.ts          → warna, kategori, format, WA template ✅
├── supabase/migrations/
│   ├── 001_initial_schema.sql  ✅ (sudah dijalankan)
│   └── 002_sample_data.sql     ✅ (sudah dijalankan)
├── public/
│   ├── manifest.json           ✅
│   ├── icons/                  → app icons semua ukuran
│   └── splash/                 → splash screens iPhone
├── .env.local                  ✅ (Supabase credentials)
├── next.config.js              ✅ (next-pwa config)
├── tailwind.config.ts          ✅
└── package.json                ✅
```

---

## 10. TEMPLATE WHATSAPP

### Struk Order
```
🍣 *[Nama Bisnis]*

Halo [Nama Customer]!
Terima kasih sudah order ya 😊

📋 *Detail Order #[nomor]*
  • [item] x[qty] — Rp [harga]
─────────────────
💰 *Total: Rp [total]*
💳 Bayar via: [metode]
💵 Kembalian: Rp [kembalian]  ← jika cash

Pesanan sedang disiapkan!
Est. selesai: 15-20 menit 🍱
```

### Konfirmasi Order
```
Halo [Nama]! 👋
Order #[nomor] sudah kami terima ya.
Sedang kami siapkan, estimasi 15-20 menit 🍣
```

### Pesanan Siap
```
Halo [Nama]! 🎉
Pesanan kamu sudah siap! Silakan diambil ya 😊🍱
```

---

## 11. PRIORITAS BUILD

```
🔴 WAJIB (mulai jualan dari hari 1):
   Tahap 1 → SELESAI ✅
   Tahap 2 → SELESAI ✅
   Tahap 3 → Kasir & Order     ← NEXT
   Tahap 8 → Deploy ke Vercel

🟡 PENTING (minggu pertama jualan):
   Tahap 5 → Keuangan & Petty Cash

🟢 TAMBAHKAN (setelah bisnis jalan):
   Tahap 4 → Manajemen Stok
   Tahap 6 → Laporan & Analisis
   Tahap 7 → WA Tools & Pelanggan
```

---

## 12. PRE-LAUNCH CHECKLIST

```
[ ] Semua formula keuangan dicek manual
[ ] Test kasir 10 order berturut tanpa crash
[ ] Test offline mode di iPhone (airplane mode)
[ ] Test install PWA di iPhone Safari berhasil
[ ] Backup database Supabase sebelum launch
[ ] Semua template WA sudah dikustomisasi
[ ] VAPID keys sudah di-generate untuk Web Push
[ ] .env.local terkonfigurasi di Vercel
```

---

*Generated: 2026-05-12 | SushiKu v1.0*

-- ═══════════════════════════════════════════════════════════════
-- SushiKu — Initial Schema Migration
-- ═══════════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── 1. menu_items ───────────────────────────────────────────────
create table public.menu_items (
  id              uuid primary key default uuid_generate_v4(),
  nama            text not null,
  deskripsi       text,
  harga_jual      integer not null default 0,
  harga_modal     integer not null default 0,
  kategori        text not null check (kategori in ('nigiri','maki','sashimi','roll','set_menu','minuman','tambahan')),
  foto_url        text,
  tersedia        boolean not null default true,
  urutan_tampil   integer not null default 0,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_menu_items_kategori   on public.menu_items(kategori);
create index idx_menu_items_tersedia   on public.menu_items(tersedia);
create index idx_menu_items_urutan     on public.menu_items(urutan_tampil);

-- ─── 2. customers ────────────────────────────────────────────────
create table public.customers (
  id              uuid primary key default uuid_generate_v4(),
  nama            text not null,
  nomor_wa        text,
  alamat          text,
  total_order     integer not null default 0,
  total_belanja   integer not null default 0,
  pertama_order   date,
  terakhir_order  date,
  catatan         text,
  poin            integer not null default 0,
  created_at      timestamptz not null default now()
);

create index idx_customers_nomor_wa on public.customers(nomor_wa);

-- ─── 3. orders ───────────────────────────────────────────────────
create table public.orders (
  id              uuid primary key default uuid_generate_v4(),
  nomor_order     text not null unique,
  tanggal         date not null default current_date,
  waktu           time not null default current_time,
  tipe            text not null check (tipe in ('walkin','whatsapp')),
  nama_customer   text,
  nomor_wa        text,
  customer_id     uuid references public.customers(id),
  items_json      jsonb not null default '[]',
  catatan_order   text,
  total_harga     integer not null default 0,
  metode_bayar    text not null check (metode_bayar in ('cash','transfer','qris')),
  status          text not null default 'pending' check (status in ('pending','proses','selesai','batal')),
  dibayar         boolean not null default false,
  alasan_batal    text,
  created_at      timestamptz not null default now()
);

create index idx_orders_tanggal     on public.orders(tanggal);
create index idx_orders_status      on public.orders(status);
create index idx_orders_tipe        on public.orders(tipe);
create index idx_orders_customer_id on public.orders(customer_id);
create index idx_orders_created_at  on public.orders(created_at desc);

-- ─── 4. order_items ──────────────────────────────────────────────
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  menu_item_id    uuid references public.menu_items(id),
  nama_item       text not null,
  harga_satuan    integer not null,
  jumlah          integer not null default 1,
  catatan_item    text,
  subtotal        integer not null
);

create index idx_order_items_order_id     on public.order_items(order_id);
create index idx_order_items_menu_item_id on public.order_items(menu_item_id);

-- ─── 5. bahan_baku ───────────────────────────────────────────────
create table public.bahan_baku (
  id                uuid primary key default uuid_generate_v4(),
  nama              text not null,
  satuan            text not null check (satuan in ('gram','kg','pcs','lembar','botol','pack','liter','ml')),
  stok_sekarang     numeric(10,2) not null default 0,
  stok_minimum      numeric(10,2) not null default 0,
  harga_per_satuan  integer not null default 0,
  kategori          text not null check (kategori in ('ikan_seafood','sayuran','bahan_dasar','bumbu','kemasan')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_bahan_baku_kategori on public.bahan_baku(kategori);

-- ─── 6. stok_log ─────────────────────────────────────────────────
create table public.stok_log (
  id              uuid primary key default uuid_generate_v4(),
  bahan_baku_id   uuid not null references public.bahan_baku(id) on delete cascade,
  jenis           text not null check (jenis in ('masuk','keluar','koreksi')),
  jumlah          numeric(10,2) not null,
  keterangan      text,
  harga_total     integer,
  created_at      timestamptz not null default now()
);

create index idx_stok_log_bahan_baku_id on public.stok_log(bahan_baku_id);
create index idx_stok_log_created_at    on public.stok_log(created_at desc);

-- ─── 7. pengeluaran ──────────────────────────────────────────────
create table public.pengeluaran (
  id          uuid primary key default uuid_generate_v4(),
  tanggal     date not null default current_date,
  kategori    text not null check (kategori in ('bahan_baku','operasional','kemasan','transport','promosi','lain')),
  keterangan  text not null,
  jumlah      integer not null,
  bukti_url   text,
  created_at  timestamptz not null default now()
);

create index idx_pengeluaran_tanggal  on public.pengeluaran(tanggal);
create index idx_pengeluaran_kategori on public.pengeluaran(kategori);

-- ─── 8. pemasukan_lain ───────────────────────────────────────────
create table public.pemasukan_lain (
  id          uuid primary key default uuid_generate_v4(),
  tanggal     date not null default current_date,
  keterangan  text not null,
  jumlah      integer not null,
  created_at  timestamptz not null default now()
);

create index idx_pemasukan_lain_tanggal on public.pemasukan_lain(tanggal);

-- ─── 9. daily_summary ────────────────────────────────────────────
create table public.daily_summary (
  id                       uuid primary key default uuid_generate_v4(),
  tanggal                  date not null unique,
  total_order              integer not null default 0,
  total_omzet              integer not null default 0,
  total_cash               integer not null default 0,
  total_transfer           integer not null default 0,
  hpp_total                integer not null default 0,
  laba_kotor               integer not null default 0,
  pengeluaran_operasional  integer not null default 0,
  laba_bersih              integer not null default 0,
  created_at               timestamptz not null default now()
);

-- ─── 10. push_subscriptions ──────────────────────────────────────
create table public.push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- ─── 11. bisnis_settings ─────────────────────────────────────────
create table public.bisnis_settings (
  id                    uuid primary key default uuid_generate_v4(),
  nama_bisnis           text not null default 'SushiKu',
  logo_url              text,
  alamat                text,
  nomor_wa_bisnis       text,
  rekening_bank         text,
  nomor_rekening        text,
  nama_rekening         text,
  nomor_qris            text,
  target_omzet_bulanan  integer default 0,
  jam_buka              text default '08:00',
  jam_tutup             text default '21:00',
  onboarding_done       boolean default false,
  updated_at            timestamptz not null default now()
);

-- Insert default settings
insert into public.bisnis_settings (id) values (uuid_generate_v4());

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto update bahan_baku.updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_bahan_baku_updated_at
  before update on public.bahan_baku
  for each row execute function update_updated_at();

-- Auto update customer stats saat order selesai
create or replace function update_customer_stats()
returns trigger as $$
begin
  if new.status = 'selesai' and (old.status is null or old.status != 'selesai') then
    if new.customer_id is not null then
      update public.customers
      set
        total_order   = total_order + 1,
        total_belanja = total_belanja + new.total_harga,
        terakhir_order = new.tanggal,
        pertama_order = coalesce(pertama_order, new.tanggal)
      where id = new.customer_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_order_update_customer
  after update on public.orders
  for each row execute function update_customer_stats();

-- Auto upsert daily_summary saat order selesai
create or replace function upsert_daily_summary()
returns trigger as $$
declare
  v_hpp integer;
begin
  if new.status = 'selesai' and new.dibayar = true and
     (old.status is null or old.status != 'selesai') then

    -- Hitung HPP dari items_json
    select coalesce(sum((item->>'harga_modal')::integer * (item->>'jumlah')::integer), 0)
    into v_hpp
    from jsonb_array_elements(new.items_json) as item;

    insert into public.daily_summary (
      tanggal, total_order, total_omzet,
      total_cash, total_transfer, hpp_total, laba_kotor
    )
    values (
      new.tanggal, 1, new.total_harga,
      case when new.metode_bayar = 'cash' then new.total_harga else 0 end,
      case when new.metode_bayar != 'cash' then new.total_harga else 0 end,
      v_hpp,
      new.total_harga - v_hpp
    )
    on conflict (tanggal) do update set
      total_order   = daily_summary.total_order + 1,
      total_omzet   = daily_summary.total_omzet + new.total_harga,
      total_cash    = daily_summary.total_cash    + case when new.metode_bayar = 'cash'    then new.total_harga else 0 end,
      total_transfer= daily_summary.total_transfer + case when new.metode_bayar != 'cash'  then new.total_harga else 0 end,
      hpp_total     = daily_summary.hpp_total     + v_hpp,
      laba_kotor    = daily_summary.laba_kotor    + (new.total_harga - v_hpp);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_order_daily_summary
  after update on public.orders
  for each row execute function upsert_daily_summary();

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════
-- App ini single-user, RLS dibuat sederhana.
-- Aktifkan setelah setup auth jika diperlukan.

alter table public.menu_items         enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.bahan_baku         enable row level security;
alter table public.stok_log           enable row level security;
alter table public.pengeluaran        enable row level security;
alter table public.pemasukan_lain     enable row level security;
alter table public.customers          enable row level security;
alter table public.daily_summary      enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.bisnis_settings    enable row level security;

-- Policy: izinkan semua operasi (owner-only app, proteksi lewat Supabase anon key)
create policy "allow_all" on public.menu_items         for all using (true) with check (true);
create policy "allow_all" on public.orders             for all using (true) with check (true);
create policy "allow_all" on public.order_items        for all using (true) with check (true);
create policy "allow_all" on public.bahan_baku         for all using (true) with check (true);
create policy "allow_all" on public.stok_log           for all using (true) with check (true);
create policy "allow_all" on public.pengeluaran        for all using (true) with check (true);
create policy "allow_all" on public.pemasukan_lain     for all using (true) with check (true);
create policy "allow_all" on public.customers          for all using (true) with check (true);
create policy "allow_all" on public.daily_summary      for all using (true) with check (true);
create policy "allow_all" on public.push_subscriptions for all using (true) with check (true);
create policy "allow_all" on public.bisnis_settings    for all using (true) with check (true);

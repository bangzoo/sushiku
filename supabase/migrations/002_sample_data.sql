-- ═══════════════════════════════════════════════════════════════
-- SushiKu — Sample Data (15+ menu sushi realistis)
-- Harga dalam Rupiah, sesuai harga sushi rumahan Indonesia 2024
-- ═══════════════════════════════════════════════════════════════

insert into public.menu_items (id, nama, deskripsi, harga_jual, harga_modal, kategori, tersedia, urutan_tampil) values

-- NIGIRI (harga per 2 pcs)
(uuid_generate_v4(), 'Salmon Nigiri',  'Nasi sushi dengan topping salmon segar',         28000, 14000, 'nigiri', true, 1),
(uuid_generate_v4(), 'Tuna Nigiri',    'Nasi sushi dengan topping tuna segar',           25000, 13000, 'nigiri', true, 2),
(uuid_generate_v4(), 'Ebi Nigiri',     'Nasi sushi dengan topping udang rebus',          22000, 10000, 'nigiri', true, 3),
(uuid_generate_v4(), 'Tamago Nigiri',  'Nasi sushi dengan topping telur dadar manis',    18000,  7000, 'nigiri', true, 4),

-- MAKI ROLL (per 6 pcs)
(uuid_generate_v4(), 'California Roll',   'Kepiting imitasi, alpukat, mentimun',         32000, 14000, 'maki', true, 5),
(uuid_generate_v4(), 'Salmon Maki Roll',  'Salmon segar, nori, nasi sushi',              30000, 13000, 'maki', true, 6),
(uuid_generate_v4(), 'Vegetable Roll',    'Alpukat, mentimun, wortel, nori',             22000,  8000, 'maki', true, 7),
(uuid_generate_v4(), 'Spicy Tuna Roll',   'Tuna pedas, mentimun, saus spicy mayo',       32000, 14000, 'maki', true, 8),

-- SASHIMI (per 5 pcs)
(uuid_generate_v4(), 'Salmon Sashimi 5pcs', 'Irisan salmon segar tanpa nasi',            45000, 22000, 'sashimi', true, 9),
(uuid_generate_v4(), 'Tuna Sashimi 5pcs',   'Irisan tuna segar tanpa nasi',              42000, 21000, 'sashimi', true, 10),

-- SET MENU
(uuid_generate_v4(), 'Set A — 10pcs Mix',
  'Isi: 2 Salmon Nigiri, 2 Tuna Nigiri, 6 California Roll',                              75000, 32000, 'set_menu', true, 11),
(uuid_generate_v4(), 'Set B — 15pcs Mix',
  'Isi: 4 Nigiri Mix, 6 California Roll, 5 Salmon Sashimi',                             110000, 48000, 'set_menu', true, 12),
(uuid_generate_v4(), 'Set C — Family Box',
  'Isi: 6 Nigiri Mix, 12 Maki Mix, 10 Sashimi Mix — cocok untuk 3-4 orang',            185000, 80000, 'set_menu', true, 13),

-- MINUMAN
(uuid_generate_v4(), 'Green Tea Panas',  'Teh hijau Jepang asli',    12000,  3000, 'minuman', true, 14),
(uuid_generate_v4(), 'Ocha Dingin',      'Teh hijau dingin segar',   15000,  4000, 'minuman', true, 15),
(uuid_generate_v4(), 'Air Mineral',      'Aqua 600ml',                5000,  2000, 'minuman', true, 16),
(uuid_generate_v4(), 'Yuzu Lemonade',    'Minuman yuzu segar, dingin', 20000, 6000, 'minuman', true, 17),

-- TAMBAHAN
(uuid_generate_v4(), 'Wasabi Extra',    'Wasabi segar tambahan',      5000, 1500, 'tambahan', true, 18),
(uuid_generate_v4(), 'Gari Extra',      'Jahe acar tambahan',         5000, 1000, 'tambahan', true, 19),
(uuid_generate_v4(), 'Soy Sauce Extra', 'Kecap asin Jepang',          3000,  500, 'tambahan', true, 20),
(uuid_generate_v4(), 'Spicy Mayo',      'Saus mayo pedas',            5000, 1000, 'tambahan', true, 21);

-- ─── Sample bahan baku ───────────────────────────────────────────
insert into public.bahan_baku (nama, satuan, stok_sekarang, stok_minimum, harga_per_satuan, kategori) values
('Salmon Fillet',       'gram', 500, 200,  120,  'ikan_seafood'),
('Tuna Fillet',         'gram', 400, 200,  110,  'ikan_seafood'),
('Udang Kupas',         'gram', 300, 100,   80,  'ikan_seafood'),
('Kepiting Imitasi',    'gram', 200, 100,   50,  'ikan_seafood'),
('Beras Sushi (Shari)', 'kg',    5,   2, 18000,  'bahan_dasar'),
('Nori (Rumput Laut)',  'lembar', 30, 10,  2500,  'bahan_dasar'),
('Cuka Beras',          'ml',  500, 200,    30,  'bumbu'),
('Wasabi Pasta',        'gram', 100,  50,   80,  'bumbu'),
('Kecap Asin Jepang',   'ml',  300, 100,   25,  'bumbu'),
('Alpukat',             'pcs',  10,   5, 8000,  'sayuran'),
('Mentimun',            'pcs',  10,   5, 3000,  'sayuran'),
('Wortel',              'gram', 500, 200,   15,  'sayuran'),
('Gari (Jahe Acar)',    'gram', 200,  50,   40,  'bumbu'),
('Kotak Sushi Kecil',   'pcs',  50,  20, 1500,  'kemasan'),
('Kotak Sushi Besar',   'pcs',  30,  10, 3000,  'kemasan'),
('Sumpit Kayu',         'pack', 20,  10, 5000,  'kemasan'),
('Plastik Wrap',        'pack',  3,   1, 8000,  'kemasan');

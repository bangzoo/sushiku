import Dexie, { type Table } from 'dexie'
import type { MenuItem, Order, OrderItem, Pengeluaran, BahanBaku, StokLog, Resep, PemasukanLain } from '@/types'

// ─── Sync Queue ───────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id?: number
  table_name: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  record_id: string
  data: Record<string, unknown>
  created_at: string
  retry_count: number
}

// ─── Database ─────────────────────────────────────────────────────────────────

class SushiKuDB extends Dexie {
  menu_items!: Table<MenuItem>
  orders!: Table<Order>
  order_items!: Table<OrderItem>
  pengeluaran!: Table<Pengeluaran>
  bahan_baku!: Table<BahanBaku>
  stok_log!: Table<StokLog>
  resep!: Table<Resep>
  pemasukan_lain!: Table<PemasukanLain>
  sync_queue!: Table<SyncQueueItem>

  constructor() {
    super('sushiku-db')

    this.version(1).stores({
      menu_items:  'id, kategori, tersedia, urutan_tampil',
      orders:      'id, nomor_order, tanggal, tipe, status, dibayar, created_at',
      order_items: 'id, order_id, menu_item_id',
      pengeluaran: 'id, tanggal, kategori',
      bahan_baku:  'id, kategori, nama',
      sync_queue:  '++id, table_name, operation, record_id, created_at',
    })

    this.version(2).stores({
      menu_items:  'id, kategori, tersedia, urutan_tampil',
      orders:      'id, nomor_order, tanggal, tipe, status, dibayar, created_at',
      order_items: 'id, order_id, menu_item_id',
      pengeluaran: 'id, tanggal, kategori',
      bahan_baku:  'id, kategori, nama',
      stok_log:    'id, bahan_baku_id, jenis, created_at',
      sync_queue:  '++id, table_name, operation, record_id, created_at',
    })

    this.version(3).stores({
      menu_items:  'id, kategori, tersedia, urutan_tampil',
      orders:      'id, nomor_order, tanggal, tipe, status, dibayar, created_at',
      order_items: 'id, order_id, menu_item_id',
      pengeluaran: 'id, tanggal, kategori',
      bahan_baku:  'id, kategori, nama',
      stok_log:    'id, bahan_baku_id, jenis, created_at',
      resep:       'id, menu_item_id, bahan_baku_id',
      sync_queue:  '++id, table_name, operation, record_id, created_at',
    })

    this.version(4).stores({
      menu_items:      'id, kategori, tersedia, urutan_tampil',
      orders:          'id, nomor_order, tanggal, tipe, status, dibayar, created_at',
      order_items:     'id, order_id, menu_item_id',
      pengeluaran:     'id, tanggal, kategori',
      bahan_baku:      'id, kategori, nama',
      stok_log:        'id, bahan_baku_id, jenis, created_at',
      resep:           'id, menu_item_id, bahan_baku_id',
      pemasukan_lain:  'id, tanggal',
      sync_queue:      '++id, table_name, operation, record_id, created_at',
    })
  }
}

export const db = new SushiKuDB()

// ─── Helper: tambah ke sync queue ────────────────────────────────────────────

export async function addToSyncQueue(
  tableName: string,
  operation: SyncQueueItem['operation'],
  recordId: string,
  data: Record<string, unknown>
) {
  await db.sync_queue.add({
    table_name: tableName,
    operation,
    record_id: recordId,
    data,
    created_at: new Date().toISOString(),
    retry_count: 0,
  })
}

// ─── Sync ke Supabase ─────────────────────────────────────────────────────────

export async function syncToSupabase() {
  if (!navigator.onLine) return

  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  const queue = await db.sync_queue.orderBy('created_at').toArray()
  if (queue.length === 0) return

  for (const item of queue) {
    try {
      if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
        await supabase.from(item.table_name).upsert(item.data as Record<string, unknown>)
      } else if (item.operation === 'DELETE') {
        await supabase.from(item.table_name).delete().eq('id', item.record_id)
      }
      if (item.id !== undefined) {
        await db.sync_queue.delete(item.id)
      }
    } catch {
      if (item.id !== undefined) {
        await db.sync_queue.update(item.id, { retry_count: item.retry_count + 1 })
      }
    }
  }
}

// ─── Setup listener online ────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncToSupabase()
  })
}

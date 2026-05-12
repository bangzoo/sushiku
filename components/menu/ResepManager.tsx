'use client'

import { useState } from 'react'
import { Plus, Trash2, ChefHat, AlertCircle } from 'lucide-react'
import { useResep, useAddResep, useUpdateResep, useDeleteResep } from '@/hooks/useResep'
import { useBahanBaku } from '@/hooks/useStok'
import { cn } from '@/lib/utils'

interface Props {
  menuItemId: string
  menuNama: string
}

export default function ResepManager({ menuItemId, menuNama }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [selectedBahanId, setSelectedBahanId] = useState('')
  const [jumlah, setJumlah] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editJumlah, setEditJumlah] = useState('')

  const { data: resepList = [], isLoading } = useResep(menuItemId)
  const { data: semuaBahan = [] } = useBahanBaku()
  const addResep = useAddResep()
  const updateResep = useUpdateResep()
  const delResep = useDeleteResep()

  // Bahan yang belum ada di resep ini
  const bahanSudahAda = new Set(resepList.map((r) => r.bahan_baku_id))
  const bahanTersedia = semuaBahan.filter((b) => !bahanSudahAda.has(b.id))

  const handleAdd = async () => {
    if (!selectedBahanId || !jumlah || parseFloat(jumlah) <= 0) return
    await addResep.mutateAsync({
      menuItemId,
      bahanBakuId: selectedBahanId,
      jumlahPakai: parseFloat(jumlah),
    })
    setSelectedBahanId('')
    setJumlah('')
    setShowForm(false)
  }

  const handleUpdateJumlah = async (id: string) => {
    if (!editJumlah || parseFloat(editJumlah) <= 0) return
    await updateResep.mutateAsync({ id, menuItemId, jumlahPakai: parseFloat(editJumlah) })
    setEditId(null)
    setEditJumlah('')
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ChefHat size={14} className="text-sushi-red" />
          <p className="text-sm font-semibold text-sushi-black">Bahan yang Dipakai</p>
        </div>
        {!showForm && bahanTersedia.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs text-sushi-red font-semibold"
          >
            <Plus size={12} /> Tambah bahan
          </button>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl px-3 py-2 flex items-start gap-2">
        <AlertCircle size={13} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-600">
          Setiap 1 porsi <strong>{menuNama}</strong> akan mengurangi stok bahan di bawah otomatis saat order selesai.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : resepList.length === 0 && !showForm ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Belum ada bahan. Tambahkan agar stok terpotong otomatis.</p>
          {semuaBahan.length === 0 && (
            <p className="text-xs text-orange-500 mt-1">Tambahkan bahan baku di menu Stok dulu ya!</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {resepList.map((resep) => (
            <div key={resep.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sushi-black truncate">{resep.bahan_baku.nama}</p>
                {editId === resep.id ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      autoFocus
                      value={editJumlah}
                      onChange={(e) => setEditJumlah(e.target.value)}
                      className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateJumlah(resep.id)}
                    />
                    <span className="text-xs text-gray-400">{resep.bahan_baku.satuan}</span>
                    <button
                      onClick={() => handleUpdateJumlah(resep.id)}
                      className="text-xs text-green-600 font-semibold"
                    >
                      Simpan
                    </button>
                    <button onClick={() => setEditId(null)} className="text-xs text-gray-400">Batal</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditId(resep.id); setEditJumlah(String(resep.jumlah_pakai)) }}
                    className="text-xs text-gray-400 mt-0.5 text-left"
                  >
                    {resep.jumlah_pakai} {resep.bahan_baku.satuan} / porsi · <span className="text-sushi-red">ubah</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => delResep.mutate({ id: resep.id, menuItemId })}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form tambah bahan */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
          <select
            value={selectedBahanId}
            onChange={(e) => setSelectedBahanId(e.target.value)}
            className="input-sushi text-sm"
          >
            <option value="">Pilih bahan baku...</option>
            {bahanTersedia.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nama} (stok: {b.stok_sekarang} {b.satuan})
              </option>
            ))}
          </select>

          {selectedBahanId && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                autoFocus
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="input-sushi text-sm flex-1"
                placeholder="Jumlah per porsi"
              />
              <span className="text-sm text-gray-500 shrink-0">
                {semuaBahan.find((b) => b.id === selectedBahanId)?.satuan}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!selectedBahanId || !jumlah || addResep.isPending}
              className="flex-1 py-2 bg-sushi-black text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {addResep.isPending ? 'Menyimpan...' : 'Tambah'}
            </button>
            <button
              onClick={() => { setShowForm(false); setSelectedBahanId(''); setJumlah('') }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

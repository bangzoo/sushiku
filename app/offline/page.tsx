export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-sushi-cream flex flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl mb-5">🍣</p>
      <h1 className="text-2xl font-black text-sushi-black mb-2">Tidak Ada Koneksi</h1>
      <p className="text-gray-500 text-sm max-w-xs">
        Kamu sedang offline. Fitur kasir tetap bisa dipakai — data akan tersync otomatis saat koneksi kembali.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-3 bg-sushi-red text-white rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
      >
        Coba Lagi
      </button>
    </div>
  )
}

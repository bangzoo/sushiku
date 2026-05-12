'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    // Hanya tampil di Safari iPhone yang belum install
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafariBrowser = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    if (!isIOS || !isSafariBrowser || isStandalone) return

    setIsSafari(true)

    // Cek kapan terakhir dismiss
    const lastDismiss = localStorage.getItem('installPromptDismissed')
    if (lastDismiss) {
      const daysSince = (Date.now() - parseInt(lastDismiss)) / (1000 * 60 * 60 * 24)
      if (daysSince < 3) return
    }

    // Tampil setelah 2 detik
    const timer = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  function handleDismiss() {
    localStorage.setItem('installPromptDismissed', Date.now().toString())
    setShow(false)
  }

  if (!show || !isSafari) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-4 mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-sushi-red text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍣</span>
            <div>
              <p className="font-bold text-sm">Install SushiKu</p>
              <p className="text-xs opacity-80">Buka lebih cepat dari Home Screen</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 opacity-80 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Cara install ke iPhone:</p>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-sushi-surface flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-gray-600">1</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Tap tombol</p>
              <div className="flex items-center gap-1 px-2 py-1 bg-sushi-surface rounded-lg">
                <Share size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-gray-700">Share</span>
              </div>
              <p className="text-sm text-gray-600">di bawah Safari</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-sushi-surface flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-gray-600">2</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Pilih</p>
              <div className="flex items-center gap-1 px-2 py-1 bg-sushi-surface rounded-lg">
                <Plus size={14} className="text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Add to Home Screen</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-sushi-surface flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-gray-600">3</span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">Tap <strong>Add</strong> di pojok kanan atas ✅</p>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button onClick={handleDismiss} className="w-full btn-secondary text-sm py-3">
            Nanti aja
          </button>
        </div>
      </div>
    </div>
  )
}

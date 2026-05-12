'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { syncToSupabase } from '@/lib/db'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOnlineBanner, setShowOnlineBanner] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineBanner(true)
      syncToSupabase()
      setTimeout(() => setShowOnlineBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineBanner(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showOnlineBanner) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOnline ? 'bg-green-500' : 'bg-gray-800'
    }`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex items-center justify-center gap-2 py-2 px-4">
        {isOnline ? (
          <>
            <Wifi size={14} className="text-white" />
            <span className="text-white text-xs font-medium">
              Kembali online — data tersinkronisasi
            </span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-white" />
            <span className="text-white text-xs font-medium">
              Offline Mode — data disimpan lokal
            </span>
          </>
        )}
      </div>
    </div>
  )
}

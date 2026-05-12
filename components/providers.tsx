'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { requestNotifPermission } from '@/lib/stokAutoDeduct'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    requestNotifPermission()
  }, [])

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#0F0F0F',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
          },
        }}
      />
    </QueryClientProvider>
  )
}

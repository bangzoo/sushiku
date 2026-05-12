'use client'

import Link from 'next/link'
import { Settings, Bell } from 'lucide-react'

interface HeaderProps {
  title?: string
  showSettings?: boolean
  showBell?: boolean
  right?: React.ReactNode
}

export default function Header({ title = 'SushiKu', showSettings = false, showBell = false, right }: HeaderProps) {
  return (
    <header
      className="bg-white border-b border-gray-100 sticky top-0 z-30"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍣</span>
          <h1 className="text-base font-bold text-sushi-black">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {right}
          {showBell && (
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
            </button>
          )}
          {showSettings && (
            <Link href="/settings" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Settings size={20} className="text-gray-600" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

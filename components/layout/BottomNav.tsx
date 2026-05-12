'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, UtensilsCrossed, Package, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',        label: 'Home',    icon: Home },
  { href: '/kasir',   label: 'Kasir',   icon: ShoppingBag },
  { href: '/menu',    label: 'Menu',    icon: UtensilsCrossed },
  { href: '/stok',    label: 'Stok',    icon: Package },
  { href: '/laporan', label: 'Laporan', icon: BarChart2 },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav z-40">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 touch-target px-3 flex-1 transition-colors',
              active ? 'text-sushi-red' : 'text-gray-400'
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className={cn('text-[10px] font-medium', active ? 'text-sushi-red' : 'text-gray-400')}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

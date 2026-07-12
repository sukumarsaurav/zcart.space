'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, Tag, User } from 'lucide-react'

export default function BottomNav({ shopSlug }: { shopSlug: string }) {
  const pathname = usePathname()

  // Hide on pages that render their own custom sticky bottom bar, to avoid
  // the two fixed bars overlapping at the same screen position.
  if (
    pathname.includes('/checkout') ||
    pathname.includes('/order-success') ||
    pathname.endsWith('/products') || // Sort/Filter bar on the products list page
    /\/products\/[^/]+$/.test(pathname) // Buy Now bar on product detail pages
  ) {
    return null
  }

  const navItems = [
    { name: 'Home', href: `/${shopSlug}`, icon: Home },
    { name: 'Categories', href: `/${shopSlug}/categories`, icon: LayoutGrid },
    { name: 'Sale', href: `/${shopSlug}/sale`, icon: Tag },
    { name: 'Profile', href: `/user/profile`, icon: User },
  ]

  return (
    <nav
      className="md:hidden mobile-only"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(14,12,10,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--sf-border, var(--surface-border))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 'env(safe-area-inset-bottom, 16px) 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        paddingTop: '12px',
        zIndex: 50,
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== `/${shopSlug}` && pathname.startsWith(item.href))

        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: isActive ? 'var(--sf-text-primary, var(--text-primary))' : 'var(--sf-text-tertiary, var(--text-tertiary))',
              transition: 'color 0.2s',
              flex: 1
            }}
          >
            <item.icon size={20} style={{
              strokeWidth: isActive ? 2.5 : 2,
              color: isActive ? 'var(--sf-accent, var(--shop-primary, var(--text-primary)))' : 'inherit'
            }} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

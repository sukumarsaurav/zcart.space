'use client'

import { Bell, Menu, ExternalLink, LogOut, User, Store } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { logoutAction } from '@/app/(auth)/actions'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TopBarProps {
  shopName: string
  shopSlug: string
  userEmail: string
  onOpenMobile: () => void
}

export default function TopBar({ shopName, shopSlug, userEmail, onOpenMobile }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = (shopName || userEmail).slice(0, 2).toUpperCase()

  let pageTitle = 'Dashboard'
  if (pathname.includes('/inventory')) pageTitle = 'Inventory'
  else if (pathname.includes('/orders')) pageTitle = 'Orders'
  else if (pathname.includes('/invoices')) pageTitle = 'Invoices'
  else if (pathname.includes('/analytics')) pageTitle = 'Analytics'
  else if (pathname.includes('/customers')) pageTitle = 'Customers'
  else if (pathname.includes('/settings')) pageTitle = 'Settings'
  else if (pathname.includes('/pos')) pageTitle = 'Point of Sale'
  else if (pathname.includes('/categories')) pageTitle = 'Categories'
  else if (pathname.includes('/products')) pageTitle = 'Products'

  return (
    <header className="topbar" style={{ position: 'sticky' }}>
      {/* Left: mobile menu + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobile}
          className="mobile-menu-btn btn btn-ghost btn-icon"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>{shopName}</p>
          <span style={{ color: 'var(--surface-border)', fontSize: '18px', fontWeight: 300 }}>|</span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{pageTitle}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* View storefront */}
        <Link
          href={`/${shopSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ gap: 'var(--space-2)' }}
        >
          <Store size={14} />
          <span style={{ display: 'none' }}>View store</span>
          <ExternalLink size={12} />
        </Link>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="btn btn-ghost btn-icon"
          aria-label="View notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {/* Unread dot */}
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7,
            background: 'var(--color-danger-500)',
            borderRadius: '50%',
            border: '2px solid var(--surface-bg)',
          }} />
        </button>

        {/* User menu */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            id="user-menu-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            className="avatar avatar-md"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600))',
              color: 'white',
              cursor: 'pointer',
              border: '2px solid var(--surface-border)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
            }}
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                minWidth: 220,
                overflow: 'hidden',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              {/* User info */}
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{shopName}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{userEmail}</p>
              </div>

              {/* Menu items */}
              <div style={{ padding: 'var(--space-2)' }}>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                  className="nav-item"
                >
                  <User size={15} />
                  Account settings
                </Link>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-danger-400)',
                      width: '100%',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

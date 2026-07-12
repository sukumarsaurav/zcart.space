'use client'

import { Bell, Menu, ExternalLink, LogOut, User, Store, AlertTriangle, ShoppingCart } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { logoutAction } from '@/app/(auth)/actions'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface TopBarProps {
  shopName: string
  shopSlug: string
  userEmail: string
  onOpenMobile: () => void
  lowStockItems: { product_id: string; quantity: number; reorder_point: number; products: { name: string } | { name: string }[] | null }[]
  pendingOrdersCount: number
}

export default function TopBar({ shopName, shopSlug, userEmail, onOpenMobile, lowStockItems, pendingOrdersCount }: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const notificationCount = lowStockItems.length + (pendingOrdersCount > 0 ? 1 : 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false)
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: 0, flex: 1 }}>
        <button
          id="mobile-menu-btn"
          onClick={onOpenMobile}
          className="mobile-menu-btn btn btn-ghost btn-icon"
          aria-label="Open navigation menu"
          style={{ flexShrink: 0 }}
        >
          <Menu size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shopName}</p>
          <span style={{ color: 'var(--surface-border)', fontSize: '18px', fontWeight: 300, flexShrink: 0 }}>|</span>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageTitle}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
        {/* View storefront */}
        <Link
          href={`/${shopSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ gap: 'var(--space-2)' }}
          aria-label="View store"
        >
          <Store size={14} />
          <span style={{ display: 'none' }}>View store</span>
          <ExternalLink size={12} />
        </Link>

        {/* Notifications */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            id="notifications-btn"
            onClick={() => setNotificationsOpen((o) => !o)}
            className="btn btn-ghost btn-icon"
            aria-label="View notifications"
            aria-expanded={notificationsOpen}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7,
                background: 'var(--color-danger-500)',
                borderRadius: '50%',
                border: '2px solid var(--surface-bg)',
              }} />
            )}
          </button>

          {notificationsOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl)',
                minWidth: 300,
                maxWidth: 340,
                overflow: 'hidden',
                zIndex: 'var(--z-dropdown)',
              }}
            >
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Notifications</p>
              </div>

              {notificationCount === 0 ? (
                <p style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  You&apos;re all caught up
                </p>
              ) : (
                <div style={{ padding: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {pendingOrdersCount > 0 && (
                    <Link
                      href="/orders?status=pending"
                      onClick={() => setNotificationsOpen(false)}
                      className="nav-item"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    >
                      <ShoppingCart size={16} color="var(--color-primary-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 'var(--text-sm)' }}>
                        {pendingOrdersCount} order{pendingOrdersCount !== 1 ? 's' : ''} awaiting confirmation
                      </span>
                    </Link>
                  )}
                  {lowStockItems.map((item) => {
                    const productName = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name
                    return (
                      <Link
                        key={item.product_id}
                        href="/inventory"
                        onClick={() => setNotificationsOpen(false)}
                        className="nav-item"
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                      >
                        <AlertTriangle size={16} color="var(--color-warning-400)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 'var(--text-sm)' }}>
                          {productName ?? 'A product'} is low on stock ({item.quantity} left)
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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

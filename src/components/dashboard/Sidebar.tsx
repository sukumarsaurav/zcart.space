'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag, LayoutDashboard, Package, Tag, ShoppingCart,
  Warehouse, FileText, Monitor, Settings, ChevronLeft, X,
  TrendingUp, Users, Ticket, CreditCard, Receipt, FileCheck, Truck, FileSpreadsheet
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: number
}

const navSections: { section?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Catalogue',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Categories', href: '/categories', icon: Tag },
    ],
  },
  {
    section: 'Sales & Billing',
    items: [
      { label: 'Orders', href: '/orders', icon: ShoppingCart },
      { label: 'POS Billing', href: '/pos', icon: Monitor },
      { label: 'Invoices', href: '/invoices', icon: FileText },
      { label: 'Estimates', href: '/estimates', icon: FileCheck },
      { label: 'Coupons', href: '/coupons', icon: Ticket },
    ],
  },
  {
    section: 'Khata & Finance',
    items: [
      { label: 'Khata Ledger', href: '/khata', icon: CreditCard },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
      { label: 'Purchases', href: '/purchases', icon: Truck },
      { label: 'GST Reports', href: '/reports/gst', icon: FileSpreadsheet },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Inventory', href: '/inventory', icon: Warehouse },
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Analytics', href: '/analytics', icon: TrendingUp },
    ],
  },
  {
    section: 'Shop',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
}

export default function Sidebar({
  collapsed, mobileOpen, onToggleCollapse, onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 199,
          }}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}
        style={{ zIndex: 200 }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          {!collapsed && (
            <span className="sidebar-logo-text gradient-text">zCart</span>
          )}
          {/* Mobile close */}
          <button
            onClick={onCloseMobile}
            className="sidebar-close-btn btn btn-ghost btn-icon btn-sm"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {navSections.map((sec, si) => (
            <div key={si}>
              {sec.section && !collapsed && (
                <span className="nav-section-label">{sec.section}</span>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${active ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge != null && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div style={{
          padding: 'var(--space-4) var(--space-3)',
          borderTop: '1px solid var(--surface-border)',
        }}>
          <button
            onClick={onToggleCollapse}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-tertiary)',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={16}
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

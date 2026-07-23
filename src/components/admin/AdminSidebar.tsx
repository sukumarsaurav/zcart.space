'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  DollarSign,
  CreditCard,
  Users,
  ShieldCheck,
  ArrowLeft,
  Activity
} from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Shops Directory', href: '/admin/shops', icon: Store },
  { name: 'SaaS Earnings', href: '/admin/earnings', icon: DollarSign },
  { name: 'Subscription Plans', href: '/admin/plans', icon: CreditCard },
  { name: 'Merchant Users', href: '/admin/users', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="admin-sidebar">
      <div>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">z</div>
          <div>
            <h1 className="admin-sidebar-title">zCart Admin</h1>
            <div className="admin-sidebar-badge">
              <ShieldCheck size={14} />
              <span>Super Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-category">Platform Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="admin-sidebar-footer">
        <div className="admin-status-pill">
          <Activity size={14} color="var(--admin-primary)" />
          <span>SaaS System Live</span>
        </div>
        <Link href="/dashboard" className="admin-nav-item">
          <ArrowLeft size={16} />
          <span>Merchant Dashboard</span>
        </Link>
      </div>
    </aside>
  )
}

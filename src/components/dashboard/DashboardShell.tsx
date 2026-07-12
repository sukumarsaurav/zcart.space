'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import TopBar from '@/components/dashboard/TopBar'

interface DashboardShellProps {
  children: React.ReactNode
  shopName: string
  shopSlug: string
  userEmail: string
  lowStockItems: { product_id: string; quantity: number; reorder_point: number; products: { name: string } | { name: string }[] | null }[]
  pendingOrdersCount: number
}

export default function DashboardShell({ children, shopName, shopSlug, userEmail, lowStockItems, pendingOrdersCount }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          shopName={shopName}
          shopSlug={shopSlug}
          userEmail={userEmail}
          onOpenMobile={() => setMobileOpen(true)}
          lowStockItems={lowStockItems}
          pendingOrdersCount={pendingOrdersCount}
        />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}

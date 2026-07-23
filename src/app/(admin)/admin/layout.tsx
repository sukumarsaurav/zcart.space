import './admin.css'
import { requireSuperAdmin } from '@/lib/auth/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | zCart SaaS Admin', default: 'SaaS Admin Panel' },
  description: 'SaaS Platform Owner Dashboard for managing registered shops, platform earnings, subscription plans, and merchant accounts.',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperAdmin()

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <AdminHeader userEmail={user.email ?? 'admin@zcart.space'} />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}

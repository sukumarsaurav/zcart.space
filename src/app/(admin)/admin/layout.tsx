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
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader userEmail={user.email ?? 'admin@zcart.space'} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

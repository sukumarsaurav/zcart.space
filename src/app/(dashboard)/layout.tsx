import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | zCart Dashboard', default: 'Dashboard' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/login')

  // Get their shop
  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, role, shops(id, name, slug)')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!shopUser?.shops) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const shop = Array.isArray(shopUser.shops) ? shopUser.shops[0] : shopUser.shops

  // Real notification sources: low-stock items and orders awaiting action.
  const [{ data: lowStock }, { count: pendingOrders }] = await Promise.all([
    supabase
      .from('inventory')
      .select('product_id, quantity, reorder_point, products(name)')
      .eq('shop_id', shop.id)
      .filter('quantity', 'lte', 'reorder_point')
      .limit(5),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .eq('status', 'pending'),
  ])

  return (
    <DashboardShell
      shopName={shop.name}
      shopSlug={shop.slug}
      userEmail={user.email ?? ''}
      lowStockItems={lowStock ?? []}
      pendingOrdersCount={pendingOrders ?? 0}
    >
      {children}
    </DashboardShell>
  )
}

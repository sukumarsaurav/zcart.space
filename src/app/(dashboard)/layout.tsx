import { redirect } from 'next/navigation'
import { createClient, getAuthUser } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | zCart Dashboard', default: 'Dashboard' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

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
  // PostgREST filters compare a column to a literal, not another column, so
  // "quantity <= reorder_point" can't be expressed as a query filter — fetch
  // and filter client-side instead.
  const [{ data: inventory }, { count: pendingOrders }] = await Promise.all([
    supabase
      .from('inventory')
      .select('product_id, quantity, reorder_point, products(name)')
      .eq('shop_id', shop.id),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .eq('status', 'pending'),
  ])

  const lowStockItems = (inventory ?? [])
    .filter((i) => Number(i.quantity) <= Number(i.reorder_point))
    .slice(0, 5)

  return (
    <DashboardShell
      shopName={shop.name}
      shopSlug={shop.slug}
      userEmail={user.email ?? ''}
      lowStockItems={lowStockItems}
      pendingOrdersCount={pendingOrders ?? 0}
    >
      {children}
    </DashboardShell>
  )
}

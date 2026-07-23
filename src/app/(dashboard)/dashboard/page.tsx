import { createClient, getAuthUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatCard from '@/components/dashboard/StatCard'
import dynamic from 'next/dynamic'
const RevenueChart = dynamic(() => import('@/components/dashboard/RevenueChart'))
const TopProductsChart = dynamic(() => import('@/components/dashboard/TopProductsChart'))
import RecentOrders from '@/components/dashboard/RecentOrders'
import LowStockWidget from '@/components/dashboard/LowStockWidget'
import {
  IndianRupee, ShoppingCart, Package, AlertTriangle,
  TrendingUp, Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import { format } from 'date-fns'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Get shop
  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, shops(id, name, slug, plan)')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!shopUser?.shop_id) redirect('/login')

  const shopId = shopUser.shop_id
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

  // Parallel data fetching
  const [
    { data: todayOrders },
    { data: monthOrders },
    { data: productCount },
    { data: customerCount },
    { data: lowStock },
    { data: recentOrders },
    { data: dailySales },
    { data: topProducts },
  ] = await Promise.all([
    // Today's orders
    supabase
      .from('orders')
      .select('total_amount, status')
      .eq('shop_id', shopId)
      .gte('created_at', `${todayStr}T00:00:00`)
      .not('status', 'in', '(cancelled,refunded)'),
    // 30-day orders
    supabase
      .from('orders')
      .select('total_amount, created_at, channel')
      .eq('shop_id', shopId)
      .gte('created_at', thirtyDaysAgoStr)
      .not('status', 'in', '(cancelled,refunded)'),
    // Product count
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .eq('status', 'active'),
    // Customer count
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId),
    // Low stock — PostgREST filters compare a column to a literal, not another
    // column, so "quantity <= reorder_point" can't be expressed as a query
    // filter; fetch and filter client-side below instead.
    supabase
      .from('inventory')
      .select('product_id, quantity, reorder_point, products(name)')
      .eq('shop_id', shopId),
    // Recent orders
    supabase
      .from('orders')
      .select('id, total_amount, status, payment_status, channel, created_at, customers(name, phone)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(8),
    // Daily sales for chart (last 7 days)
    supabase.from('v_daily_sales').select('*').eq('shop_id', shopId).limit(7),
    // Top products
    supabase.from('v_top_products').select('*').eq('shop_id', shopId).limit(5),
  ])

  // Compute stats
  const allLowStock = (lowStock ?? []).filter((i) => Number(i.quantity) <= Number(i.reorder_point))
  const lowStockItems = allLowStock.slice(0, 5)
  const todayRevenue = (todayOrders ?? []).reduce((s, o) => s + Number(o.total_amount), 0)
  const todayOrderCount = todayOrders?.length ?? 0
  const monthRevenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.total_amount), 0)
  const avgOrderValue = monthOrders?.length ? monthRevenue / monthOrders.length : 0

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {format(today, 'EEEE, MMMM d, yyyy')} — Here&apos;s what&apos;s happening today
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard
          label="Revenue Today"
          value={fmtINR(todayRevenue)}
          trend={`${todayOrderCount} orders`}
          trendUp={todayOrderCount > 0}
          icon={<IndianRupee size={20} />}
          iconBg="rgba(99,102,241,0.12)"
          iconColor="var(--color-primary-400)"
        />
        <StatCard
          label="30-Day Revenue"
          value={fmtINR(monthRevenue)}
          trend={`${monthOrders?.length ?? 0} orders`}
          trendUp={(monthOrders?.length ?? 0) > 0}
          icon={<TrendingUp size={20} />}
          iconBg="rgba(34,197,94,0.12)"
          iconColor="var(--color-success-400)"
        />
        <StatCard
          label="Avg. Order Value"
          value={fmtINR(avgOrderValue)}
          icon={<ShoppingCart size={20} />}
          iconBg="rgba(168,85,247,0.12)"
          iconColor="var(--color-accent-400)"
        />
        <StatCard
          label="Active Products"
          value={String(productCount ?? 0)}
          icon={<Package size={20} />}
          iconBg="rgba(14,165,233,0.12)"
          iconColor="var(--color-info-400)"
        />
        <StatCard
          label="Customers"
          value={String(customerCount ?? 0)}
          icon={<Users size={20} />}
          iconBg="rgba(245,158,11,0.12)"
          iconColor="var(--color-warning-400)"
        />
        <StatCard
          label="Low Stock Items"
          value={String(allLowStock.length)}
          trendUp={false}
          trend={allLowStock.length > 0 ? 'Needs attention' : 'All stocked up'}
          icon={<AlertTriangle size={20} />}
          iconBg="rgba(239,68,68,0.12)"
          iconColor="var(--color-danger-400)"
        />
      </div>

      {/* Charts row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-8)', alignItems: 'start' }}>
        <RevenueChart data={dailySales ?? []} />
        <TopProductsChart data={topProducts ?? []} />
      </div>

      {/* Bottom row */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <RecentOrders orders={recentOrders ?? []} />
        <LowStockWidget items={lowStockItems} />
      </div>
    </div>
  )
}

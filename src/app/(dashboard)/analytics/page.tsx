import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StatCard from '@/components/dashboard/StatCard'
import dynamic from 'next/dynamic'
const RevenueChart = dynamic(() => import('@/components/dashboard/RevenueChart'))
const TopProductsChart = dynamic(() => import('@/components/dashboard/TopProductsChart'))
import { IndianRupee, ShoppingCart, TrendingUp, Users, Package, Percent } from 'lucide-react'
import { format, subDays } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const shopId = shopUser.shop_id
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30).toISOString()
  const sevenDaysAgo = subDays(now, 7).toISOString()

  const [
    { data: monthOrders },
    { data: weekOrders },
    { data: dailySales },
    { data: topProducts },
    { data: channelBreakdown },
    { data: customerCount },
  ] = await Promise.all([
    supabase.from('orders').select('total_amount, channel').eq('shop_id', shopId).gte('created_at', thirtyDaysAgo).not('status', 'in', '(cancelled,refunded)'),
    supabase.from('orders').select('total_amount').eq('shop_id', shopId).gte('created_at', sevenDaysAgo).not('status', 'in', '(cancelled,refunded)'),
    supabase.from('v_daily_sales').select('*').eq('shop_id', shopId).limit(30),
    supabase.from('v_top_products').select('*').eq('shop_id', shopId).limit(5),
    supabase.from('orders').select('channel, total_amount').eq('shop_id', shopId).gte('created_at', thirtyDaysAgo).not('status', 'in', '(cancelled,refunded)'),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('shop_id', shopId),
  ])

  const monthRevenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.total_amount), 0)
  const weekRevenue = (weekOrders ?? []).reduce((s, o) => s + Number(o.total_amount), 0)
  const avgOrderValue = monthOrders?.length ? monthRevenue / monthOrders.length : 0
  const onlineRevenue = (channelBreakdown ?? []).filter((o) => o.channel === 'online').reduce((s, o) => s + Number(o.total_amount), 0)
  const posRevenue = (channelBreakdown ?? []).filter((o) => o.channel === 'pos').reduce((s, o) => s + Number(o.total_amount), 0)
  const onlinePct = monthRevenue > 0 ? Math.round((onlineRevenue / monthRevenue) * 100) : 0

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Performance overview for the last 30 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard label="30-Day Revenue" value={fmtINR(monthRevenue)} trend={`${monthOrders?.length ?? 0} orders`} trendUp icon={<IndianRupee size={20} />} iconBg="rgba(99,102,241,0.12)" iconColor="var(--color-primary-400)" />
        <StatCard label="7-Day Revenue" value={fmtINR(weekRevenue)} trend={`${weekOrders?.length ?? 0} orders`} trendUp icon={<TrendingUp size={20} />} iconBg="rgba(34,197,94,0.12)" iconColor="var(--color-success-400)" />
        <StatCard label="Avg Order Value" value={fmtINR(avgOrderValue)} icon={<ShoppingCart size={20} />} iconBg="rgba(168,85,247,0.12)" iconColor="var(--color-accent-400)" />
        <StatCard label="Total Customers" value={String(customerCount ?? 0)} icon={<Users size={20} />} iconBg="rgba(245,158,11,0.12)" iconColor="var(--color-warning-400)" />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-8)', alignItems: 'start' }}>
        <RevenueChart data={dailySales ?? []} />
        <TopProductsChart data={topProducts ?? []} />
      </div>

      {/* Channel breakdown */}
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="card-header">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Channel Breakdown</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Online */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Online Store</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fmtINR(onlineRevenue)} ({onlinePct}%)</span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${onlinePct}%`, background: 'var(--color-primary-400)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
            </div>
          </div>
          {/* POS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>POS (Counter)</span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fmtINR(posRevenue)} ({100 - onlinePct}%)</span>
            </div>
            <div style={{ height: 8, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${100 - onlinePct}%`, background: 'var(--color-accent-400)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

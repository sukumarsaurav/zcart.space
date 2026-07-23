import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/formatters'
import type { Metadata } from 'next'
import { DollarSign, TrendingUp, BarChart2, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Platform Earnings & GMV Analytics',
}

export const revalidate = 0

export default async function AdminEarningsPage() {
  const serviceClient = await createServiceClient()

  const [
    { data: shops },
    { data: orders },
    { data: plans },
  ] = await Promise.all([
    serviceClient.from('shops').select('id, name, slug, plan, is_active, created_at'),
    serviceClient.from('orders').select('id, shop_id, total_amount, status, created_at').neq('status', 'cancelled'),
    serviceClient.from('plans').select('key, price_monthly'),
  ])

  const planPriceMap: Record<string, number> = {}
  ;(plans ?? []).forEach((p) => {
    planPriceMap[p.key] = Number(p.price_monthly) || 0
  })

  let totalMRR = 0
  const planStats: Record<string, { count: number; revenue: number }> = {
    free: { count: 0, revenue: 0 },
    starter: { count: 0, revenue: 0 },
    pro: { count: 0, revenue: 0 },
    enterprise: { count: 0, revenue: 0 },
  }

  ;(shops ?? []).forEach((s) => {
    const planKey = s.plan || 'free'
    const price = planPriceMap[planKey] || 0
    if (!planStats[planKey]) {
      planStats[planKey] = { count: 0, revenue: 0 }
    }
    planStats[planKey].count += 1
    if (s.is_active) {
      planStats[planKey].revenue += price
      totalMRR += price
    }
  })

  const validOrders = orders ?? []
  const totalGMV = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const totalOrdersCount = validOrders.length
  const averageOrderValue = totalOrdersCount > 0 ? totalGMV / totalOrdersCount : 0

  const shopGmvMap = new Map<string, { gmv: number; count: number }>()
  validOrders.forEach((o) => {
    const prev = shopGmvMap.get(o.shop_id) || { gmv: 0, count: 0 }
    shopGmvMap.set(o.shop_id, {
      gmv: prev.gmv + (Number(o.total_amount) || 0),
      count: prev.count + 1,
    })
  })

  const topShops = (shops ?? [])
    .map((s) => {
      const stats = shopGmvMap.get(s.id) || { gmv: 0, count: 0 }
      return {
        ...s,
        gmv: stats.gmv,
        orders_count: stats.count,
      }
    })
    .sort((a, b) => b.gmv - a.gmv)
    .slice(0, 10)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 className="admin-page-title">Platform Financials & Revenue</h1>
        <p className="admin-page-subtitle">
          Detailed metrics on SaaS Monthly Recurring Revenue (MRR), subscription tier breakdown, and store GMV processing.
        </p>
      </div>

      {/* Primary Financial KPI Cards */}
      <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Estimated SaaS MRR</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'var(--admin-emerald-bg)', color: 'var(--admin-emerald)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="admin-card-value">{formatCurrency(totalMRR)}</div>
          <div className="admin-card-footer">
            <span>Recurring subscription revenue / month</span>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Total Platform Sales (GMV)</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'var(--admin-purple-bg)', color: 'var(--admin-purple)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="admin-card-value">{formatCurrency(totalGMV)}</div>
          <div className="admin-card-footer">
            <span>Processed across {totalOrdersCount} shop orders</span>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Platform Average Order Value</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--admin-primary)' }}>
              <BarChart2 size={22} />
            </div>
          </div>
          <div className="admin-card-value">{formatCurrency(averageOrderValue)}</div>
          <div className="admin-card-footer">
            <span>Average basket size per order</span>
          </div>
        </div>
      </div>

      {/* Subscription Tier Revenue Breakdown */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Revenue Breakdown by Subscription Tier</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>SaaS subscription performance per plan</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)' }}>
            <span className="admin-badge admin-badge-free">Free Plan (₹0)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>{planStats.free.count} shops</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)' }}>Revenue Contribution: ₹0</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <span className="admin-badge admin-badge-starter">Starter Plan (₹499)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c7d2fe', margin: '0.35rem 0' }}>{planStats.starter.count} shops</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-primary)' }}>Revenue: {formatCurrency(planStats.starter.revenue)}/mo</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <span className="admin-badge admin-badge-pro">Pro Plan (₹1,499)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e9d5ff', margin: '0.35rem 0' }}>{planStats.pro.count} shops</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-purple)' }}>Revenue: {formatCurrency(planStats.pro.revenue)}/mo</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span className="admin-badge admin-badge-enterprise">Enterprise (₹3,999)</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fde68a', margin: '0.35rem 0' }}>{planStats.enterprise.count} shops</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-amber)' }}>Revenue: {formatCurrency(planStats.enterprise.revenue)}/mo</span>
          </div>
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Top Merchant Leaderboard</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>Highest grossing shops on zCart</p>
          </div>
          <span className="admin-badge admin-badge-enterprise">
            <Award size={12} /> Top Sales Performers
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Shop Name</th>
                <th>Plan Tier</th>
                <th>Orders Processed</th>
                <th style={{ textAlign: 'right' }}>Total Sales GMV</th>
              </tr>
            </thead>
            <tbody>
              {topShops.map((shop, idx) => (
                <tr key={shop.id}>
                  <td style={{ fontWeight: 800, color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                    #{idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{shop.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)', fontFamily: 'monospace' }}>{shop.slug}</div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-free" style={{ textTransform: 'uppercase' }}>
                      {shop.plan || 'free'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {shop.orders_count} orders
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--admin-emerald)', fontSize: '0.875rem' }}>
                    {formatCurrency(shop.gmv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

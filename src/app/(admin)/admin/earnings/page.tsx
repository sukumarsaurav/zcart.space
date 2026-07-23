import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/formatters'
import type { Metadata } from 'next'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  Award,
  ArrowUpRight,
  PieChart,
  BarChart2
} from 'lucide-react'

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
    { data: payments },
  ] = await Promise.all([
    serviceClient.from('shops').select('id, name, slug, plan, is_active, created_at'),
    serviceClient.from('orders').select('id, shop_id, total_amount, status, created_at').neq('status', 'cancelled'),
    serviceClient.from('plans').select('key, price_monthly'),
    serviceClient.from('payments').select('id, amount, status, method, created_at').eq('status', 'paid'),
  ])

  const planPriceMap: Record<string, number> = {}
  ;(plans ?? []).forEach((p) => {
    planPriceMap[p.key] = Number(p.price_monthly) || 0
  })

  // Calculate MRR & plan contributions
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

  // GMV & order metrics
  const validOrders = orders ?? []
  const totalGMV = validOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const totalOrdersCount = validOrders.length
  const averageOrderValue = totalOrdersCount > 0 ? totalGMV / totalOrdersCount : 0

  // Per-shop GMV calculation for leaderboard
  const shopGmvMap = new Map<string, { gmv: number; count: number }>()
  validOrders.forEach((o) => {
    const prev = shopGmvMap.get(o.shop_id) || { gmv: 0, count: 0 }
    shopGmvMap.set(o.shop_id, {
      gmv: prev.gmv + (Number(o.total_amount) || 0),
      count: prev.count + 1,
    })
  })

  // Top shops leaderboard
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Financials & Revenue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed metrics on SaaS Monthly Recurring Revenue (MRR), subscription tier breakdown, and store GMV processing.
        </p>
      </div>

      {/* Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* MRR Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated SaaS MRR</span>
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalMRR)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Recurring subscription revenue / month
            </p>
          </div>
        </div>

        {/* Total GMV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Platform Sales (GMV)</span>
            <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-800/50 text-purple-400">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalGMV)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Processed across {totalOrdersCount} shop orders
            </p>
          </div>
        </div>

        {/* Platform AOV Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Average Order Value</span>
            <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400">
              <BarChart2 className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(averageOrderValue)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Average basket size per order
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Tier Revenue Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Revenue Breakdown by Subscription Tier</h2>
          <p className="text-xs text-slate-400">SaaS subscription performance per plan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>Free Plan</span>
              <span>₹0/mo</span>
            </div>
            <div className="text-2xl font-bold text-white">{planStats.free.count} shops</div>
            <p className="text-[11px] text-slate-500 font-medium">Revenue Contribution: ₹0</p>
          </div>

          <div className="bg-slate-950 border border-indigo-950 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-indigo-400">
              <span>Starter Plan</span>
              <span>₹499/mo</span>
            </div>
            <div className="text-2xl font-bold text-indigo-200">{planStats.starter.count} shops</div>
            <p className="text-[11px] text-indigo-300 font-medium">
              Revenue: {formatCurrency(planStats.starter.revenue)}/mo
            </p>
          </div>

          <div className="bg-slate-950 border border-purple-950 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-purple-400">
              <span>Pro Plan</span>
              <span>₹1,499/mo</span>
            </div>
            <div className="text-2xl font-bold text-purple-200">{planStats.pro.count} shops</div>
            <p className="text-[11px] text-purple-300 font-medium">
              Revenue: {formatCurrency(planStats.pro.revenue)}/mo
            </p>
          </div>

          <div className="bg-slate-950 border border-amber-950 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-amber-400">
              <span>Enterprise Plan</span>
              <span>₹3,999/mo</span>
            </div>
            <div className="text-2xl font-bold text-amber-200">{planStats.enterprise.count} shops</div>
            <p className="text-[11px] text-amber-300 font-medium">
              Revenue: {formatCurrency(planStats.enterprise.revenue)}/mo
            </p>
          </div>
        </div>
      </div>

      {/* Top 10 High-Performing Merchants Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Top Merchant Leaderboard</h2>
            <p className="text-xs text-slate-400">Highest grossing shops on zCart</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-full">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Top Sales Performers</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Orders Processed</th>
                <th className="py-3.5 px-4 text-right">Total Sales GMV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {topShops.map((shop, idx) => (
                <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {shop.name}
                    <span className="block text-[11px] font-normal font-mono text-slate-500">{shop.slug}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-indigo-300">
                      {shop.plan || 'free'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {shop.orders_count} orders
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm">
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

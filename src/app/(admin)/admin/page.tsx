import Link from 'next/link'
import { getSaaSAdminOverviewData } from '@/lib/auth/admin'
import { formatCurrency } from '@/lib/formatters'
import {
  Store,
  DollarSign,
  TrendingUp,
  Users,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react'

export const revalidate = 0 // Always dynamic stats

export default async function AdminDashboardPage() {
  const stats = await getSaaSAdminOverviewData()

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wide">
              Executive Overview
            </span>
            <span className="text-xs text-slate-400">Live Platform Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            SaaS Platform Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Monitor registered stores, total processed GMV, subscription earnings, and platform operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/shops"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Store className="w-4 h-4 text-white" />
            <span>Manage Shops ({stats.totalShops})</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Shops */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Shops</span>
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400">
              <Store className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{stats.totalShops}</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {stats.activeShops} Active
              </span>
              <span className="text-slate-500">•</span>
              <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                {stats.suspendedShops} Suspended
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: SaaS Platform Earnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Monthly MRR</span>
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(stats.estimatedMonthlyRevenue)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              SaaS plan subscription revenue
            </p>
          </div>
        </div>

        {/* Card 3: Total Platform GMV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Platform GMV</span>
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/50 text-purple-400">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(stats.totalGMV)}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Across {stats.totalOrdersCount} merchant orders
            </p>
          </div>
        </div>

        {/* Card 4: Registered Merchants */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Merchant Users</span>
            <div className="p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/50 text-sky-400">
              <Users className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{stats.totalMerchants}</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Global profiles registered
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Subscription Plan Tier Distribution</h2>
            <p className="text-xs text-slate-400">Active shops grouped by subscription tier</p>
          </div>
          <Link
            href="/admin/plans"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Manage Plans</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400">Free Tier</span>
            <div className="text-2xl font-bold text-slate-200 mt-1">{stats.planDistribution.free || 0}</div>
            <span className="text-[11px] text-slate-500 font-medium">₹0/mo per shop</span>
          </div>

          <div className="bg-slate-950/80 border border-indigo-950 rounded-xl p-4">
            <span className="text-xs font-semibold text-indigo-400">Starter Tier</span>
            <div className="text-2xl font-bold text-indigo-200 mt-1">{stats.planDistribution.starter || 0}</div>
            <span className="text-[11px] text-indigo-400/70 font-medium">₹499/mo per shop</span>
          </div>

          <div className="bg-slate-950/80 border border-purple-950 rounded-xl p-4">
            <span className="text-xs font-semibold text-purple-400">Pro Tier</span>
            <div className="text-2xl font-bold text-purple-200 mt-1">{stats.planDistribution.pro || 0}</div>
            <span className="text-[11px] text-purple-400/70 font-medium">₹1,499/mo per shop</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-950 rounded-xl p-4">
            <span className="text-xs font-semibold text-amber-400">Enterprise Tier</span>
            <div className="text-2xl font-bold text-amber-200 mt-1">{stats.planDistribution.enterprise || 0}</div>
            <span className="text-[11px] text-amber-400/70 font-medium">₹3,999/mo per shop</span>
          </div>
        </div>
      </div>

      {/* Recent Shop Registrations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Shop Registrations</h2>
            <p className="text-xs text-slate-400">Latest merchants registered on zCart</p>
          </div>
          <Link
            href="/admin/shops"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Shops ({stats.totalShops})</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Shop Details</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Current Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {stats.recentShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold flex items-center justify-center text-sm">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{shop.name}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{shop.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{shop.owner_name}</div>
                    <div className="text-[11px] text-slate-400">{shop.phone || 'No Phone'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      shop.plan === 'enterprise'
                        ? 'bg-amber-950/70 border border-amber-800/50 text-amber-400'
                        : shop.plan === 'pro'
                        ? 'bg-purple-950/70 border border-purple-800/50 text-purple-400'
                        : shop.plan === 'starter'
                        ? 'bg-indigo-950/70 border border-indigo-800/50 text-indigo-400'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {shop.plan || 'free'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {shop.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-950/60 text-rose-400 border border-rose-800/40">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(shop.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/shops?search=${encodeURIComponent(shop.slug)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium text-xs transition-colors"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-indigo-400" />
                    </Link>
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

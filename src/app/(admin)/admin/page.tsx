import Link from 'next/link'
import { getSaaSAdminOverviewData } from '@/lib/auth/admin'
import { formatCurrency } from '@/lib/formatters'
import {
  Store,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Building2,
  CreditCard
} from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const stats = await getSaaSAdminOverviewData()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="admin-badge admin-badge-starter" style={{ textTransform: 'uppercase' }}>
              Executive Overview
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Live Telemetry</span>
          </div>
          <h1 className="admin-page-title">SaaS Platform Dashboard</h1>
          <p className="admin-page-subtitle">
            Monitor registered stores, processed GMV, subscription earnings, and platform operations.
          </p>
        </div>
        <div>
          <Link href="/admin/shops" className="admin-btn admin-btn-primary">
            <Store size={16} />
            <span>Manage Shops ({stats.totalShops})</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
      <div className="admin-metrics-grid">
        {/* Card 1: Registered Shops */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Registered Shops</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--admin-primary)' }}>
              <Store size={20} />
            </div>
          </div>
          <div className="admin-card-value">{stats.totalShops}</div>
          <div className="admin-card-footer">
            <span className="admin-badge admin-badge-active">
              <CheckCircle2 size={12} />
              {stats.activeShops} Active
            </span>
            <span className="admin-badge admin-badge-suspended">
              <XCircle size={12} />
              {stats.suspendedShops} Suspended
            </span>
          </div>
        </div>

        {/* Card 2: SaaS MRR */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Est. Monthly MRR</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'var(--admin-emerald-bg)', color: 'var(--admin-emerald)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="admin-card-value">{formatCurrency(stats.estimatedMonthlyRevenue)}</div>
          <div className="admin-card-footer">
            <span>SaaS subscription recurring revenue</span>
          </div>
        </div>

        {/* Card 3: Total GMV */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Total Platform GMV</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'var(--admin-purple-bg)', color: 'var(--admin-purple)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="admin-card-value">{formatCurrency(stats.totalGMV)}</div>
          <div className="admin-card-footer">
            <span>Across {stats.totalOrdersCount} merchant orders</span>
          </div>
        </div>

        {/* Card 4: Registered Merchants */}
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="admin-card-label">Merchant Users</span>
            <div className="admin-card-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="admin-card-value">{stats.totalMerchants}</div>
          <div className="admin-card-footer">
            <span>Global user accounts</span>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Subscription Plan Tier Distribution</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>Active shops grouped by subscription tier</p>
          </div>
          <Link href="/admin/plans" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.75rem' }}>
            <span>Manage Plans</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)' }}>
            <span className="admin-badge admin-badge-free">Free Tier</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0' }}>{stats.planDistribution.free || 0}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)' }}>₹0/mo per shop</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <span className="admin-badge admin-badge-starter">Starter Tier</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c7d2fe', margin: '0.35rem 0' }}>{stats.planDistribution.starter || 0}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-primary)' }}>₹499/mo per shop</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <span className="admin-badge admin-badge-pro">Pro Tier</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e9d5ff', margin: '0.35rem 0' }}>{stats.planDistribution.pro || 0}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-purple)' }}>₹1,499/mo per shop</span>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span className="admin-badge admin-badge-enterprise">Enterprise Tier</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fde68a', margin: '0.35rem 0' }}>{stats.planDistribution.enterprise || 0}</div>
            <span style={{ fontSize: '0.7rem', color: 'var(--admin-amber)' }}>₹3,999/mo per shop</span>
          </div>
        </div>
      </div>

      {/* Recent Shop Registrations Table */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Recent Shop Registrations</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>Latest merchants registered on zCart</p>
          </div>
          <Link href="/admin/shops" className="admin-btn admin-btn-secondary" style={{ fontSize: '0.75rem' }}>
            <span>View All ({stats.totalShops})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Shop Details</th>
                <th>Owner</th>
                <th>Current Plan</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentShops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '10px',
                        backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)',
                        color: 'var(--admin-primary)', fontWeight: 'bold', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem'
                      }}>
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{shop.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)', fontFamily: 'monospace' }}>{shop.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{shop.owner_name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{shop.phone || 'No Phone'}</div>
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      shop.plan === 'enterprise' ? 'admin-badge-enterprise' :
                      shop.plan === 'pro' ? 'admin-badge-pro' :
                      shop.plan === 'starter' ? 'admin-badge-starter' : 'admin-badge-free'
                    }`}>
                      {shop.plan || 'free'}
                    </span>
                  </td>
                  <td>
                    {shop.is_active ? (
                      <span className="admin-badge admin-badge-active">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-suspended">
                        <XCircle size={12} /> Suspended
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                    {new Date(shop.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/admin/shops?search=${encodeURIComponent(shop.slug)}`} className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                      <span>Manage</span>
                      <ArrowRight size={12} />
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

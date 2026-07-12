import {
  LayoutDashboard, Package, Tag, ShoppingCart, Monitor, FileText,
  Warehouse, Users, TrendingUp,
} from 'lucide-react'

/**
 * Miniature, static rendering of the real merchant dashboard:
 * same sidebar sections, stat cards, revenue chart, and recent-orders
 * table the app shows after login (see app/(dashboard)/dashboard).
 */

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { section: 'Catalogue' },
  { icon: Package, label: 'Products' },
  { icon: Tag, label: 'Categories' },
  { section: 'Sales' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: Monitor, label: 'POS Billing' },
  { icon: FileText, label: 'Invoices' },
  { section: 'Operations' },
  { icon: Warehouse, label: 'Inventory' },
  { icon: Users, label: 'Customers' },
  { icon: TrendingUp, label: 'Analytics' },
]

const stats = [
  { label: 'Revenue Today', value: '₹24,580', trend: '47 orders', dir: 'up' },
  { label: '30-Day Revenue', value: '₹6.2L', trend: '+18% vs last month', dir: 'up' },
  { label: 'Active Products', value: '312', trend: 'Across 3 channels' },
  { label: 'Low Stock Items', value: '3', trend: 'Needs attention', dir: 'down' },
]

const bars = [38, 52, 34, 66, 58, 80, 100]

const orders = [
  { name: 'Anita Sharma', channel: 'POS', amount: '₹1,240', status: 'delivered', badge: 'success' },
  { name: 'Guest', channel: 'Online', amount: '₹2,860', status: 'pending', badge: 'warning' },
  { name: 'Ravi Traders', channel: 'WhatsApp', amount: '₹640', status: 'confirmed', badge: 'info' },
]

export default function DashboardMockup() {
  return (
    <div className="mock-app" aria-hidden="true">
      <div className="mock-titlebar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-url">app.zcart.space/dashboard</span>
      </div>
      <div className="mock-layout">
        <div className="mock-sidebar">
          {nav.map((item, i) =>
            item.section ? (
              <span key={i} className="mock-nav-section">{item.section}</span>
            ) : (
              <span key={i} className={`mock-nav-item ${item.active ? 'active' : ''}`}>
                {item.icon && <item.icon size={11} />}
                {item.label}
              </span>
            )
          )}
        </div>
        <div className="mock-main">
          <div className="mock-stat-grid">
            {stats.map((s) => (
              <div key={s.label} className="mock-stat">
                <div className="mock-stat-label">{s.label}</div>
                <div className="mock-stat-value">{s.value}</div>
                <div className={`mock-stat-trend ${s.dir ?? ''}`}>{s.trend}</div>
              </div>
            ))}
          </div>
          <div className="mock-panel">
            <div className="mock-panel-title">
              <span>Revenue</span>
              <span>Last 7 days</span>
            </div>
            <div className="mock-chart">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className={`mock-chart-bar ${i === bars.length - 1 ? 'hot' : ''}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="mock-panel">
            <div className="mock-panel-title">
              <span>Recent Orders</span>
              <span>View all</span>
            </div>
            {orders.map((o) => (
              <div key={o.name} className="mock-row">
                <span className="mock-row-name">{o.name}</span>
                <span className="mock-badge mock-badge--neutral">{o.channel}</span>
                <span className="mock-row-amount">{o.amount}</span>
                <span className={`mock-badge mock-badge--${o.badge}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

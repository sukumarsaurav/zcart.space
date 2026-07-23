import {
  LayoutDashboard, Package, Tag, ShoppingCart, Monitor, FileText,
  Warehouse, Users, TrendingUp, BookOpen, Truck, Receipt, FileSpreadsheet,
  Bell, Search, Store, ShieldCheck
} from 'lucide-react'

const nav = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { section: 'Sales & Counter' },
  { icon: Monitor, label: 'POS Billing' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: FileText, label: 'Invoices' },
  { icon: FileSpreadsheet, label: 'Estimates' },
  { section: 'Inventory & Credit' },
  { icon: Package, label: 'Products' },
  { icon: Warehouse, label: 'Inventory' },
  { icon: Truck, label: 'Purchases' },
  { icon: BookOpen, label: 'Khata Ledger' },
  { icon: Receipt, label: 'Expenses' },
]

const stats = [
  { label: 'Revenue Today', value: '₹24,580', trend: '47 orders', dir: 'up' },
  { label: '30-Day Revenue', value: '₹6.2L', trend: '+18% vs last month', dir: 'up' },
  { label: 'Active Products', value: '312', trend: 'Across 3 channels' },
  { label: 'Low Stock Alerts', value: '3 items', trend: 'Needs reorder', dir: 'down' },
]

const bars = [38, 52, 34, 66, 58, 80, 100]

const orders = [
  { name: 'Anita Sharma', channel: 'POS', amount: '₹1,240', status: 'Delivered', badge: 'success' },
  { name: 'Rahul Patel', channel: 'Online', amount: '₹2,860', status: 'Processing', badge: 'info' },
  { name: 'Ravi Traders', channel: 'WhatsApp', amount: '₹640', status: 'Confirmed', badge: 'info' },
]

export default function DashboardMockup() {
  return (
    <div className="mock-app" aria-hidden="true" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
      {/* Titlebar */}
      <div className="mock-titlebar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-url" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={11} color="var(--color-success-500)" /> app.zcart.space/dashboard
        </span>
      </div>

      {/* Mock Header Bar */}
      <div style={{ background: '#0b1120', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>
            Z
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>Sharma General Store</span>
          <span className="badge badge-success" style={{ fontSize: 9, padding: '1px 5px' }}>Live</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, fontSize: 10, color: '#94a3b8' }}>
            <Search size={10} /> Search sales, products...
          </div>
          <Bell size={12} color="#94a3b8" />
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#6366f1', fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            S
          </div>
        </div>
      </div>

      {/* Main Layout */}
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
              <span>Weekly Sales Revenue</span>
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
              <span>Recent Orders & Transactions</span>
              <span style={{ color: 'var(--color-primary-400)', cursor: 'pointer' }}>View all</span>
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

      {/* Floating Live Transaction Toast Chip */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          background: '#0f172a',
          border: '1px solid #6366f1',
          borderRadius: '12px',
          padding: '8px 14px',
          color: '#f8fafc',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
        <span>POS Sale Billed: <strong>+₹1,240</strong></span>
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>Just now</span>
      </div>
    </div>
  )
}

import { Globe, Monitor, MessageCircle } from 'lucide-react'

/**
 * Static preview of the Inventory screen: one stock pool shared by every
 * sales channel, reorder points, and the low-stock states the dashboard
 * surfaces (see app/(dashboard)/inventory and LowStockWidget).
 */

const rows = [
  { name: 'Basmati Rice 5kg', stock: '42', reorder: '10', status: 'In stock', badge: 'success' },
  { name: 'Sunflower Oil 1L', stock: '8', reorder: '12', status: 'Low stock', badge: 'warning' },
  { name: 'Masala Chai 250g', stock: '0', reorder: '6', status: 'Out', badge: 'danger' },
]

const channels = [
  { icon: Globe, label: 'Online' },
  { icon: Monitor, label: 'POS' },
  { icon: MessageCircle, label: 'WhatsApp' },
]

export default function InventoryMockup() {
  return (
    <div className="mock-app" aria-hidden="true">
      <div className="mock-titlebar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-url">app.zcart.space/inventory</span>
      </div>
      <div className="mock-main">
        <div className="mock-panel">
          <div className="mock-panel-title">
            <span>Inventory — Main Store</span>
            <span className="mock-badge mock-badge--success">Live sync</span>
          </div>
          <div className="mock-row">
            {channels.map((c) => (
              <span key={c.label} className="mock-badge mock-badge--neutral">
                <c.icon size={9} /> {c.label}
              </span>
            ))}
            <span className="mock-row-sub">one shared stock pool</span>
          </div>
          {rows.map((r) => (
            <div key={r.name} className="mock-row">
              <span className="mock-row-name">{r.name}</span>
              <span className="mock-row-sub">{r.stock} in stock · reorder at {r.reorder}</span>
              <span className={`mock-badge mock-badge--${r.badge}`}>{r.status}</span>
            </div>
          ))}
        </div>
        <div className="mock-panel">
          <div className="mock-panel-title">
            <span>Stock Ledger</span>
            <span>Immutable audit trail</span>
          </div>
          <div className="mock-row">
            <span className="mock-row-name">Sunflower Oil 1L</span>
            <span className="mock-badge mock-badge--neutral">POS sale</span>
            <span className="mock-row-amount">−2</span>
            <span className="mock-row-sub">2:41 pm</span>
          </div>
          <div className="mock-row">
            <span className="mock-row-name">Basmati Rice 5kg</span>
            <span className="mock-badge mock-badge--neutral">Online order</span>
            <span className="mock-row-amount">−1</span>
            <span className="mock-row-sub">2:36 pm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

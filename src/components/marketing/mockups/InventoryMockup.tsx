import React from 'react'
import { Globe, Monitor, MessageCircle, Barcode, ShieldCheck, ArrowRight } from 'lucide-react'

const rows = [
  { name: 'Basmati Rice 5kg', sku: 'SKU-BR-500', stock: 42, reorder: 10, status: 'In stock', badge: 'success' },
  { name: 'Sunflower Oil 1L', sku: 'SKU-SO-100', stock: 8, reorder: 12, status: 'Low stock', badge: 'warning' },
  { name: 'Masala Chai 250g', sku: 'SKU-MC-250', stock: 0, reorder: 6, status: 'Out of stock', badge: 'danger' },
]

const channels = [
  { icon: Globe, label: 'Online Storefront' },
  { icon: Monitor, label: 'Counter POS' },
  { icon: MessageCircle, label: 'WhatsApp Sales' },
]

export default function InventoryMockup() {
  return (
    <div className="mock-app" aria-hidden="true" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
      {/* Titlebar */}
      <div className="mock-titlebar">
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-dot" />
        <span className="mock-url">app.zcart.space/inventory</span>
      </div>

      <div className="mock-main" style={{ padding: '12px' }}>
        {/* Top Channel Sync Band */}
        <div className="mock-panel" style={{ marginBottom: '10px' }}>
          <div className="mock-panel-title">
            <span style={{ fontWeight: 700 }}>Unified Central Inventory</span>
            <span className="mock-badge mock-badge--success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={10} /> Live Real-time Sync
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {channels.map((c) => (
              <span key={c.label} className="mock-badge mock-badge--neutral" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
                <c.icon size={10} color="var(--color-primary-400)" /> {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stock Items */}
        <div className="mock-panel" style={{ marginBottom: '10px' }}>
          <div className="mock-panel-title">
            <span>Product Stock & Reorder Points</span>
            <span style={{ fontSize: '9px', color: 'var(--mk-text-3)' }}>3 items tracked</span>
          </div>

          {rows.map((r) => {
            const pct = Math.min(100, Math.round((r.stock / (r.reorder * 2)) * 100))
            return (
              <div key={r.name} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '11px', color: '#f8fafc', display: 'block' }}>{r.name}</span>
                    <span style={{ fontSize: '9px', color: 'var(--mk-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Barcode size={9} /> {r.sku}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`mock-badge mock-badge--${r.badge}`}>{r.status}</span>
                    <span style={{ fontSize: '9px', color: 'var(--mk-text-3)', display: 'block', marginTop: 2 }}>{r.stock} units left</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: r.badge === 'success' ? '#22c55e' : r.badge === 'warning' ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Stock Ledger */}
        <div className="mock-panel">
          <div className="mock-panel-title">
            <span>Stock Ledger Audit Trail</span>
            <span>Immutable History</span>
          </div>

          <div className="mock-row">
            <span className="mock-row-name">Sunflower Oil 1L</span>
            <span className="mock-badge mock-badge--neutral">POS Sale</span>
            <span className="mock-row-amount" style={{ color: '#ef4444' }}>−2</span>
            <span className="mock-row-sub">2:41 pm</span>
          </div>

          <div className="mock-row">
            <span className="mock-row-name">Basmati Rice 5kg</span>
            <span className="mock-badge mock-badge--neutral">Online Order</span>
            <span className="mock-row-amount" style={{ color: '#ef4444' }}>−1</span>
            <span className="mock-row-sub">2:36 pm</span>
          </div>

          <div className="mock-row">
            <span className="mock-row-name">Masala Chai 250g</span>
            <span className="mock-badge mock-badge--success">Purchase Stock Inward</span>
            <span className="mock-row-amount" style={{ color: '#22c55e' }}>+24</span>
            <span className="mock-row-sub">11:15 am</span>
          </div>
        </div>
      </div>
    </div>
  )
}

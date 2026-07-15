import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface Props { items: any[] }

export default function LowStockWidget({ items }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <AlertTriangle size={16} color="var(--color-warning-400)" />
          <div>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Low Stock</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Items at or below reorder point</p>
          </div>
        </div>
        <Link href="/inventory" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-1)' }}>
          Manage <ArrowRight size={12} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-full)',
            background: 'rgba(34,197,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-success-400)',
          }}>
            <AlertTriangle size={18} />
          </div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>All products well stocked</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>No items below reorder point</p>
        </div>
      ) : (
        <div style={{ padding: 'var(--space-2) 0' }}>
          {items.map((item, i) => {
            const pct = item.reorder_point > 0
              ? Math.min(100, Math.round((item.quantity / item.reorder_point) * 100))
              : 100
            const isCritical = item.quantity === 0
            const isLow = item.quantity <= Math.floor(item.reorder_point * 0.5)

            return (
              <div key={item.product_id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-6)',
                borderBottom: i < items.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
              }}>
                {/* Product name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.products?.name ?? 'Unknown'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 4 }}>
                    <div style={{
                      flex: 1, height: 4, background: 'var(--surface-elevated)',
                      borderRadius: 'var(--radius-full)', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: isCritical
                          ? 'var(--color-danger-500)'
                          : isLow
                            ? 'var(--color-warning-500)'
                            : 'var(--color-success-500)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                </div>
                {/* Stock count */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span className={`badge ${isCritical ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-neutral'}`}>
                    {item.quantity} left
                  </span>
                  <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>min {item.reorder_point}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

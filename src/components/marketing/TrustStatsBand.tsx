import React from 'react'
import { ShieldCheck, Store, Receipt, Zap, Star } from 'lucide-react'

const stats = [
  { icon: Store, value: '50,000+', label: 'Active Local Shops', sub: 'Across 200+ Indian cities' },
  { icon: Receipt, value: '₹500Cr+', label: 'GST Invoices Issued', sub: 'Fully automated compliance' },
  { icon: ShieldCheck, value: '100% Data Safe', label: 'Cloud Encrypted', sub: 'Instant automatic backup' },
  { icon: Zap, value: '99.99%', label: 'Platform Uptime', sub: 'Reliable counter billing' },
]

export default function TrustStatsBand() {
  return (
    <div className="mkt-trust-band" style={{ padding: 'var(--space-8) 0', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-subtle)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Rating Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>4.9/5 Rating</span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>• Trusted by Kirana, Apparel, Electronics & Retail Merchants</span>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)', textAlign: 'center' }}>
          {stats.map((item) => (
            <div key={item.label} style={{ padding: 'var(--space-4)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-500)', marginBottom: '12px' }}>
                <item.icon size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {item.value}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 2px' }}>
                {item.label}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

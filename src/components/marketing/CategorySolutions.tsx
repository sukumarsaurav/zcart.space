import React from 'react'
import { ShoppingBag, Shirt, Smartphone, Utensils, Check } from 'lucide-react'

const categories = [
  {
    icon: ShoppingBag,
    title: 'Kirana & Supermarkets',
    subtitle: 'Fast barcode scanning, loose quantity weight sales & item batch expiry tracking.',
    highlights: ['Barcode scanner & weighing scale integration', 'Loose item pricing per gram/kg', 'Expiring stock alert dashboard'],
  },
  {
    icon: Shirt,
    title: 'Fashion & Apparel',
    subtitle: 'Manage sizes, colours, and fashion lookbooks with an elegant online catalog.',
    highlights: ['Multi-attribute product matrix (Size/Colour)', 'Lookbook storefront layout templates', 'Discount coupons & flash sale manager'],
  },
  {
    icon: Smartphone,
    title: 'Electronics & Mobiles',
    subtitle: 'Track serial numbers, IMEI tags, GST tax splits & manufacturer warranty details.',
    highlights: ['Serial/IMEI number tracking on invoices', 'GST HSN tax code auto-calculation', 'Supplier purchase inward tracking'],
  },
  {
    icon: Utensils,
    title: 'Cafes & Restaurants',
    subtitle: 'Quick counter billing, instant order printouts & WhatsApp digital receipts.',
    highlights: ['Quick-tap menu checkout grid', 'Kitchen order printing / display ready', 'Digital WhatsApp invoice sharing'],
  },
]

export default function CategorySolutions() {
  return (
    <div style={{ padding: 'var(--space-12) 0', background: 'var(--surface-subtle)', borderTop: '1px solid var(--surface-border)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8)' }}>
          <span style={{ color: 'var(--color-primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>
            Tailored Workflows
          </span>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '8px 0 12px' }}>
            Built for your specific industry
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', margin: 0 }}>
            Shopz comes pre-configured with industry features designed for your business model.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
          {categories.map((item) => (
            <div
              key={item.title}
              className="card card-hover"
              style={{
                padding: 'var(--space-6)',
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <item.icon size={22} />
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0 0 8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  {item.subtitle}
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--surface-border)', paddingTop: '16px' }}>
                {item.highlights.map((h, idx) => (
                  <li key={idx} style={{ fontSize: 'var(--text-xs)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                    <Check size={14} color="var(--color-primary-500)" style={{ flexShrink: 0 }} />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

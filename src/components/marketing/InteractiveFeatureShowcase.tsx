'use client'

import React, { useState } from 'react'
import { Receipt, Barcode, Package, Store, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react'
import InvoiceMockup from './mockups/InvoiceMockup'
import DashboardMockup from './mockups/DashboardMockup'
import InventoryMockup from './mockups/InventoryMockup'
import StorefrontMockup from './mockups/StorefrontMockup'

const tabs = [
  {
    id: 'invoicing',
    label: 'GST Billing',
    icon: Receipt,
    badge: '100% Tax Compliant',
    title: 'Instant GST Invoices & E-way Bill Ready',
    description: 'Auto-calculate CGST, SGST, IGST with exact HSN codes. Send professional PDF invoices directly to customer WhatsApp or email in one click.',
    bullets: ['Auto-numbered financial year series', 'HSN & SAC code catalog library', 'Instant PDF share via WhatsApp', 'One-click GSTR-1 & GSTR-3B tax exports'],
    visual: <InvoiceMockup />,
  },
  {
    id: 'pos',
    label: 'Speed POS',
    icon: Barcode,
    badge: 'Hardware Ready',
    title: 'Lightning-Fast Counter Billing on Any Device',
    description: 'Turn any laptop, tablet, or phone into a high-speed POS. Scan barcodes, apply instant discounts, and checkout customers in under 5 seconds.',
    bullets: ['Barcode scanner & thermal printer support', 'Offline mode billing support', 'Multi-payment checkout (UPI, Cash, Card)', 'Split billing & credit sales'],
    visual: <DashboardMockup />,
  },
  {
    id: 'inventory',
    label: 'Live Inventory',
    icon: Package,
    badge: 'Auto-Sync',
    title: 'Real-time Stock Pool Across Storefront & Counter',
    description: 'Every sale — counter, online storefront, or WhatsApp — updates the central inventory ledger instantly. Never oversell again.',
    bullets: ['Automated reorder point notifications', 'Batch number & expiry date tracking', 'Variant management (Size, Colour, Weight)', 'Multi-godown & shop location tracking'],
    visual: <InventoryMockup />,
  },
  {
    id: 'storefront',
    label: 'Online Storefront',
    icon: Store,
    badge: 'Mobile Optimized',
    title: 'Your Own E-Commerce Storefront in 2 Minutes',
    description: 'Give your local shop a professional digital storefront. Accept online orders, showcase catalogs, and share product links directly on social media.',
    bullets: ['Custom domain & custom branding themes', 'WhatsApp direct checkout integration', 'Online payment gateway integration', 'Customer reviews & wishlist collection'],
    visual: <StorefrontMockup />,
  },
  {
    id: 'khata',
    label: 'Digital Khata',
    icon: CreditCard,
    badge: 'Automatic Reminders',
    title: 'Customer & Vendor Udhar Credit Ledger',
    description: 'Replace paper notebook khatas with digital ledger tracking. Send automated WhatsApp payment reminders with UPI payment links to collect dues 3x faster.',
    bullets: ['Customer credit & vendor payable ledgers', 'One-click WhatsApp payment reminder links', 'Automated credit limit warnings', 'Full audit trail history'],
    visual: (
      <div className="card" style={{ padding: 'var(--space-6)', background: 'var(--surface-elevated)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontWeight: 700, margin: 0, fontSize: '16px' }}>Customer Credit Ledger (Udhar Khata)</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Outstanding Receivables Tracking</p>
          </div>
          <span className="badge badge-warning">₹42,850 Due</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { name: 'Sharma Kirana Store', balance: '₹12,400', date: '2 days ago', status: 'Reminder Sent' },
            { name: 'Rajesh Garments', balance: '₹18,250', date: 'Yesterday', status: 'Payment Due' },
            { name: 'Anand Electronics', balance: '₹12,200', date: 'Today', status: 'Collected' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '14px', display: 'block' }}>{item.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.date}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary-500)', display: 'block' }}>{item.balance}</span>
                <span className={`badge ${item.status === 'Collected' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function InteractiveFeatureShowcase() {
  const [activeTabId, setActiveTabId] = useState('invoicing')
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  return (
    <div style={{ padding: 'var(--space-12) 0', background: 'var(--bg-base)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8)' }}>
          <span className="mkt-eyebrow" style={{ display: 'inline-block', marginBottom: '8px', color: 'var(--color-primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Powerful Feature Suite
          </span>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '0 0 12px' }}>
            Everything your shop needs to sell and scale
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', margin: 0 }}>
            Click through the core modules built specifically for Indian retail and wholesale merchants.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  gap: '8px',
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 20px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Display */}
        <div
          className="card"
          style={{
            padding: 'var(--space-8)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
            background: 'var(--surface-card)',
            boxShadow: 'var(--shadow-xl)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--surface-border)',
          }}
        >
          {/* Left Text */}
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '16px', fontSize: 'var(--text-xs)' }}>
              {activeTab.badge}
            </span>
            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
              {activeTab.title}
            </h3>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              {activeTab.description}
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeTab.bullets.map((bullet, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={18} color="var(--color-primary-500)" style={{ flexShrink: 0 }} />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Visual */}
          <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            {activeTab.visual}
          </div>
        </div>

      </div>
    </div>
  )
}

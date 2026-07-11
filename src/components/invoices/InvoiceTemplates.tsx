import React from 'react'
import { format } from 'date-fns'

export interface InvoiceProps {
  invoice: any
  shop: any
  location: any
  order: any
  customer: any
  items: any[]
}

const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

export function ClassicInvoice({ invoice, shop, location, order, customer, items }: InvoiceProps) {
  const pc = shop?.theme?.primary_color ?? '#6366f1'
  return (
    <div style={{ background: '#ffffff', color: '#111827', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid #e5e7eb', width: '100%', minHeight: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e5e7eb', paddingBottom: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div>
          {shop?.logo_url ? (
            <img src={shop.logo_url} alt={shop.name} style={{ height: 48, objectFit: 'contain', marginBottom: 'var(--space-4)' }} />
          ) : (
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: pc, marginBottom: 'var(--space-2)' }}>{shop?.name}</h1>
          )}
          <p style={{ fontSize: 'var(--text-sm)', color: '#4b5563', lineHeight: 1.5 }}>
            {location?.address_line1}<br />
            {location?.city}, {location?.state} - {location?.pincode}<br />
            {shop?.phone && `Phone: ${shop.phone}`}<br />
            {shop?.gstin && <strong style={{ color: '#111827' }}>GSTIN: {shop.gstin}</strong>}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 300, color: '#9ca3af', marginBottom: 'var(--space-2)' }}>INVOICE</h2>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>#{invoice.invoice_number}</p>
          <p style={{ fontSize: 'var(--text-sm)', color: '#4b5563', marginTop: 'var(--space-2)' }}>
            Date: {format(new Date(invoice.invoice_date || new Date()), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Bill To</h3>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{customer?.name ?? 'Walk-in Customer'}</p>
          {customer?.phone && <p style={{ fontSize: 'var(--text-sm)', color: '#4b5563' }}>{customer.phone}</p>}
          {customer?.gstin && <p style={{ fontSize: 'var(--text-sm)', color: '#4b5563', marginTop: 4 }}><strong>GSTIN:</strong> {customer.gstin}</p>}
        </div>
        {order?.shipping_address && (
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>Ship To</h3>
            {Object.values(order.shipping_address as Record<string, string>).filter(Boolean).map((v, i) => (
              <p key={i} style={{ fontSize: 'var(--text-sm)', color: '#4b5563' }}>{v}</p>
            ))}
          </div>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-8)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ textAlign: 'left', padding: 'var(--space-3) 0', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Description</th>
            <th style={{ textAlign: 'center', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Price</th>
            <th style={{ textAlign: 'right', padding: 'var(--space-3) 0', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item: any, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: 'var(--space-4) 0', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.product_name}</td>
              <td style={{ textAlign: 'center', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: '#4b5563' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: '#4b5563' }}>{fmtINR(Number(item.unit_price))}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-4) 0', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fmtINR(Number(item.line_total))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)', color: '#4b5563' }}>
            <span>Subtotal</span>
            <span>{fmtINR(Number(invoice.total_amount) - Number(invoice.tax_total))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', fontSize: 'var(--text-sm)', color: '#4b5563' }}>
            <span>Tax (GST)</span>
            <span>{fmtINR(Number(invoice.tax_total))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-4) 0', borderTop: '2px solid #e5e7eb', marginTop: 'var(--space-2)', fontSize: 'var(--text-lg)', fontWeight: 800, color: '#111827' }}>
            <span>Total</span>
            <span>{fmtINR(Number(invoice.total_amount))}</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-6)', borderTop: '1px solid #e5e7eb', fontSize: 'var(--text-xs)', color: '#6b7280', textAlign: 'center' }}>
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}

export function ModernInvoice({ invoice, shop, location, order, customer, items }: InvoiceProps) {
  const pc = shop?.theme?.primary_color ?? '#0f172a'
  return (
    <div style={{ background: '#ffffff', color: '#0f172a', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', width: '100%', minHeight: 800, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          {shop?.logo_url ? (
            <img src={shop.logo_url} alt={shop.name} style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 40, height: 40, background: pc, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
              {shop?.name?.charAt(0)}
            </div>
          )}
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#0f172a' }}>{shop?.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-block', background: pc, color: '#fff', padding: '4px 12px', borderRadius: 16, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em' }}>
            INVOICE
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ flex: 1, padding: 'var(--space-6)', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>Billed To</p>
          <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: '#0f172a' }}>{customer?.name ?? 'Guest'}</p>
          <p style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>{customer?.phone}</p>
        </div>
        <div style={{ flex: 1, padding: 'var(--space-6)', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>Invoice Details</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>Number</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>#{invoice.invoice_number}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: '#475569' }}>Date</span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{format(new Date(invoice.invoice_date || new Date()), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 'var(--space-8)' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#475569', borderRadius: '8px 0 0 8px' }}>Item</th>
            <th style={{ textAlign: 'center', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#475569' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#475569' }}>Price</th>
            <th style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: '#475569', borderRadius: '0 8px 8px 0' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item: any, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.product_name}</td>
              <td style={{ textAlign: 'center', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: '#475569' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', color: '#475569' }}>{fmtINR(Number(item.unit_price))}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fmtINR(Number(item.line_total))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 'var(--space-6)' }}>
        <div style={{ width: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--text-sm)', color: '#475569' }}>
            <span>Subtotal</span>
            <span>{fmtINR(Number(invoice.total_amount) - Number(invoice.tax_total))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 'var(--text-sm)', color: '#475569' }}>
            <span>Tax</span>
            <span>{fmtINR(Number(invoice.tax_total))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: '#f8fafc', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-lg)', fontWeight: 700, color: pc }}>
            <span>Total</span>
            <span>{fmtINR(Number(invoice.total_amount))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { QrCode, CheckCircle, ShieldCheck } from 'lucide-react'

export default function InvoiceMockup() {
  return (
    <div
      className="mock-invoice"
      aria-hidden="true"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--surface-border)',
        background: '#ffffff',
        color: '#0f172a',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div className="mock-invoice-head" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#4f46e5' }}>TAX INVOICE</h4>
            <span style={{ fontSize: '9px', background: '#e0e7ff', color: '#4338ca', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>GST Registered</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, marginTop: 4 }}>Sharma General Store</div>
          <div className="mock-invoice-meta" style={{ color: '#64748b' }}>GSTIN: 27ABCDE1234F1Z5</div>
          <div className="mock-invoice-meta" style={{ color: '#64748b' }}>Mumbai, Maharashtra</div>
        </div>

        <div className="mock-invoice-meta" style={{ textAlign: 'right', color: '#64748b' }}>
          <div style={{ fontSize: '12px', color: '#0f172a' }}><strong>Invoice #: INV-2026-00047</strong></div>
          <div>Date: 12 Jul 2026</div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: '9px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
              ORIGINAL FOR RECIPIENT
            </span>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '12px', fontSize: '10px' }}>
        <div>
          <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Billed To:</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>Anita Sharma</span> (Retail Customer)
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ color: '#64748b', display: 'block', fontSize: '9px', textTransform: 'uppercase', fontWeight: 700 }}>Place of Supply:</span>
          <span>Maharashtra (27)</span>
        </div>
      </div>

      {/* Table */}
      <table className="mock-invoice-table" style={{ fontSize: '11px', width: '100%', marginBottom: '12px' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px' }}>Item Description</th>
            <th style={{ padding: '6px 8px' }}>HSN</th>
            <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '6px 8px', fontWeight: 600 }}>Basmati Rice 5kg</td>
            <td style={{ padding: '6px 8px', color: '#64748b' }}>1006</td>
            <td style={{ padding: '6px 8px', textAlign: 'center' }}>2</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹1,180</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '6px 8px', fontWeight: 600 }}>Sunflower Oil 1L</td>
            <td style={{ padding: '6px 8px', color: '#64748b' }}>1512</td>
            <td style={{ padding: '6px 8px', textAlign: 'center' }}>3</td>
            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>₹472</td>
          </tr>
        </tbody>
      </table>

      {/* Totals & UPI QR Code */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
          <QrCode size={24} color="#0f172a" />
          <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
            <strong style={{ display: 'block', color: '#0f172a' }}>Scan to Pay via UPI</strong>
            Instant settlement ready
          </div>
        </div>

        <div className="mock-invoice-totals" style={{ fontSize: '10px', minWidth: '160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>Taxable value</span><span>₹1,400</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>CGST @ 9%</span><span>₹126</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>SGST @ 9%</span><span>₹126</span></div>
          <div className="grand" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '12px', color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: '4px', marginTop: '4px' }}>
            <span>Total</span><span>₹1,652</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mock-invoice-foot" style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '9px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShieldCheck size={11} color="#16a34a" /> PDF generated & WhatsApped automatically
        </span>
        <span className="mock-stamp" style={{ border: '2px solid #16a34a', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontWeight: 900, fontSize: '10px' }}>
          PAID
        </span>
      </div>
    </div>
  )
}

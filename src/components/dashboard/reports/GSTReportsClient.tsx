'use client'

import { useState } from 'react'
import { FileSpreadsheet, Download, Building2, UserCheck, ShieldCheck } from 'lucide-react'

interface InvoiceRecord {
  id: string
  invoice_number: string
  invoice_date: string
  subtotal: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_amount: number
  buyer_name: string | null
  buyer_gstin: string | null
}

interface OrderItemRecord {
  gst_rate: string
  taxable_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  line_total: number
}

interface GSTReportsClientProps {
  shopName: string
  gstin: string
  invoices: InvoiceRecord[]
  orderItems: OrderItemRecord[]
}

export default function GSTReportsClient({
  shopName,
  gstin,
  invoices,
  orderItems,
}: GSTReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'gstr1' | 'gstr3b' | 'slabs'>('gstr1')

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  // Totals
  const totalTaxable = invoices.reduce((acc, i) => acc + Number(i.subtotal || 0), 0)
  const totalCGST = invoices.reduce((acc, i) => acc + Number(i.cgst_amount || 0), 0)
  const totalSGST = invoices.reduce((acc, i) => acc + Number(i.sgst_amount || 0), 0)
  const totalIGST = invoices.reduce((acc, i) => acc + Number(i.igst_amount || 0), 0)
  const totalTaxCollected = totalCGST + totalSGST + totalIGST
  const totalGrossTurnover = invoices.reduce((acc, i) => acc + Number(i.total_amount || 0), 0)

  // B2B vs B2C
  const b2bInvoices = invoices.filter((i) => i.buyer_gstin && i.buyer_gstin.trim() !== '')
  const b2cInvoices = invoices.filter((i) => !i.buyer_gstin || i.buyer_gstin.trim() === '')

  // Slab wise breakdown
  const SLABS = ['0', '5', '12', '18', '28']
  const slabBreakdown = SLABS.map((slab) => {
    const items = orderItems.filter((it) => String(it.gst_rate) === slab)
    const taxable = items.reduce((acc, it) => acc + Number(it.taxable_amount || 0), 0)
    const cgst = items.reduce((acc, it) => acc + Number(it.cgst_amount || 0), 0)
    const sgst = items.reduce((acc, it) => acc + Number(it.sgst_amount || 0), 0)
    const igst = items.reduce((acc, it) => acc + Number(it.igst_amount || 0), 0)
    const taxTotal = cgst + sgst + igst
    return { slab, count: items.length, taxable, cgst, sgst, igst, taxTotal }
  })

  // Download CSV export
  const downloadGSTR1CSV = () => {
    const headers = ['Invoice Number', 'Invoice Date', 'Buyer Name', 'Buyer GSTIN', 'Subtotal (Taxable)', 'CGST', 'SGST', 'IGST', 'Total Invoice Amount']
    const rows = invoices.map((i) => [
      i.invoice_number,
      i.invoice_date,
      `"${i.buyer_name || 'Walk-in Customer'}"`,
      i.buyer_gstin || '',
      i.subtotal.toFixed(2),
      i.cgst_amount.toFixed(2),
      i.sgst_amount.toFixed(2),
      i.igst_amount.toFixed(2),
      i.total_amount.toFixed(2),
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `GSTR1_Report_${shopName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      {/* Shop GSTIN Banner */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))' }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Filing Entity</span>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '2px 0' }}>{shopName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-success-500)' }} /> GSTIN: <strong>{gstin}</strong>
          </div>
        </div>

        <button onClick={downloadGSTR1CSV} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <Download size={16} /> Export GSTR-1 CSV
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Gross Sales Turnover</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginTop: 4 }}>{fmtINR(totalGrossTurnover)}</p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{invoices.length} Tax Invoices</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Taxable Sales Value</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginTop: 4, color: 'var(--color-primary-500)' }}>{fmtINR(totalTaxable)}</p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Net of GST</span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Total GST Tax Liability</span>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginTop: 4, color: 'var(--color-warning-500)' }}>{fmtINR(totalTaxCollected)}</p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>CGST ({fmtINR(totalCGST)}) + SGST ({fmtINR(totalSGST)})</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--surface-border)', marginBottom: 'var(--space-5)' }}>
        <button
          onClick={() => setActiveTab('gstr1')}
          className={`btn btn-ghost ${activeTab === 'gstr1' ? 'btn-primary' : ''}`}
          style={{ borderRadius: 0, borderBottom: activeTab === 'gstr1' ? '2px solid var(--color-primary-500)' : 'none' }}
        >
          GSTR-1 Outward Supplies ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('slabs')}
          className={`btn btn-ghost ${activeTab === 'slabs' ? 'btn-primary' : ''}`}
          style={{ borderRadius: 0, borderBottom: activeTab === 'slabs' ? '2px solid var(--color-primary-500)' : 'none' }}
        >
          GST Slab Wise Summary
        </button>
        <button
          onClick={() => setActiveTab('gstr3b')}
          className={`btn btn-ghost ${activeTab === 'gstr3b' ? 'btn-primary' : ''}`}
          style={{ borderRadius: 0, borderBottom: activeTab === 'gstr3b' ? '2px solid var(--color-primary-500)' : 'none' }}
        >
          GSTR-3B Tax Summary
        </button>
      </div>

      {/* Tab 1: GSTR-1 Invoices */}
      {activeTab === 'gstr1' && (
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="badge badge-neutral" style={{ padding: 'var(--space-2) var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building2 size={14} /> B2B Registered: <strong>{b2bInvoices.length} invoices</strong>
            </div>
            <div className="badge badge-neutral" style={{ padding: 'var(--space-2) var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={14} /> B2C Consumer: <strong>{b2cInvoices.length} invoices</strong>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer / GSTIN</th>
                  <th>Taxable Value</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {!invoices.length ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                      No tax invoices generated yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{inv.invoice_number}</td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{inv.invoice_date}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{inv.buyer_name || 'Walk-in Customer'}</div>
                        {inv.buyer_gstin && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-500)' }}>GSTIN: {inv.buyer_gstin}</div>}
                      </td>
                      <td>{fmtINR(inv.subtotal)}</td>
                      <td>{fmtINR(inv.cgst_amount)}</td>
                      <td>{fmtINR(inv.sgst_amount)}</td>
                      <td style={{ fontWeight: 700 }}>{fmtINR(inv.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: GST Slab Breakdown */}
      {activeTab === 'slabs' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>GST Rate Slab</th>
                <th>Items Sold</th>
                <th>Taxable Value</th>
                <th>CGST Amount</th>
                <th>SGST Amount</th>
                <th>Total Tax Collected</th>
              </tr>
            </thead>
            <tbody>
              {slabBreakdown.map((s) => (
                <tr key={s.slab}>
                  <td style={{ fontWeight: 700 }}>GST {s.slab}%</td>
                  <td>{s.count} items</td>
                  <td>{fmtINR(s.taxable)}</td>
                  <td>{fmtINR(s.cgst)}</td>
                  <td>{fmtINR(s.sgst)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-warning-500)' }}>{fmtINR(s.taxTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: GSTR-3B Liability */}
      {activeTab === 'gstr3b' && (
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
            Summary Statement of Outward Taxable Supplies (GSTR-3B Table 3.1)
          </h3>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nature of Supplies</th>
                  <th>Total Taxable Value</th>
                  <th>Integrated Tax (IGST)</th>
                  <th>Central Tax (CGST)</th>
                  <th>State Tax (SGST)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(totalTaxable)}</td>
                  <td>{fmtINR(totalIGST)}</td>
                  <td>{fmtINR(totalCGST)}</td>
                  <td>{fmtINR(totalSGST)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

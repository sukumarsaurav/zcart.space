'use client'

import { useState } from 'react'
import { Plus, FileCheck, Calendar, ArrowRight, X, Check } from 'lucide-react'
import { createEstimateRecord, convertEstimateToInvoice } from '@/app/(dashboard)/estimates/actions'
import { useRouter } from 'next/navigation'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { formatCurrency, getStatusBadgeClass } from '@/lib/formatters'

interface ProductOption {
  id: string
  name: string
  selling_price: number
  gst_rate: string
}

interface CustomerOption {
  id: string
  name: string
}

interface EstimateRecord {
  id: string
  estimate_number: string
  estimate_date: string
  status: string
  total_amount: number
  converted_order_id: string | null
  customers?: { name: string } | null
}

interface EstimatesClientProps {
  estimates: EstimateRecord[]
  products: ProductOption[]
  customers: CustomerOption[]
}

export default function EstimatesClient({ estimates, products, customers }: EstimatesClientProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [convertingId, setConvertingId] = useState<string | null>(null)

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [validUntil, setValidUntil] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const [lineItems, setLineItems] = useState<Array<{
    productId?: string | null
    productName: string
    quantity: number
    unitPrice: number
    gstRate: string
  }>>([])

  // Selection inputs
  const [curProductId, setCurProductId] = useState<string>('')
  const [curCustomName, setCurCustomName] = useState<string>('')
  const [curQty, setCurQty] = useState<string>('1')
  const [curPrice, setCurPrice] = useState<string>('')
  const [curGst, setCurGst] = useState<string>('0')

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const handleSelectProduct = (prodId: string) => {
    setCurProductId(prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod) {
      setCurCustomName(prod.name)
      setCurPrice(String(prod.selling_price || 0))
      setCurGst(prod.gst_rate || '0')
    }
  }

  const handleAddLineItem = () => {
    const name = curCustomName.trim()
    if (!name) return

    setLineItems((prev) => [
      ...prev,
      {
        productId: curProductId || null,
        productName: name,
        quantity: Number(curQty || 1),
        unitPrice: Number(curPrice || 0),
        gstRate: curGst,
      },
    ])

    // Reset line fields
    setCurProductId('')
    setCurCustomName('')
    setCurQty('1')
    setCurPrice('')
    setCurGst('0')
  }

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const calculatedTotal = lineItems.reduce((acc, item) => {
    const base = item.quantity * item.unitPrice
    const tax = (base * Number(item.gstRate || 0)) / 100
    return acc + base + tax
  }, 0)

  const [formError, setFormError] = useState<string | null>(null)
  const [convertTargetId, setConvertTargetId] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const handleSaveEstimate = async () => {
    setFormError(null)
    if (!lineItems.length) {
      setFormError('Please add at least 1 line item to the estimate.')
      return
    }
    setIsSubmitting(true)

    try {
      await createEstimateRecord({
        customerId: selectedCustomerId || null,
        validUntil: validUntil || null,
        notes: notes || null,
        items: lineItems,
      })
      setModalOpen(false)
      setLineItems([])
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating estimate')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmConvert = async () => {
    if (!convertTargetId) return
    setIsConverting(true)

    try {
      const res = await convertEstimateToInvoice(convertTargetId)
      setConvertTargetId(null)
      if (res.invoiceId) {
        router.push(`/invoices/${res.invoiceId}`)
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error converting estimate')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div>
      {/* Top Banner Metric */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Quotations & Estimates
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-500)' }}>
              <FileCheck size={18} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary-500)' }}>
            {estimates.length}
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {estimates.filter(e => e.status === 'converted').length} Converted to Sales Invoices
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Estimates & Proforma Invoices</h2>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <Plus size={16} /> Create Estimate
        </button>
      </div>

      {/* Estimates Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Estimate #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!estimates.length ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                  No estimates created yet. Click "Create Estimate" to generate your first quotation.
                </td>
              </tr>
            ) : (
              estimates.map((est) => (
                <tr key={est.id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{est.estimate_number}</span>
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(est.estimate_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {est.customers?.name || 'Walk-in Customer'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${est.status === 'converted' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                      {est.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(Number(est.total_amount))}</td>
                  <td>
                    {est.status !== 'converted' ? (
                      <button
                        onClick={() => setConvertTargetId(est.id)}
                        disabled={isConverting}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 4, color: 'var(--color-primary-500)' }}
                      >
                        <ArrowRight size={14} /> {convertTargetId === est.id && isConverting ? 'Converting…' : 'Convert to Invoice'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-500)', fontWeight: 600 }}>Converted</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Estimate Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Create New Quotation / Estimate</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {formError}
              </div>
            )}

            {/* Customer & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label className="label">Select Customer</label>
                <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="input select">
                  <option value="">-- Walk-in / Unregistered --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Valid Until Date</label>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="input" />
              </div>
            </div>

            {/* Items Selector */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                Add Quotation Line Items
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 'var(--space-2)' }}>
                <div>
                  <select value={curProductId} onChange={(e) => handleSelectProduct(e.target.value)} className="input select" style={{ marginBottom: 4 }}>
                    <option value="">-- Catalog Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    value={curCustomName}
                    onChange={(e) => setCurCustomName(e.target.value)}
                    placeholder="Item / Service Name"
                    className="input"
                  />
                </div>

                <input type="number" value={curQty} onChange={(e) => setCurQty(e.target.value)} placeholder="Qty" className="input" min="1" />
                <input type="number" step="0.01" value={curPrice} onChange={(e) => setCurPrice(e.target.value)} placeholder="Price (₹)" className="input" />

                <select value={curGst} onChange={(e) => setCurGst(e.target.value)} className="input select">
                  <option value="0">GST 0%</option>
                  <option value="5">GST 5%</option>
                  <option value="12">GST 12%</option>
                  <option value="18">GST 18%</option>
                  <option value="28">GST 28%</option>
                </select>

                <button type="button" onClick={handleAddLineItem} className="btn btn-secondary" style={{ gap: 4 }}>
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>GST</th>
                    <th>Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {!lineItems.length ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                        No items added yet. Enter item details above to build quotation.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, idx) => {
                      const base = item.quantity * item.unitPrice
                      const tax = (base * Number(item.gstRate || 0)) / 100
                      const lineTotal = base + tax
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{fmtINR(item.unitPrice)}</td>
                          <td>{item.gstRate}%</td>
                          <td style={{ fontWeight: 600 }}>{fmtINR(lineTotal)}</td>
                          <td>
                            <button onClick={() => handleRemoveLineItem(idx)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger-500)' }}>
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Estimate Grand Total:</span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary-500)' }}>{fmtINR(calculatedTotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveEstimate} disabled={isSubmitting} className="btn btn-primary" style={{ gap: 6 }}>
                <Check size={16} /> {isSubmitting ? 'Creating…' : 'Save Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Estimate Confirm Modal */}
      <ConfirmModal
        isOpen={!!convertTargetId}
        title="Convert Estimate to Invoice"
        message="Convert this estimate into an official Order and Tax Invoice? This will generate a formal invoice number and transition the estimate status."
        confirmText="Convert to Invoice"
        variant="primary"
        isPending={isConverting}
        onConfirm={confirmConvert}
        onCancel={() => setConvertTargetId(null)}
      />
    </div>
  )
}

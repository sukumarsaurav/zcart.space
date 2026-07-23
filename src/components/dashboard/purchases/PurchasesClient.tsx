'use client'

import { useState } from 'react'
import { Plus, Truck, Calendar, Trash2, X, Check, Package } from 'lucide-react'
import { createPurchaseRecord } from '@/app/(dashboard)/purchases/actions'

interface ProductOption {
  id: string
  name: string
  selling_price: number
  cost_price: number | null
  gst_rate: string
}

interface VendorOption {
  id: string
  name: string
  company_name: string | null
}

interface PurchaseRecord {
  id: string
  purchase_number: string
  invoice_number: string | null
  purchase_date: string
  status: string
  total_amount: number
  paid_amount: number
  payment_status: string
  vendors?: { name: string } | null
}

interface PurchasesClientProps {
  purchases: PurchaseRecord[]
  products: ProductOption[]
  vendors: VendorOption[]
}

export default function PurchasesClient({ purchases, products, vendors }: PurchasesClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inward form state
  const [selectedVendorId, setSelectedVendorId] = useState<string>('')
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer')
  const [paidAmount, setPaidAmount] = useState<string>('')

  const [lineItems, setLineItems] = useState<Array<{
    productId: string
    productName: string
    quantity: number
    unitCost: number
    gstRate: string
    batchNumber: string
    expiryDate: string
  }>>([])

  // Line item selector
  const [curProductId, setCurProductId] = useState<string>('')
  const [curQty, setCurQty] = useState<string>('1')
  const [curCost, setCurCost] = useState<string>('')
  const [curGst, setCurGst] = useState<string>('0')
  const [curBatch, setCurBatch] = useState<string>('')
  const [curExpiry, setCurExpiry] = useState<string>('')

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const totalInwardValue = purchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0)

  const handleSelectProduct = (prodId: string) => {
    setCurProductId(prodId)
    const prod = products.find((p) => p.id === prodId)
    if (prod) {
      setCurCost(String(prod.cost_price || prod.selling_price || 0))
      setCurGst(prod.gst_rate || '0')
    }
  }

  const handleAddLineItem = () => {
    if (!curProductId) return
    const prod = products.find((p) => p.id === curProductId)
    if (!prod) return

    setLineItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: Number(curQty || 1),
        unitCost: Number(curCost || 0),
        gstRate: curGst,
        batchNumber: curBatch,
        expiryDate: curExpiry,
      },
    ])

    // Reset line fields
    setCurProductId('')
    setCurQty('1')
    setCurCost('')
    setCurBatch('')
    setCurExpiry('')
  }

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const [formError, setFormError] = useState<string | null>(null)

  const lineItemsCount = lineItems.length

  const calculatedTotal = lineItems.reduce((acc, item) => {
    const base = item.quantity * item.unitCost
    const tax = (base * Number(item.gstRate || 0)) / 100
    return acc + base + tax
  }, 0)

  const handleSavePurchase = async () => {
    setFormError(null)
    if (!lineItems.length) {
      setFormError('Please add at least 1 product item to the purchase order.')
      return
    }
    setIsSubmitting(true)

    try {
      await createPurchaseRecord({
        vendorId: selectedVendorId || null,
        invoiceNumber: invoiceNumber || null,
        items: lineItems,
        paymentMethod,
        paidAmount: Number(paidAmount || calculatedTotal),
      })
      setModalOpen(false)
      setLineItems([])
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating purchase order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Top Banner Metric */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Inward Purchases
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-500)' }}>
              <Truck size={18} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary-500)' }}>
            {fmtINR(totalInwardValue)}
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Across {purchases.length} purchase orders
          </span>
        </div>
      </div>

      {/* Main Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Purchase History & Stock Inward</h2>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
          <Plus size={16} /> New Stock Inward (PO)
        </button>
      </div>

      {/* Purchase List Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Date</th>
              <th>Vendor / Supplier</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {!purchases.length ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                  No stock inward purchase orders recorded yet. Click "New Stock Inward" to log inventory purchases.
                </td>
              </tr>
            ) : (
              purchases.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.purchase_number}</span>
                    {p.invoice_number && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Inv: {p.invoice_number}</div>}
                  </td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> {new Date(p.purchase_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {p.vendors?.name || 'Direct Stock Entry'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{fmtINR(Number(p.total_amount))}</td>
                  <td>
                    <span className={`badge ${p.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Inward PO Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>New Stock Inward Purchase Order</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {formError}
              </div>
            )}

            {/* General Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label className="label">Select Vendor Supplier</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="input select"
                >
                  <option value="">-- No Vendor (Direct Inward) --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} {v.company_name ? `(${v.company_name})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Vendor Invoice Number</label>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="input"
                  placeholder="e.g. INV-98765"
                />
              </div>
            </div>

            {/* Product Selector Bar */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                Add Inward Products
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <select
                  value={curProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="input select"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <input
                  type="number"
                  value={curQty}
                  onChange={(e) => setCurQty(e.target.value)}
                  placeholder="Qty"
                  className="input"
                  min="1"
                />

                <input
                  type="number"
                  step="0.01"
                  value={curCost}
                  onChange={(e) => setCurCost(e.target.value)}
                  placeholder="Unit Cost (₹)"
                  className="input"
                />

                <select
                  value={curGst}
                  onChange={(e) => setCurGst(e.target.value)}
                  className="input select"
                >
                  <option value="0">GST 0%</option>
                  <option value="5">GST 5%</option>
                  <option value="12">GST 12%</option>
                  <option value="18">GST 18%</option>
                  <option value="28">GST 28%</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--space-2)' }}>
                <input
                  value={curBatch}
                  onChange={(e) => setCurBatch(e.target.value)}
                  placeholder="Batch # (Optional)"
                  className="input"
                />
                <input
                  type="date"
                  value={curExpiry}
                  onChange={(e) => setCurExpiry(e.target.value)}
                  className="input"
                />
                <button type="button" onClick={handleAddLineItem} className="btn btn-secondary" style={{ gap: 4 }}>
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>GST</th>
                    <th>Batch / Expiry</th>
                    <th>Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {!lineItems.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                        No items added yet. Select a product above to add to this purchase order.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, idx) => {
                      const base = item.quantity * item.unitCost
                      const tax = (base * Number(item.gstRate || 0)) / 100
                      const lineTotal = base + tax
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, fontSize: 'var(--text-xs)' }}>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{fmtINR(item.unitCost)}</td>
                          <td>{item.gstRate}%</td>
                          <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            {item.batchNumber ? `B: ${item.batchNumber}` : ''} {item.expiryDate ? `(Exp: ${item.expiryDate})` : ''}
                          </td>
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

            {/* Payment & Summary */}
            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Total Purchase Value:</span>
                <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-primary-500)' }}>{fmtINR(calculatedTotal)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label className="label">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input select">
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="credit_ledger">Vendor Credit (Pay Later)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Amount Paid Now (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={String(calculatedTotal)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSavePurchase} disabled={isSubmitting} className="btn btn-primary" style={{ gap: 6 }}>
                <Check size={16} /> {isSubmitting ? 'Processing Stock Inward…' : 'Save & Update Inventory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

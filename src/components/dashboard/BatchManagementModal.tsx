'use client'

import { useState, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Layers, Loader2, CheckCircle2, Tag, Calendar, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ProductBatch } from '@/types/database'

interface BatchManagementModalProps {
  isOpen: boolean
  onClose: () => void
  shopId: string
  productId: string
  productName: string
  hasExpiry?: boolean
}

export default function BatchManagementModal({
  isOpen,
  onClose,
  shopId,
  productId,
  productName,
  hasExpiry,
}: BatchManagementModalProps) {
  const [batches, setBatches] = useState<ProductBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state for creating a new batch
  const [showAddForm, setShowAddForm] = useState(false)
  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  const fetchBatches = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('product_batches')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBatches(data as ProductBatch[])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isOpen && productId) {
      fetchBatches()
    }
  }, [isOpen, productId])

  if (!isOpen) return null

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchNumber.trim()) { setError('Batch number is required'); return }
    if (!quantity || Number(quantity) <= 0) { setError('Valid quantity is required'); return }
    if (!sellingPrice || Number(sellingPrice) <= 0) { setError('Valid selling price is required'); return }

    setError(null)
    setSuccess(null)
    const supabase = createClient()

    startTransition(async () => {
      const payload = {
        shop_id: shopId,
        product_id: productId,
        batch_number: batchNumber.trim().toUpperCase(),
        quantity: Number(quantity),
        selling_price: Number(sellingPrice),
        mrp: mrp ? Number(mrp) : Number(sellingPrice),
        cost_price: costPrice ? Number(costPrice) : null,
        expiry_date: expiryDate || null,
        is_active: true,
      }

      const { error: insertErr } = await supabase
        .from('product_batches')
        .insert(payload)

      if (insertErr) {
        setError(insertErr.message)
        return
      }

      setSuccess(`Batch ${batchNumber} added successfully!`)
      setBatchNumber('')
      setQuantity('')
      setSellingPrice('')
      setMrp('')
      setCostPrice('')
      setExpiryDate('')
      setShowAddForm(false)
      fetchBatches()
    })
  }

  const handleDeleteBatch = async (batchId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('product_batches')
      .update({ is_active: false })
      .eq('id', batchId)

    if (!error) {
      fetchBatches()
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px'
    }}>
      <div className="card animate-scale-in" style={{
        width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--color-primary-400)" /> Stock Batches
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{productName}</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: 'var(--color-danger-400)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', color: 'var(--color-success-400)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary btn-sm"
              style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add New Stock Batch
            </button>
          ) : (
            <form onSubmit={handleAddBatch} style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>New Batch Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="input-label" style={{ fontSize: '12px' }}>Batch Number *</label>
                  <input className="input" placeholder="e.g. B001 or NOV24-100" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '12px' }}>Quantity *</label>
                  <input className="input" type="number" min="1" placeholder="e.g. 10" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '12px' }}>Selling Price (₹) *</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="100.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '12px' }}>MRP (₹)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="100.00" value={mrp} onChange={(e) => setMrp(e.target.value)} />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: '12px' }}>Cost Price (₹)</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="80.00" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
                </div>
                {hasExpiry && (
                  <div>
                    <label className="input-label" style={{ fontSize: '12px' }}>Expiry Date</label>
                    <input className="input" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : 'Save Batch'}
                </button>
              </div>
            </form>
          )}

          {/* Batches Table */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
            </div>
          ) : batches.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--surface-border)', borderRadius: '12px' }}>
              <Layers size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px', fontWeight: 600 }}>No stock batches configured</p>
              <p style={{ fontSize: '12px' }}>Add batches to manage stock with different prices (e.g. ₹100 vs ₹130).</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Batch #</th>
                    <th>Price (₹)</th>
                    <th>MRP (₹)</th>
                    <th>Stock</th>
                    {hasExpiry && <th>Expiry</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} color="var(--color-primary-400)" /> {b.batch_number}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary-400)' }}>₹{b.selling_price}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>₹{b.mrp}</td>
                      <td>
                        <span className={`badge ${b.quantity > 0 ? 'badge-success' : 'badge-neutral'}`}>
                          {b.quantity} units
                        </span>
                      </td>
                      {hasExpiry && (
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {b.expiry_date ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {b.expiry_date}
                            </span>
                          ) : '—'}
                        </td>
                      )}
                      <td>
                        <button onClick={() => handleDeleteBatch(b.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger-500)' }} title="Deactivate batch">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

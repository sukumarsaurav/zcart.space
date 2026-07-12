'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { adjustStock } from '@/app/(dashboard)/inventory/actions'

interface AdjustStockButtonProps {
  shopId: string
  productId: string
  locationId: string | null
  variantId: string | null
  currentQuantity: number
  unit: string
}

export default function AdjustStockButton({ shopId, productId, locationId, variantId, currentQuantity, unit }: AdjustStockButtonProps) {
  const [open, setOpen] = useState(false)
  const [newQuantity, setNewQuantity] = useState(String(currentQuantity))
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    const parsed = Number(newQuantity)
    if (Number.isNaN(parsed) || parsed < 0) {
      setError('Enter a valid quantity')
      return
    }
    setSaving(true)
    setError(null)
    const result = await adjustStock({
      shopId,
      productId,
      locationId,
      variantId,
      currentQuantity,
      delta: parsed - currentQuantity,
      reason,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setNewQuantity(String(currentQuantity)); setReason(''); setError(null) }}
        className="btn btn-ghost btn-icon btn-sm"
        title="Adjust stock"
      >
        <Pencil size={14} />
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Adjust stock</h3>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-wrapper">
                <label className="input-label">Quantity ({unit})</label>
                <input
                  type="number"
                  min={0}
                  className="input"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  autoFocus
                />
                <p className="input-helper">Currently {currentQuantity} {unit}</p>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Reason (optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Stock count correction, damaged goods"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              {error && <p className="input-helper error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'
import { createCoupon, updateCoupon } from '@/app/(dashboard)/coupons/actions'

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'flat' | 'percent'
  discount_value: number
  max_discount: number | null
  min_order_value: number
  usage_limit: number | null
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
}

interface CouponModalProps {
  shopId: string
  isOpen: boolean
  onClose: () => void
  editCoupon?: Coupon | null
}

export default function CouponModal({ shopId, isOpen, onClose, editCoupon }: CouponModalProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('percent')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (editCoupon) {
      setDiscountType(editCoupon.discount_type)
    } else {
      setDiscountType('percent')
    }
  }, [editCoupon])

  if (!isOpen || !mounted) return null

  function handleSubmit(formData: FormData) {
    setError('')
    startTransition(async () => {
      let res
      if (editCoupon) {
        res = await updateCoupon(shopId, editCoupon.id, formData)
      } else {
        res = await createCoupon(shopId, formData)
      }
      
      if (res.error) {
        setError(res.error)
      } else {
        onClose()
      }
    })
  }

  // Helper to format iso date to datetime-local value (YYYY-MM-DDTHH:mm)
  const formatDatetimeLocal = (isoString: string | null) => {
    if (!isoString) return ''
    try {
      return new Date(isoString).toISOString().slice(0, 16)
    } catch (e) {
      return ''
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
    }}>
      <div className="card animate-scale-in" style={{
        width: '100%', maxWidth: 500, padding: 'var(--space-6)',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, color: 'var(--text-tertiary)' }}
          className="btn btn-ghost btn-icon"
        >
          <X size={18} />
        </button>
        
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-6)' }}>
          {editCoupon ? 'Edit Coupon' : 'Add Coupon'}
        </h2>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger-500)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="label">Coupon Code *</label>
            <input 
              name="code" 
              required 
              className="input" 
              defaultValue={editCoupon?.code} 
              placeholder="e.g., SUMMER50" 
              style={{ textTransform: 'uppercase' }}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
              }}
            />
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <input name="description" className="input" defaultValue={editCoupon?.description || ''} placeholder="e.g., Get 10% off on all summer products" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Discount Type *</label>
              <select 
                name="discount_type" 
                className="input select" 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percent')}
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="label">Discount Value *</label>
              <input 
                name="discount_value" 
                type="number" 
                min="0.01" 
                step="0.01" 
                required 
                className="input" 
                defaultValue={editCoupon?.discount_value} 
                placeholder={discountType === 'percent' ? 'e.g., 10' : 'e.g., 150'} 
              />
            </div>
          </div>

          {discountType === 'percent' && (
            <div>
              <label className="label">Maximum Discount (₹, Optional)</label>
              <input 
                name="max_discount" 
                type="number" 
                min="0" 
                step="0.01" 
                className="input" 
                defaultValue={editCoupon?.max_discount || ''} 
                placeholder="No limit" 
              />
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Cap the discount amount for percentage coupons</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Min Order Value (₹)</label>
              <input 
                name="min_order_value" 
                type="number" 
                min="0" 
                step="0.01" 
                className="input" 
                defaultValue={editCoupon?.min_order_value ?? 0} 
                placeholder="e.g., 500" 
              />
            </div>

            <div>
              <label className="label">Usage Limit (Optional)</label>
              <input 
                name="usage_limit" 
                type="number" 
                min="1" 
                className="input" 
                defaultValue={editCoupon?.usage_limit || ''} 
                placeholder="Unlimited" 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Starts At (Optional)</label>
              <input 
                name="starts_at" 
                type="datetime-local" 
                className="input" 
                defaultValue={formatDatetimeLocal(editCoupon?.starts_at || null)} 
              />
            </div>

            <div>
              <label className="label">Expires At (Optional)</label>
              <input 
                name="expires_at" 
                type="datetime-local" 
                className="input" 
                defaultValue={formatDatetimeLocal(editCoupon?.expires_at || null)} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <input 
              type="checkbox" 
              name="is_active" 
              id="coupon_is_active" 
              defaultChecked={editCoupon ? editCoupon.is_active : true} 
              style={{ width: 16, height: 16 }} 
            />
            <label htmlFor="coupon_is_active" style={{ fontSize: '14px', cursor: 'pointer' }}>Active and redeemable</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {editCoupon ? 'Save Changes' : 'Save Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

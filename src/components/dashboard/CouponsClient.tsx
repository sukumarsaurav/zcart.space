'use client'

import { useState, useTransition } from 'react'
import { Ticket, Plus, Trash2, AlertTriangle, Loader2, Calendar } from 'lucide-react'
import { createPortal } from 'react-dom'
import CouponModal from '@/components/dashboard/CouponModal'
import { deleteCoupon } from '@/app/(dashboard)/coupons/actions'

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'flat' | 'percent'
  discount_value: number
  max_discount: number | null
  min_order_value: number
  usage_limit: number | null
  usage_count: number
  is_active: boolean
  starts_at: string | null
  expires_at: string | null
}

interface CouponsClientProps {
  shopId: string
  coupons: Coupon[]
}

export default function CouponsClient({ shopId, coupons }: CouponsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const openAdd = () => {
    setEditCoupon(null)
    setModalOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditCoupon(coupon)
    setModalOpen(true)
  }

  const confirmDelete = (coupon: Coupon) => {
    setDeleteTarget(coupon)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    startDeleteTransition(async () => {
      await deleteCoupon(shopId, deleteTarget.id)
      setDeleteTarget(null)
    })
  }

  const formatDiscount = (c: Coupon) => {
    if (c.discount_type === 'percent') {
      return `${c.discount_value}%`
    }
    return `₹${c.discount_value}`
  }

  const getCouponStatus = (c: Coupon) => {
    if (!c.is_active) return { label: 'Inactive', class: 'badge-neutral' }
    const now = new Date()
    if (c.starts_at && new Date(c.starts_at) > now) {
      return { label: 'Scheduled', class: 'badge-neutral' }
    }
    if (c.expires_at && new Date(c.expires_at) < now) {
      return { label: 'Expired', class: 'badge-danger' }
    }
    if (c.usage_limit !== null && c.usage_count >= c.usage_limit) {
      return { label: 'Limit Reached', class: 'badge-danger' }
    }
    return { label: 'Active', class: 'badge-success' }
  }

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-'
    try {
      return new Date(isoString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return '-'
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-4)' }}>
        <button id="add-coupon-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add coupon
        </button>
      </div>

      {!coupons.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Ticket size={28} /></div>
          <p className="empty-state-title">No coupons yet</p>
          <p className="empty-state-description">Create discount coupons to reward loyal customers and drive sales.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Create first coupon
          </button>
        </div>
      ) : (
        <div className="table-wrapper table-responsive-cards">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon)
                return (
                  <tr key={coupon.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Ticket size={14} color="var(--color-primary-400)" />
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{coupon.code}</span>
                          {coupon.description && (
                            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, fontWeight: 400 }}>{coupon.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{formatDiscount(coupon)}</span>
                      {coupon.discount_type === 'percent' && coupon.max_discount && (
                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>Up to ₹{coupon.max_discount}</p>
                      )}
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)' }}>₹{coupon.min_order_value}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {coupon.usage_count} / {coupon.usage_limit ?? '∞'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        <Calendar size={12} />
                        <span>{formatDate(coupon.expires_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(coupon)}>Edit</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => confirmDelete(coupon)} style={{ color: 'var(--color-danger-500)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CouponModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCoupon(null); }}
        shopId={shopId}
        editCoupon={editCoupon}
      />

      {deleteTarget && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-scale-in" style={{
            width: '100%', maxWidth: 420, padding: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              <AlertTriangle size={24} color="var(--color-danger-500)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Delete Coupon</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              Are you sure you want to delete coupon <strong>{deleteTarget.code}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  background: 'var(--color-danger-500)', color: '#fff',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

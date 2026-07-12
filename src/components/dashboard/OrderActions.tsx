'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Truck, Package, Undo2 } from 'lucide-react'
import { updateOrderStatus } from '@/app/(dashboard)/orders/actions'
import type { OrderStatus } from '@/types/database'

const TRANSITIONS: Record<OrderStatus, { next: OrderStatus; label: string; icon: React.ComponentType<any>; className: string; confirm?: string }[]> = {
  pending: [
    { next: 'confirmed', label: 'Confirm', icon: CheckCircle, className: 'btn-success' },
    { next: 'cancelled', label: 'Cancel', icon: XCircle, className: 'btn-danger', confirm: 'Cancel this order? This will restock any deducted inventory.' },
  ],
  confirmed: [
    { next: 'processing', label: 'Start Processing', icon: Package, className: 'btn-primary' },
    { next: 'cancelled', label: 'Cancel', icon: XCircle, className: 'btn-danger', confirm: 'Cancel this order? This will restock any deducted inventory.' },
  ],
  processing: [
    { next: 'shipped', label: 'Mark Shipped', icon: Truck, className: 'btn-primary' },
    { next: 'cancelled', label: 'Cancel', icon: XCircle, className: 'btn-danger', confirm: 'Cancel this order? This will restock any deducted inventory.' },
  ],
  shipped: [
    { next: 'delivered', label: 'Mark Delivered', icon: CheckCircle, className: 'btn-success' },
    { next: 'refunded', label: 'Refund', icon: Undo2, className: 'btn-danger', confirm: 'Refund this order? This will restock inventory and mark the payment as refunded.' },
  ],
  delivered: [
    { next: 'refunded', label: 'Refund', icon: Undo2, className: 'btn-danger', confirm: 'Refund this order? This will restock inventory and mark the payment as refunded.' },
  ],
  cancelled: [],
  refunded: [],
}

export default function OrderActions({ orderId, shopId, currentStatus }: { orderId: string; shopId: string; currentStatus: OrderStatus }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const actions = TRANSITIONS[currentStatus] ?? []

  const updateStatus = async (next: OrderStatus, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, shopId, currentStatus, next)
      if (result.error) { setError(result.error); return }
      router.refresh()
    })
  }

  if (!actions.length) return null

  return (
    <div className="card">
      <div className="card-header">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Order Actions</h2>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {error && <p style={{ color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)' }}>{error}</p>}
        {actions.map(({ next, label, icon: Icon, className, confirm }) => (
          <button
            key={next}
            onClick={() => updateStatus(next, confirm)}
            disabled={isPending}
            className={`btn ${className} ${isPending ? 'btn-loading' : ''}`}
            style={{ justifyContent: 'center' }}
            id={`order-action-${next}`}
          >
            <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Icon size={15} /> {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

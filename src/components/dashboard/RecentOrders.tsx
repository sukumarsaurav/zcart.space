import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { OrderStatus, PaymentStatus, OrderChannel } from '@/types/database'
import { ExternalLink } from 'lucide-react'


const statusBadge: Record<OrderStatus, string> = {
  pending:    'badge-warning',
  confirmed:  'badge-info',
  processing: 'badge-info',
  shipped:    'badge-primary',
  delivered:  'badge-success',
  cancelled:  'badge-neutral',
  refunded:   'badge-danger',
}

const paymentBadge: Record<PaymentStatus, string> = {
  pending:  'badge-warning',
  paid:     'badge-success',
  partial:  'badge-warning',
  failed:   'badge-danger',
  refunded: 'badge-neutral',
}

const channelLabel: Record<OrderChannel, string> = {
  online:      'Online',
  pos:         'POS',
  whatsapp:    'WhatsApp',
  marketplace: 'Market',
}

interface Props { orders: any[] }

export default function RecentOrders({ orders }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Recent Orders</h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Latest 8 orders</p>
        </div>
        <Link href="/orders" className="btn btn-ghost btn-sm" style={{ gap: 'var(--space-1)' }}>
          View all <ExternalLink size={12} />
        </Link>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Channel</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/orders/${order.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {order.customers?.name ?? 'Guest'}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{channelLabel[order.channel as OrderChannel]}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(order.total_amount))}
                  </td>
                  <td>
                    <span className={`badge badge-dot ${statusBadge[order.status as OrderStatus]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${paymentBadge[order.payment_status as PaymentStatus]}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

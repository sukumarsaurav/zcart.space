import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { OrderStatus, PaymentStatus, OrderChannel } from '@/types/database'
import { ExternalLink, ShoppingBag } from 'lucide-react'
import { formatCurrency, getStatusBadgeClass } from '@/lib/formatters'

const channelLabel: Record<OrderChannel, string> = {
  online:      'Online',
  pos:         'POS',
  whatsapp:    'WhatsApp',
  marketplace: 'Market',
}

interface RecentOrderRecord {
  id: string
  total_amount: number | string
  status: OrderStatus
  payment_status: PaymentStatus
  channel: OrderChannel
  created_at: string
  customers?: { name: string } | { name: string }[] | null
}

interface Props {
  orders: RecentOrderRecord[]
}

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
        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-2)' }}>
            <ShoppingBag size={24} color="var(--text-tertiary)" />
          </div>
          <p className="empty-state-title" style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>No orders yet</p>
          <p className="empty-state-description" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            New storefront or POS orders will appear here in real-time.
          </p>
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
                      {(Array.isArray(order.customers) ? order.customers[0]?.name : order.customers?.name) ?? 'Guest'}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{channelLabel[order.channel as OrderChannel] ?? order.channel}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td>
                    <span className={`badge badge-dot ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.payment_status)}`}>
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

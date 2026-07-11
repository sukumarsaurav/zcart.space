import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Search, Filter } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Metadata } from 'next'
import type { OrderStatus, PaymentStatus, OrderChannel } from '@/types/database'

export const metadata: Metadata = { title: 'Orders' }

const statusBadge: Record<OrderStatus, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success',
  cancelled: 'badge-neutral', refunded: 'badge-danger',
}
const paymentBadge: Record<PaymentStatus, string> = {
  pending: 'badge-warning', paid: 'badge-success', partial: 'badge-warning',
  failed: 'badge-danger', refunded: 'badge-neutral',
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: OrderStatus; channel?: OrderChannel; q?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const params = await searchParams
  const page = Number(params.page ?? 1)
  const pageSize = 25
  const from = (page - 1) * pageSize

  let query = supabase
    .from('orders')
    .select('id, total_amount, status, payment_status, channel, created_at, customers(name, phone)', { count: 'exact' })
    .eq('shop_id', shopUser.shop_id)
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (params.status) query = query.eq('status', params.status)
  if (params.channel) query = query.eq('channel', params.channel)

  const { data: orders, count } = await query

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const STATUS_FILTERS: (OrderStatus | '')[] = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{count ?? 0} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s || 'all'}
              href={`/orders?${new URLSearchParams({ ...(s && { status: s }), ...(params.channel && { channel: params.channel }) })}`}
              className={`btn btn-sm ${(s === '' && !params.status) || params.status === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto' }}>
          {(['online', 'pos'] as OrderChannel[]).map((ch) => (
            <Link
              key={ch}
              href={`/orders?${new URLSearchParams({ ...(params.status && { status: params.status }), ...(params.channel !== ch && { channel: ch }) })}`}
              className={`btn btn-sm ${params.channel === ch ? 'btn-primary' : 'btn-secondary'}`}
            >
              {ch === 'online' ? 'Online' : 'POS'}
            </Link>
          ))}
        </div>
      </div>

      {!orders?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingCart size={28} /></div>
          <p className="empty-state-title">No orders yet</p>
          <p className="empty-state-description">Orders from your online store and POS will appear here.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/orders/${o.id}`} style={{ color: 'var(--color-primary-400)', fontWeight: 500, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>
                      {(o.customers as any)?.name ?? <span style={{ color: 'var(--text-tertiary)' }}>Guest</span>}
                      {(o.customers as any)?.phone && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{(o.customers as any).phone}</p>
                      )}
                    </td>
                    <td><span className="badge badge-neutral">{o.channel}</span></td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fmtINR(Number(o.total_amount))}</td>
                    <td><span className={`badge badge-dot ${statusBadge[o.status as OrderStatus]}`}>{o.status}</span></td>
                    <td><span className={`badge ${paymentBadge[o.payment_status as PaymentStatus]}`}>{o.payment_status}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {format(new Date(o.created_at), 'dd MMM yy, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/orders?page=${p}${params.status ? `&status=${params.status}` : ''}`}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import type { OrderStatus, PaymentStatus } from '@/types/database'

export const metadata: Metadata = { title: 'Customer' }

const statusBadge: Record<OrderStatus, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success',
  cancelled: 'badge-neutral', refunded: 'badge-danger',
}
const paymentBadge: Record<PaymentStatus, string> = {
  pending: 'badge-warning', paid: 'badge-success', partial: 'badge-warning',
  failed: 'badge-danger', refunded: 'badge-neutral',
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { id } = await params

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('shop_id', shopUser.shop_id)
    .single()

  if (!customer) notFound()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, payment_status, channel, created_at')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/customers" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-3)' }}>
            <ArrowLeft size={16} /> Back to Customers
          </Link>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-subtitle">Customer since {format(new Date(customer.created_at), 'dd MMM yyyy')}</p>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <p className="stat-card-label">Total Orders</p>
          <p className="stat-card-value">{customer.total_orders ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Total Spent</p>
          <p className="stat-card-value">{fmtINR(Number(customer.total_spent ?? 0))}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card-label">Outstanding Credit</p>
          <p className="stat-card-value" style={{ color: Number(customer.outstanding_credit ?? 0) > 0 ? 'var(--color-warning-400)' : undefined }}>
            {fmtINR(Number(customer.outstanding_credit ?? 0))}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Contact Information</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {customer.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <Phone size={14} color="var(--text-tertiary)" /> {customer.phone}
            </div>
          )}
          {customer.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
              <Mail size={14} color="var(--text-tertiary)" /> {customer.email}
            </div>
          )}
          {customer.gstin && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>GSTIN: {customer.gstin}</div>
          )}
          {!customer.phone && !customer.email && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>No contact details on file.</p>
          )}
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="page-title" style={{ fontSize: 'var(--text-lg)' }}>Order History</h2>
      </div>

      {!orders?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ShoppingCart size={28} /></div>
          <p className="empty-state-title">No orders yet</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Channel</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/orders/${o.id}`} style={{ color: 'var(--color-primary-400)', fontWeight: 500, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
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
      )}
    </div>
  )
}

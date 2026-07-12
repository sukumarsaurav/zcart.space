import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Receipt, User, MapPin, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import type { OrderStatus, PaymentStatus } from '@/types/database'
import OrderActions from '@/components/dashboard/OrderActions'

export const metadata: Metadata = { title: 'Order Details' }

const statusBadge: Record<OrderStatus, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success',
  cancelled: 'badge-neutral', refunded: 'badge-danger',
}
const payBadge: Record<PaymentStatus, string> = {
  pending: 'badge-warning', paid: 'badge-success', partial: 'badge-warning',
  failed: 'badge-danger', refunded: 'badge-neutral',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { id } = await params

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *, customers(name, phone, email),
      order_items(*, products(name, images)),
      payments(id, method, amount, status, paid_at, gateway),
      invoices(id, invoice_number, pdf_url)
    `)
    .eq('id', id)
    .eq('shop_id', shopUser.shop_id)
    .single()

  if (!order) notFound()

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/orders" className="btn btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>{format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')} · via {order.channel}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <span className={`badge badge-dot ${statusBadge[order.status as OrderStatus]}`} style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
            {order.status}
          </span>
          <span className={`badge ${payBadge[order.payment_status as PaymentStatus]}`} style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
            {order.payment_status}
          </span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Order items */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Package size={16} color="var(--color-primary-400)" />
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Items ({(order as any).order_items?.length ?? 0})</h2>
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              {(order as any).order_items?.map((item: any) => (
                <div key={item.id} style={{
                  display: 'flex', gap: 'var(--space-4)',
                  padding: 'var(--space-4) var(--space-2)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--surface-border)',
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {item.products?.images?.[0]
                      ? <img src={item.products.images[0]} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><Package size={16} /></div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{item.product_name}</p>
                    {item.variant_name && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.variant_name}</p>}
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                      {fmtINR(item.unit_price)} × {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fmtINR(item.line_total)}</p>
                    {item.discount_amount > 0 && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-400)' }}>-{fmtINR(item.discount_amount)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                ['Subtotal', fmtINR(Number(order.subtotal))],
                order.discount_amount > 0 && ['Discount', `-${fmtINR(Number(order.discount_amount))}`],
                Number(order.cgst_amount) > 0 && ['CGST', fmtINR(Number(order.cgst_amount))],
                Number(order.sgst_amount) > 0 && ['SGST', fmtINR(Number(order.sgst_amount))],
                Number(order.igst_amount) > 0 && ['IGST', fmtINR(Number(order.igst_amount))],
              ].filter(Boolean).map((row: any) => (
                <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <span>{row[0]}</span><span>{row[1]}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)', fontWeight: 700, paddingTop: 'var(--space-2)', borderTop: '1px solid var(--surface-border)' }}>
                <span>Total</span><span>{fmtINR(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {(order as any).payments?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CreditCard size={16} color="var(--color-success-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Payments</h2>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {(order as any).payments.map((p: any) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, textTransform: 'capitalize' }}>{p.method.replace('_', ' ')}</p>
                      {p.gateway && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>via {p.gateway}</p>}
                      {p.paid_at && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{format(new Date(p.paid_at), 'dd MMM, HH:mm')}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 600 }}>{fmtINR(Number(p.amount))}</p>
                      <span className={`badge ${payBadge[p.status as PaymentStatus]}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Actions */}
          <OrderActions orderId={order.id} shopId={shopUser.shop_id} currentStatus={order.status as OrderStatus} />

          {/* Customer */}
          {(order as any).customers && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <User size={16} color="var(--color-info-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Customer</h2>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <p style={{ fontWeight: 600 }}>{(order as any).customers.name}</p>
                {(order as any).customers.phone && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{(order as any).customers.phone}</p>}
                {(order as any).customers.email && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{(order as any).customers.email}</p>}
              </div>
            </div>
          )}

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MapPin size={16} color="var(--color-warning-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Shipping Address</h2>
                </div>
              </div>
              <div className="card-body">
                {Object.values(order.shipping_address as Record<string, string>).filter(Boolean).map((v, i) => (
                  <p key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{v}</p>
                ))}
              </div>
            </div>
          )}

          {/* Invoice */}
          {(order as any).invoices?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Receipt size={16} color="var(--color-accent-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Invoice</h2>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link href={`/invoices/${(order as any).invoices[0].id}`} className="btn btn-secondary btn-sm">
                  <Receipt size={14} /> {(order as any).invoices[0].invoice_number}
                </Link>
                {(order as any).invoices[0].pdf_url && (
                  <a href={(order as any).invoices[0].pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Download PDF
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="card">
              <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Notes</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

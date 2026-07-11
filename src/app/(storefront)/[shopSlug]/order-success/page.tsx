import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, MapPin, Receipt, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'

export const metadata: Metadata = { title: 'Order Successful' }

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { id } = await searchParams

  if (!id) notFound()

  const { data: shop } = await supabase.from('shops').select('id, name, slug, theme').eq('slug', shopSlug).single()
  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const pc = theme.primary_color ?? '#6366f1'

  const { data: order } = await supabase
    .from('orders')
    .select('*, customers(name, phone, email), order_items(*)')
    .eq('id', id)
    .eq('shop_id', shop.id)
    .single()

  if (!order) notFound()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)', padding: 'var(--space-4) var(--space-6)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 800 }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} color="white" />
            </div>
            {shop.name}
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        
        {/* Success Banner */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
            <CheckCircle size={40} color="var(--color-success-400)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Order Confirmed!</h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
            Thank you for your purchase, {(order.customers as any)?.name?.split(' ')[0] ?? 'Customer'}.
          </p>
          <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Order Details */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Order Summary</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--surface-border)', marginBottom: 'var(--space-4)' }}>
              {(order.order_items as any[])?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> x {item.quantity}</span>
                  </div>
                  <span>₹{Number(item.line_total).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--color-success-400)' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 800, marginTop: 'var(--space-2)' }}>
              <span>Total Paid</span>
              <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        {order.shipping_address && (
          <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={16} color="var(--color-info-400)" />
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

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
          <Link href={`/${shopSlug}/products`} className="btn btn-primary" style={{ background: pc }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  )
}

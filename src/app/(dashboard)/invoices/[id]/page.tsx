import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer, Download, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { ClassicInvoice, ModernInvoice } from '@/components/invoices/InvoiceTemplates'

export const metadata: Metadata = { title: 'Invoice Details' }

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { id } = await params

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      shops(name, email, phone, gstin, logo_url, theme),
      shop_locations(address_line1, city, state, pincode),
      orders(
        channel,
        shipping_address,
        customers(name, phone, email, gstin)
      )
    `)
    .eq('id', id)
    .eq('shop_id', shopUser.shop_id)
    .single()

  if (!invoice) notFound()

  // In a real app, invoice items might be stored separately for immutability,
  // or derived from order_items at the time of invoice creation.
  // For MVP, we'll fetch order_items.
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', invoice.order_id)

  const fmtINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)
  
  const shop = invoice.shops as any
  const location = invoice.shop_locations as any
  const order = invoice.orders as any
  const customer = order?.customers as any
  const pc = shop?.theme?.primary_color ?? '#6366f1'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/invoices" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} /> Back to Invoices
        </Link>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {invoice.pdf_url && (
            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
              <Download size={14} /> Download PDF
            </a>
          )}
          <button className="btn btn-primary btn-sm" style={{ background: pc }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div style={{ marginTop: 'var(--space-4)' }}>
        {shop?.metadata?.invoice_template === 'modern' ? (
          <ModernInvoice invoice={invoice} shop={shop} location={location} order={order} customer={customer} items={items || []} />
        ) : (
          <ClassicInvoice invoice={invoice} shop={shop} location={location} order={order} customer={customer} items={items || []} />
        )}
      </div>
    </div>
  )
}

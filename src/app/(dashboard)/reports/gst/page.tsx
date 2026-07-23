import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GSTReportsClient from '@/components/dashboard/reports/GSTReportsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'GST Filing Reports' }

export default async function GSTReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, shops(name, gstin)')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) redirect('/login')

  const shopsData = (shopUser as any).shops
  const shopObj = Array.isArray(shopsData) ? shopsData[0] : shopsData

  // Fetch sales invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_date, subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, total_amount, buyer_name, buyer_gstin')
    .eq('shop_id', shopUser.shop_id)
    .eq('is_cancelled', false)
    .order('invoice_date', { ascending: false })

  // Fetch order items to calculate GST rate slabs breakdown
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, line_total')
    .eq('shop_id', shopUser.shop_id)

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">GST Tax Reports & Filing Hub</h1>
          <p className="page-subtitle">Auto-generated GSTR-1 and GSTR-3B tax summaries formatted for GST portal filing</p>
        </div>
      </div>

      <GSTReportsClient
        shopName={shopObj?.name || 'My Shop'}
        gstin={shopObj?.gstin || 'NOT SPECIFIED'}
        invoices={(invoices ?? []).map((inv) => ({
          ...inv,
          subtotal: Number(inv.subtotal || 0),
          cgst_amount: Number(inv.cgst_amount || 0),
          sgst_amount: Number(inv.sgst_amount || 0),
          igst_amount: Number(inv.igst_amount || 0),
          total_amount: Number(inv.total_amount || 0),
        }))}
        orderItems={(orderItems ?? []).map((item) => ({
          ...item,
          taxable_amount: Number(item.taxable_amount || 0),
          cgst_amount: Number(item.cgst_amount || 0),
          sgst_amount: Number(item.sgst_amount || 0),
          igst_amount: Number(item.igst_amount || 0),
          line_total: Number(item.line_total || 0),
        }))}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PurchasesClient from '@/components/dashboard/purchases/PurchasesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Purchase Orders & Stock Inward' }

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) redirect('/login')

  // Fetch Purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('id, purchase_number, invoice_number, purchase_date, status, total_amount, paid_amount, payment_status, vendors(name)')
    .eq('shop_id', shopUser.shop_id)
    .order('purchase_date', { ascending: false })

  // Fetch Products for inward selector
  const { data: products } = await supabase
    .from('products')
    .select('id, name, selling_price, cost_price, gst_rate')
    .eq('shop_id', shopUser.shop_id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  // Fetch Vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name, company_name')
    .eq('shop_id', shopUser.shop_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Purchases & Inward Stock</h1>
          <p className="page-subtitle">Record supplier purchase bills and automatically update inventory levels</p>
        </div>
      </div>

      <PurchasesClient
        purchases={(purchases ?? []).map((p) => ({
          ...p,
          total_amount: Number(p.total_amount || 0),
          paid_amount: Number(p.paid_amount || 0),
          vendors: Array.isArray(p.vendors) ? p.vendors[0] : p.vendors,
        }))}
        products={(products ?? []).map((prod) => ({
          ...prod,
          selling_price: Number(prod.selling_price || 0),
          cost_price: prod.cost_price ? Number(prod.cost_price) : null,
        }))}
        vendors={vendors ?? []}
      />
    </div>
  )
}

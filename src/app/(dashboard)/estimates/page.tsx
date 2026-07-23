import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EstimatesClient from '@/components/dashboard/estimates/EstimatesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Estimates & Quotations' }

export default async function EstimatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) redirect('/login')

  // Fetch Estimates
  const { data: estimates } = await supabase
    .from('estimates')
    .select('id, estimate_number, estimate_date, status, total_amount, converted_order_id, customers(name)')
    .eq('shop_id', shopUser.shop_id)
    .order('estimate_date', { ascending: false })

  // Fetch Products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, selling_price, gst_rate')
    .eq('shop_id', shopUser.shop_id)
    .eq('status', 'active')
    .order('name', { ascending: true })

  // Fetch Customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .eq('shop_id', shopUser.shop_id)
    .order('name', { ascending: true })

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Estimates & Quotations</h1>
          <p className="page-subtitle">Create price estimates and convert them into sales invoices in one click</p>
        </div>
      </div>

      <EstimatesClient
        estimates={(estimates ?? []).map((e) => ({
          ...e,
          total_amount: Number(e.total_amount || 0),
          customers: Array.isArray(e.customers) ? e.customers[0] : e.customers,
        }))}
        products={(products ?? []).map((p) => ({
          ...p,
          selling_price: Number(p.selling_price || 0),
        }))}
        customers={customers ?? []}
      />
    </div>
  )
}

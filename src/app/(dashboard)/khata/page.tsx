import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KhataClient from '@/components/dashboard/khata/KhataClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Khata Ledger' }

export default async function KhataPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, shops(name)')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) redirect('/login')

  const shopsData = (shopUser as any).shops
  const shopName = (Array.isArray(shopsData) ? shopsData[0]?.name : shopsData?.name) || 'My Shop'

  // Fetch Customers with credit or ledger info
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, phone, email, outstanding_credit')
    .eq('shop_id', shopUser.shop_id)
    .order('outstanding_credit', { ascending: false })

  // Fetch Vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name, company_name, phone, email, gstin, outstanding_payable')
    .eq('shop_id', shopUser.shop_id)
    .order('outstanding_payable', { ascending: false })

  // Fetch Ledger History
  const { data: ledgerHistory } = await supabase
    .from('credit_ledger')
    .select('id, party_type, amount, balance_after, notes, txn_type, created_at, customers(name), vendors(name)')
    .eq('shop_id', shopUser.shop_id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Khata Ledger</h1>
          <p className="page-subtitle">Track customer receivables, vendor payables, and credit settlements</p>
        </div>
      </div>

      <KhataClient
        shopName={shopName}
        customers={(customers ?? []).map(c => ({
          ...c,
          outstanding_credit: Number(c.outstanding_credit || 0)
        }))}
        vendors={(vendors ?? []).map(v => ({
          ...v,
          outstanding_payable: Number(v.outstanding_payable || 0)
        }))}
        ledgerHistory={(ledgerHistory ?? []).map(l => ({
          ...l,
          amount: Number(l.amount || 0),
          balance_after: Number(l.balance_after || 0),
          party_type: l.party_type as 'customer' | 'vendor',
          customers: Array.isArray(l.customers) ? l.customers[0] : l.customers,
          vendors: Array.isArray(l.vendors) ? l.vendors[0] : l.vendors,
        }))}
      />
    </div>
  )
}

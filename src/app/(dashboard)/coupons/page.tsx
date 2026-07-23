import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import CouponsClient from '@/components/dashboard/CouponsClient'

export const metadata: Metadata = { title: 'Coupons' }

export default async function CouponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { data: coupons } = await supabase
    .from('coupons')
    .select('id, code, description, discount_type, discount_value, max_discount, min_order_value, usage_limit, usage_count, is_active, starts_at, expires_at')
    .eq('shop_id', shopUser.shop_id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">Manage discount coupons and promotional offers</p>
        </div>
      </div>
      <CouponsClient shopId={shopUser.shop_id} coupons={(coupons as any[]) ?? []} />
    </div>
  )
}

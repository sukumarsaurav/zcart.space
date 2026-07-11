import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import POSScreen from '@/components/pos/POSScreen'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'POS Billing' }

export default async function POSPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id, role').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, images, selling_price, mrp, gst_rate, unit, barcode, sku, category_id, categories(name), inventory(quantity)')
    .eq('shop_id', shopUser.shop_id)
    .eq('status', 'active')
    .order('name')
    .limit(200)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('shop_id', shopUser.shop_id)
    .eq('is_active', true)
    .order('name')

  return (
    <POSScreen
      shopId={shopUser.shop_id}
      products={(products as any[]) ?? []}
      categories={(categories as any[]) ?? []}
    />
  )
}

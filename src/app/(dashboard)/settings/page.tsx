import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShopSettingsForm from '@/components/dashboard/ShopSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id, role').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('id', shopUser.shop_id)
    .single()

  const { data: location } = await supabase
    .from('shop_locations')
    .select('*')
    .eq('shop_id', shopUser.shop_id)
    .eq('is_primary', true)
    .single()

  return (
    <div style={{ height: 'calc(100vh - 72px)' }}>
      <ShopSettingsForm shop={shop!} location={location} />
    </div>
  )
}

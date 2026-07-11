import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | zCart Dashboard', default: 'Dashboard' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/login')

  // Get their shop
  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, role, shops(id, name, slug)')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!shopUser?.shops) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const shop = Array.isArray(shopUser.shops) ? shopUser.shops[0] : shopUser.shops

  return (
    <DashboardShell
      shopName={shop.name}
      shopSlug={shop.slug}
      userEmail={user.email ?? ''}
    >
      {children}
    </DashboardShell>
  )
}

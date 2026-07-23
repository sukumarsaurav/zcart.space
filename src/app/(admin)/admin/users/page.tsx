import { createServiceClient } from '@/lib/supabase/server'
import UsersClient, { UserRow } from '@/components/admin/UsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merchant Users & Super Admins Directory',
}

export const revalidate = 0

export default async function AdminUsersPage() {
  const serviceClient = await createServiceClient()

  const [
    { data: profiles },
    { data: authUsers },
    { data: shopUsers },
  ] = await Promise.all([
    serviceClient.from('global_profiles').select('*').order('created_at', { ascending: false }),
    serviceClient.auth.admin.listUsers(),
    serviceClient.from('shop_users').select('auth_user_id, shop_id'),
  ])

  // Email map
  const emailMap = new Map<string, string>()
  if (authUsers?.users) {
    authUsers.users.forEach((u) => {
      if (u.email) emailMap.set(u.id, u.email)
    })
  }

  // Shop count map
  const shopCountMap = new Map<string, number>()
  ;(shopUsers ?? []).forEach((su) => {
    const current = shopCountMap.get(su.auth_user_id) || 0
    shopCountMap.set(su.auth_user_id, current + 1)
  })

  const users: UserRow[] = (profiles ?? []).map((p) => ({
    id: p.id,
    auth_user_id: p.auth_user_id,
    full_name: p.full_name,
    phone: p.phone,
    is_superadmin: p.is_superadmin || false,
    created_at: p.created_at,
    email: emailMap.get(p.auth_user_id) || undefined,
    shops_count: shopCountMap.get(p.auth_user_id) || 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Merchants & Platform Accounts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Directory of registered merchant user accounts, linked shops, and Super Admin access management.
        </p>
      </div>

      <UsersClient users={users} />
    </div>
  )
}

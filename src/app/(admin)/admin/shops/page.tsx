import { createServiceClient } from '@/lib/supabase/server'
import ShopsClient, { ExtendedShop } from '@/components/admin/ShopsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registered Shops Directory',
}

export const revalidate = 0

export default async function AdminShopsPage() {
  const serviceClient = await createServiceClient()

  const [
    { data: shops },
    { data: orders },
    { data: shopUsers },
    { data: profiles },
  ] = await Promise.all([
    serviceClient.from('shops').select('*').order('created_at', { ascending: false }),
    serviceClient.from('orders').select('shop_id, total_amount, status').neq('status', 'cancelled'),
    serviceClient.from('shop_users').select('shop_id, auth_user_id, role, phone').eq('role', 'owner'),
    serviceClient.from('global_profiles').select('auth_user_id, full_name, phone'),
  ])

  // Profile lookup
  const profileMap = new Map<string, { name: string; phone?: string | null }>()
  ;(profiles ?? []).forEach((p) => {
    profileMap.set(p.auth_user_id, { name: p.full_name, phone: p.phone })
  })

  // Owner lookup per shop
  const shopOwnerMap = new Map<string, { name: string; phone?: string | null }>()
  ;(shopUsers ?? []).forEach((su) => {
    const prof = profileMap.get(su.auth_user_id)
    if (prof) {
      shopOwnerMap.set(su.shop_id, { name: prof.name, phone: prof.phone || su.phone })
    }
  })

  // Order stats lookup per shop
  const gmvMap = new Map<string, number>()
  const orderCountMap = new Map<string, number>()

  ;(orders ?? []).forEach((o) => {
    const currentGmv = gmvMap.get(o.shop_id) || 0
    gmvMap.set(o.shop_id, currentGmv + (Number(o.total_amount) || 0))

    const currentCount = orderCountMap.get(o.shop_id) || 0
    orderCountMap.set(o.shop_id, currentCount + 1)
  })

  const extendedShops: ExtendedShop[] = (shops ?? []).map((s) => {
    const owner = shopOwnerMap.get(s.id)
    return {
      ...s,
      owner_name: owner?.name || 'Merchant Owner',
      owner_phone: owner?.phone || s.phone || undefined,
      total_gmv: gmvMap.get(s.id) || 0,
      total_orders_count: orderCountMap.get(s.id) || 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Shops Directory & Control</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage all registered merchant stores, modify subscription plan levels, and manage store operational status.
        </p>
      </div>

      <ShopsClient shops={extendedShops} />
    </div>
  )
}

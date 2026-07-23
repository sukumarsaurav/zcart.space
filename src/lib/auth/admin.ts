import { redirect } from 'next/navigation'
import { createClient, createServiceClient, getAuthUser } from '@/lib/supabase/server'
import type { Shop, Plan, GlobalProfile } from '@/types/database'

export interface SaaSOverviewStats {
  totalShops: number
  activeShops: number
  suspendedShops: number
  totalMerchants: number
  totalGMV: number
  totalOrdersCount: number
  estimatedMonthlyRevenue: number
  planDistribution: Record<string, number>
  recentShops: (Shop & { owner_name?: string; owner_email?: string })[]
}

/** Check if a given user ID has superadmin privileges. */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
  if (!userId) return false
  const serviceClient = await createServiceClient()
  
  const { data: profile } = await serviceClient
    .from('global_profiles')
    .select('is_superadmin')
    .eq('auth_user_id', userId)
    .maybeSingle()

  return !!profile?.is_superadmin
}

/** Guard helper for Server Components / Server Actions. */
export async function requireSuperAdmin() {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login')
  }

  const isSuper = await checkIsSuperAdmin(user.id)
  if (!isSuper) {
    redirect('/dashboard')
  }

  return user
}

/** Aggregate cross-tenant stats for the SaaS Super Admin Panel. */
export async function getSaaSAdminOverviewData(): Promise<SaaSOverviewStats> {
  const serviceClient = await createServiceClient()

  const [
    { data: shops, count: totalShopsCount },
    { data: orders },
    { data: plans },
    { count: totalMerchantsCount },
    { data: profiles },
  ] = await Promise.all([
    serviceClient
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false }),
    serviceClient
      .from('orders')
      .select('id, total_amount, status, created_at')
      .neq('status', 'cancelled'),
    serviceClient
      .from('plans')
      .select('key, price_monthly'),
    serviceClient
      .from('global_profiles')
      .select('id', { count: 'exact', head: true }),
    serviceClient
      .from('global_profiles')
      .select('auth_user_id, full_name'),
  ])

  const shopList: Shop[] = shops ?? []
  const activeShops = shopList.filter((s) => s.is_active).length
  const suspendedShops = shopList.filter((s) => !s.is_active).length

  // Calculate total GMV across completed/valid orders
  const totalGMV = (orders ?? []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const totalOrdersCount = (orders ?? []).length

  // Calculate plan distribution & estimated SaaS monthly recurring revenue
  const planPriceMap: Record<string, number> = {}
  ;(plans ?? []).forEach((p) => {
    planPriceMap[p.key] = Number(p.price_monthly) || 0
  })

  const planDistribution: Record<string, number> = {
    free: 0,
    starter: 0,
    pro: 0,
    enterprise: 0,
  }

  let estimatedMonthlyRevenue = 0

  shopList.forEach((s) => {
    const planKey = s.plan || 'free'
    planDistribution[planKey] = (planDistribution[planKey] || 0) + 1
    if (s.is_active) {
      estimatedMonthlyRevenue += planPriceMap[planKey] || 0
    }
  })

  // Map owner info to recent shops
  const profileNameMap = new Map<string, string>()
  ;(profiles ?? []).forEach((p) => {
    profileNameMap.set(p.auth_user_id, p.full_name)
  })

  // Fetch shop_users to associate owner profiles to recent 5 shops
  const recentShopsRaw = shopList.slice(0, 5)
  const shopIds = recentShopsRaw.map((s) => s.id)
  
  const { data: shopUsers } = await serviceClient
    .from('shop_users')
    .select('shop_id, auth_user_id, role')
    .in('shop_id', shopIds)
    .eq('role', 'owner')

  const shopOwnerMap = new Map<string, string>()
  ;(shopUsers ?? []).forEach((su) => {
    const ownerName = profileNameMap.get(su.auth_user_id) || 'Merchant'
    shopOwnerMap.set(su.shop_id, ownerName)
  })

  const recentShops = recentShopsRaw.map((s) => ({
    ...s,
    owner_name: shopOwnerMap.get(s.id) || 'Merchant Owner',
  }))

  return {
    totalShops: totalShopsCount ?? shopList.length,
    activeShops,
    suspendedShops,
    totalMerchants: totalMerchantsCount ?? 0,
    totalGMV,
    totalOrdersCount,
    estimatedMonthlyRevenue,
    planDistribution,
    recentShops,
  }
}

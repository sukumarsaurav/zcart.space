import { createServiceClient } from '@/lib/supabase/server'

// Finds (or lazily creates) the shop-scoped `customers` row for the currently
// logged-in shopper. Mirrors the phone-based lookup in api/checkout/route.ts,
// but keyed by auth_user_id since these callers require a real login.
export async function resolveCustomerId(shopSlug: string, authUserId: string, email: string | null) {
  const supabaseService = await createServiceClient()

  const { data: shop } = await supabaseService.from('shops').select('id').eq('slug', shopSlug).single()
  if (!shop) return null

  const { data: existing } = await supabaseService
    .from('customers')
    .select('id')
    .eq('shop_id', shop.id)
    .eq('auth_user_id', authUserId)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabaseService
    .from('customers')
    .insert({
      shop_id: shop.id,
      auth_user_id: authUserId,
      name: email?.split('@')[0] ?? 'Customer',
      email,
    })
    .select('id')
    .single()

  if (error) return null
  return created.id
}

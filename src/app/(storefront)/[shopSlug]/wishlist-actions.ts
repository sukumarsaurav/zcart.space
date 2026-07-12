'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ToggleWishlistResult =
  | { requiresLogin: true }
  | { requiresLogin: false; wishlisted: boolean }

// Finds (or lazily creates) the shop-scoped `customers` row for the currently
// logged-in shopper. Mirrors the phone-based lookup in api/checkout/route.ts,
// but keyed by auth_user_id since a wishlist requires a real login.
async function resolveCustomerId(shopSlug: string, authUserId: string, email: string | null) {
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

export async function toggleWishlist(shopSlug: string, productId: string): Promise<ToggleWishlistResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { requiresLogin: true }

  const customerId = await resolveCustomerId(shopSlug, user.id, user.email ?? null)
  if (!customerId) return { requiresLogin: true }

  const { data: existingWish } = await supabase
    .from('wishlists')
    .select('id')
    .eq('customer_id', customerId)
    .eq('product_id', productId)
    .maybeSingle()

  if (existingWish) {
    await supabase.from('wishlists').delete().eq('id', existingWish.id)
    revalidatePath(`/${shopSlug}`)
    return { requiresLogin: false, wishlisted: false }
  }

  const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).single()
  if (!shop) return { requiresLogin: true }

  await supabase.from('wishlists').insert({ shop_id: shop.id, customer_id: customerId, product_id: productId })
  revalidatePath(`/${shopSlug}`)
  return { requiresLogin: false, wishlisted: true }
}

// Server-side helper (not a server action) for pages to fetch which of the
// current visitor's products are already wishlisted, for initial render state.
export async function getWishlistedProductIds(shopSlug: string): Promise<Set<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).single()
  if (!shop) return new Set()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('shop_id', shop.id)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!customer) return new Set()

  const { data: wishes } = await supabase.from('wishlists').select('product_id').eq('customer_id', customer.id)
  return new Set((wishes ?? []).map((w) => w.product_id))
}

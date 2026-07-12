'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveCustomerId } from '@/lib/storefront/customer'

export type ToggleWishlistResult =
  | { requiresLogin: true }
  | { requiresLogin: false; wishlisted: boolean }

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

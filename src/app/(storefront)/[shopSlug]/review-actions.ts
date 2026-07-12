'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveCustomerId } from '@/lib/storefront/customer'

export type SubmitReviewResult =
  | { requiresLogin: true }
  | { requiresLogin: false; error: string }
  | { requiresLogin: false; success: true }

export async function submitReview(
  shopSlug: string,
  productId: string,
  rating: number,
  title: string,
  body: string
): Promise<SubmitReviewResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { requiresLogin: true }

  const customerId = await resolveCustomerId(shopSlug, user.id, user.email ?? null)
  if (!customerId) return { requiresLogin: true }

  const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).single()
  if (!shop) return { requiresLogin: false, error: 'Shop not found' }

  const { error } = await supabase.from('product_reviews').insert({
    shop_id: shop.id,
    product_id: productId,
    customer_id: customerId,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    title: title || null,
    body: body || null,
    is_published: true,
  })

  if (error) return { requiresLogin: false, error: error.message }

  revalidatePath(`/${shopSlug}/products`)
  return { requiresLogin: false, success: true }
}

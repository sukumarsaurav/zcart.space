'use server'

import { createClient } from '@/lib/supabase/server'

export async function getProductsBySlugs(shopSlug: string, slugs: string[]) {
  if (slugs.length === 0) return []

  const supabase = await createClient()
  const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).single()
  if (!shop) return []

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, images, mrp, selling_price')
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .in('slug', slugs)

  // Preserve most-recently-viewed-first order (the `in` query doesn't guarantee it).
  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]))
  return slugs.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => !!p)
}

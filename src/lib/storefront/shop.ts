import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import type { Shop } from '@/types/database'

/**
 * Request-cached fetcher for shop details by slug.
 * Prevents redundant DB queries within the same server request across layout, page, and metadata.
 */
export const getShopBySlug = cache(async (shopSlug: string): Promise<Shop | null> => {
  const supabase = createPublicClient()
  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, logo_url, banner_url, phone, email, is_active')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .maybeSingle()

  return shop as Shop | null
})


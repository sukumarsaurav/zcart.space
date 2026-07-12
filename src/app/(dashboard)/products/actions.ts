'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ProductStatus } from '@/types/database'

export async function setProductStatus(productId: string, shopId: string, status: ProductStatus) {
  const supabase = await createClient()

  await supabase
    .from('products')
    .update({ status })
    .eq('id', productId)
    .eq('shop_id', shopId)

  revalidatePath('/products')
}

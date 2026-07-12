'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface AdjustStockInput {
  shopId: string
  productId: string
  locationId: string | null
  variantId: string | null
  currentQuantity: number
  delta: number
  reason: string
}

export async function adjustStock(input: AdjustStockInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // inventory_ledger.created_by references shop_users.id, not the auth user id.
  const { data: shopUser } = user
    ? await supabase.from('shop_users').select('id').eq('auth_user_id', user.id).eq('shop_id', input.shopId).maybeSingle()
    : { data: null }

  const quantityAfter = Math.max(0, input.currentQuantity + input.delta)

  const { error } = await supabase.from('inventory_ledger').insert({
    shop_id: input.shopId,
    location_id: input.locationId,
    product_id: input.productId,
    variant_id: input.variantId,
    entry_type: 'adjustment',
    delta: quantityAfter - input.currentQuantity,
    quantity_after: quantityAfter,
    notes: input.reason || null,
    created_by: shopUser?.id ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true, quantityAfter }
}

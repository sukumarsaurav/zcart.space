'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OrderStatus } from '@/types/database'

const RESTOCKING_STATUSES: OrderStatus[] = ['cancelled', 'refunded']

export async function updateOrderStatus(orderId: string, shopId: string, currentStatus: OrderStatus, nextStatus: OrderStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // inventory_ledger.created_by references shop_users.id, not the auth user id.
  const { data: shopUser } = user
    ? await supabase.from('shop_users').select('id').eq('auth_user_id', user.id).eq('shop_id', shopId).maybeSingle()
    : { data: null }

  // Restock inventory when an order that already had stock deducted gets
  // cancelled or refunded — mirrors the deduction done at checkout/POS time.
  const alreadyRestocked = RESTOCKING_STATUSES.includes(currentStatus)
  if (RESTOCKING_STATUSES.includes(nextStatus) && !alreadyRestocked) {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', orderId)

    for (const item of items ?? []) {
      let invQuery = supabase
        .from('inventory')
        .select('location_id, quantity')
        .eq('shop_id', shopId)
        .eq('product_id', item.product_id)
      invQuery = item.variant_id ? invQuery.eq('variant_id', item.variant_id) : invQuery.is('variant_id', null)
      const { data: inv } = await invQuery.maybeSingle()

      if (!inv) continue

      await supabase.from('inventory_ledger').insert({
        shop_id: shopId,
        location_id: inv.location_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        entry_type: 'return',
        delta: item.quantity,
        quantity_after: Number(inv.quantity) + Number(item.quantity),
        reference_type: 'order',
        reference_id: orderId,
        created_by: shopUser?.id ?? null,
      })
    }
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .eq('shop_id', shopId)

  if (error) return { error: error.message }

  if (nextStatus === 'refunded') {
    await supabase
      .from('payments')
      .update({ status: 'refunded' })
      .eq('order_id', orderId)
      .eq('shop_id', shopId)
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  revalidatePath('/inventory')
  return { success: true }
}

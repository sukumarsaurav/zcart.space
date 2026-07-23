'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPurchaseRecord(payload: {
  vendorId?: string | null
  invoiceNumber?: string | null
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitCost: number
    gstRate: string
    batchNumber?: string | null
    expiryDate?: string | null
  }>
  paymentMethod: string
  paidAmount: number
  notes?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) throw new Error('Shop not found')

  if (!payload.items || payload.items.length === 0) {
    throw new Error('Purchase must contain at least 1 item')
  }

  // Calculate totals
  let subtotal = 0
  let taxAmount = 0

  const itemsProcessed = payload.items.map((item) => {
    const qty = Number(item.quantity)
    const cost = Number(item.unitCost)
    const rate = Number(item.gstRate || 0)
    const lineBase = qty * cost
    const lineTax = (lineBase * rate) / 100
    const lineTotal = lineBase + lineTax

    subtotal += lineBase
    taxAmount += lineTax

    return {
      product_id: item.productId,
      product_name: item.productName,
      quantity: qty,
      unit_cost: cost,
      gst_rate: (item.gstRate || '0') as any,
      tax_amount: lineTax,
      line_total: lineTotal,
      batch_number: item.batchNumber || null,
      expiry_date: item.expiryDate || null,
    }
  })

  const totalAmount = subtotal + taxAmount
  const paidAmount = Number(payload.paidAmount || 0)
  const isFullyPaid = paidAmount >= totalAmount
  const paymentStatus = isFullyPaid ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'
  const unpaidBalance = Math.max(0, totalAmount - paidAmount)

  // 1. Create Purchase record
  const purchaseNum = `PUR-${Date.now().toString().slice(-6)}`

  const { data: purchase, error: purErr } = await supabase
    .from('purchases')
    .insert({
      shop_id: shopUser.shop_id,
      vendor_id: payload.vendorId || null,
      purchase_number: purchaseNum,
      invoice_number: payload.invoiceNumber || null,
      status: 'received',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      payment_status: paymentStatus as any,
      payment_method: (payload.paymentMethod || 'bank_transfer') as any,
      notes: payload.notes || null,
    })
    .select()
    .single()

  if (purErr) throw new Error(purErr.message)

  // 2. Insert items
  const itemsToInsert = itemsProcessed.map((it) => ({
    ...it,
    purchase_id: purchase.id,
    shop_id: shopUser.shop_id,
  }))

  await supabase.from('purchase_items').insert(itemsToInsert)

  // 3. Increment inventory stock for each product
  for (const item of payload.items) {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('shop_id', shopUser.shop_id)
      .eq('product_id', item.productId)
      .single()

    if (inv) {
      await supabase
        .from('inventory')
        .update({ quantity: Number(inv.quantity || 0) + Number(item.quantity) })
        .eq('id', inv.id)
    } else {
      await supabase.from('inventory').insert({
        shop_id: shopUser.shop_id,
        product_id: item.productId,
        quantity: Number(item.quantity),
      })
    }

    // Also update product cost price if provided
    if (item.unitCost > 0) {
      await supabase
        .from('products')
        .update({ cost_price: item.unitCost })
        .eq('id', item.productId)
    }
  }

  // 4. If unpaid balance remains and vendor is specified, increment vendor outstanding payable
  if (unpaidBalance > 0 && payload.vendorId) {
    const { data: v } = await supabase
      .from('vendors')
      .select('outstanding_payable')
      .eq('id', payload.vendorId)
      .single()

    if (v) {
      const newPayable = Number(v.outstanding_payable || 0) + unpaidBalance
      await supabase
        .from('vendors')
        .update({ outstanding_payable: newPayable })
        .eq('id', payload.vendorId)

      await supabase.from('credit_ledger').insert({
        shop_id: shopUser.shop_id,
        vendor_id: payload.vendorId,
        party_type: 'vendor',
        txn_type: 'credit',
        amount: unpaidBalance,
        balance_after: newPayable,
        notes: `Purchase bill #${purchaseNum}`,
      })
    }
  }

  revalidatePath('/purchases')
  revalidatePath('/inventory')
  revalidatePath('/khata')
  return { success: true, purchase }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEstimateRecord(payload: {
  customerId?: string | null
  validUntil?: string | null
  notes?: string | null
  items: Array<{
    productId?: string | null
    productName: string
    quantity: number
    unitPrice: number
    gstRate: string
  }>
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
    throw new Error('Estimate must contain at least 1 line item')
  }

  let subtotal = 0
  let taxAmount = 0

  const itemsProcessed = payload.items.map((item) => {
    const qty = Number(item.quantity)
    const price = Number(item.unitPrice)
    const rate = Number(item.gstRate || 0)
    const lineBase = qty * price
    const lineTax = (lineBase * rate) / 100
    const lineTotal = lineBase + lineTax

    subtotal += lineBase
    taxAmount += lineTax

    return {
      product_id: item.productId || null,
      product_name: item.productName,
      quantity: qty,
      unit_price: price,
      gst_rate: (item.gstRate || '0') as any,
      tax_amount: lineTax,
      line_total: lineTotal,
    }
  })

  const totalAmount = subtotal + taxAmount
  const estimateNum = `EST-${Date.now().toString().slice(-6)}`

  const { data: estimate, error: estErr } = await supabase
    .from('estimates')
    .insert({
      shop_id: shopUser.shop_id,
      customer_id: payload.customerId || null,
      estimate_number: estimateNum,
      valid_until: payload.validUntil || null,
      status: 'draft',
      subtotal,
      taxable_amount: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: payload.notes || null,
    })
    .select()
    .single()

  if (estErr) throw new Error(estErr.message)

  const itemsToInsert = itemsProcessed.map((it) => ({
    ...it,
    estimate_id: estimate.id,
    shop_id: shopUser.shop_id,
  }))

  await supabase.from('estimate_items').insert(itemsToInsert)

  revalidatePath('/estimates')
  return { success: true, estimate }
}

export async function convertEstimateToInvoice(estimateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, shops(name, gstin, phone, email)')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) throw new Error('Shop not found')

  // 1. Fetch estimate
  const { data: estimate } = await supabase
    .from('estimates')
    .select('*, customers(name, phone, email, gstin)')
    .eq('id', estimateId)
    .single()

  if (!estimate) throw new Error('Estimate not found')
  if (estimate.status === 'converted') throw new Error('Estimate is already converted')

  // 2. Fetch estimate items
  const { data: estimateItems } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)

  if (!estimateItems?.length) throw new Error('Estimate has no line items')

  // 3. Create Order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      shop_id: shopUser.shop_id,
      customer_id: estimate.customer_id,
      channel: 'pos',
      status: 'confirmed',
      subtotal: estimate.subtotal,
      discount_amount: estimate.discount_amount || 0,
      taxable_amount: estimate.taxable_amount,
      cgst_amount: Number(estimate.tax_amount) / 2,
      sgst_amount: Number(estimate.tax_amount) / 2,
      total_amount: estimate.total_amount,
      paid_amount: estimate.total_amount,
      payment_status: 'paid',
      notes: `Converted from Estimate #${estimate.estimate_number}`,
    })
    .select()
    .single()

  if (orderErr) throw new Error(orderErr.message)

  // 4. Create Order Items
  const orderItemsToInsert = estimateItems.map((it) => ({
    order_id: order.id,
    shop_id: shopUser.shop_id,
    product_id: it.product_id || '',
    product_name: it.product_name,
    unit: 'pcs',
    quantity: it.quantity,
    unit_price: it.unit_price,
    mrp: it.unit_price,
    discount_amount: 0,
    taxable_amount: Number(it.quantity) * Number(it.unit_price),
    gst_rate: it.gst_rate,
    cgst_amount: Number(it.tax_amount) / 2,
    sgst_amount: Number(it.tax_amount) / 2,
    line_total: it.line_total,
  }))

  await supabase.from('order_items').insert(orderItemsToInsert)

  // 5. Generate Sales Invoice
  const invNum = `INV-${Date.now().toString().slice(-6)}`
  const customer = Array.isArray(estimate.customers) ? estimate.customers[0] : estimate.customers
  const shopObj = Array.isArray(shopUser.shops) ? shopUser.shops[0] : shopUser.shops

  const { data: invoice } = await supabase
    .from('invoices')
    .insert({
      shop_id: shopUser.shop_id,
      order_id: order.id,
      invoice_number: invNum,
      invoice_type: 'sale',
      invoice_date: new Date().toISOString().split('T')[0],
      subtotal: estimate.subtotal,
      discount_amount: 0,
      cgst_amount: Number(estimate.tax_amount) / 2,
      sgst_amount: Number(estimate.tax_amount) / 2,
      total_amount: estimate.total_amount,
      buyer_name: customer?.name || 'Walk-in Customer',
      buyer_gstin: customer?.gstin || null,
      seller_snapshot: shopObj || {},
    })
    .select()
    .single()

  // 6. Update estimate status to converted
  await supabase
    .from('estimates')
    .update({
      status: 'converted',
      converted_order_id: order.id,
    })
    .eq('id', estimateId)

  revalidatePath('/estimates')
  revalidatePath('/invoices')
  revalidatePath('/orders')
  return { success: true, invoiceId: invoice?.id }
}

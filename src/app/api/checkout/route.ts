import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

// Initialize Razorpay only if keys are present (to avoid crashing on init if not set)
let razorpay: Razorpay | null = null
if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { shopSlug, cart, customer, shipping, paymentMethod } = await req.json()
    const supabase = await createServiceClient()

    // 1. Get shop ID
    const { data: shop, error: shopErr } = await supabase
      .from('shops').select('id, name').eq('slug', shopSlug).single()
    if (shopErr || !shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

    // 2. Resolve Customer (create if not exists based on phone)
    let customerId: string | null = null
    const { data: existingCust } = await supabase
      .from('customers').select('id').eq('shop_id', shop.id).eq('phone', customer.phone).single()
    
    if (existingCust) {
      customerId = existingCust.id
    } else {
      const { data: newCust, error: custErr } = await supabase
        .from('customers').insert({
          shop_id: shop.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
        }).select('id').single()
      if (!custErr && newCust) customerId = newCust.id
    }

    // 3. Verify prices and calculate totals from DB
    const productIds = cart.map((i: any) => i.productId)
    const { data: dbProducts } = await supabase
      .from('products').select('id, name, selling_price, mrp, gst_rate, unit').in('id', productIds)

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 400 })
    }

    let subtotal = 0
    const orderItemsToInsert = []

    for (const item of cart) {
      const dbProduct = dbProducts.find(p => p.id === item.productId)
      if (!dbProduct) continue
      
      const qty = Number(item.quantity)
      const price = Number(dbProduct.selling_price)
      const lineTotal = price * qty
      subtotal += lineTotal

      orderItemsToInsert.push({
        shop_id: shop.id,
        product_id: dbProduct.id,
        product_name: dbProduct.name,
        unit: dbProduct.unit,
        quantity: qty,
        unit_price: price,
        mrp: Number(dbProduct.mrp),
        discount_amount: 0,
        gst_rate: dbProduct.gst_rate,
        line_total: lineTotal,
        taxable_amount: lineTotal,
      })
    }

    const total = subtotal // Add shipping logic here if needed

    // 4. Create Order (Status: pending)
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      shop_id: shop.id,
      customer_id: customerId,
      channel: 'online',
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
      subtotal,
      total_amount: total,
      shipping_address: shipping,
    }).select('id').single()

    if (orderErr || !order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

    // 5. Insert order items
    const itemsWithOrderId = orderItemsToInsert.map(i => ({ ...i, order_id: order.id }))
    await supabase.from('order_items').insert(itemsWithOrderId)

    // 6. Handle Payment Method
    if (paymentMethod === 'cod') {
      // Create pending payment record
      await supabase.from('payments').insert({
        shop_id: shop.id,
        order_id: order.id,
        method: 'cod',
        amount: total,
        status: 'pending',
        gateway: 'manual',
      })

      // Decrement inventory (Ledger sync)
      await Promise.all(itemsWithOrderId.map(i =>
        supabase.from('inventory_ledger').insert({
          shop_id: shop.id,
          product_id: i.product_id,
          entry_type: 'sale',
          delta: -i.quantity,
          reference_type: 'order',
          reference_id: order.id,
        })
      ))

      return NextResponse.json({ success: true, orderId: order.id })

    } else if (paymentMethod === 'online') {
      // Create Razorpay order
      if (!razorpay) {
        return NextResponse.json({ error: 'Online payments are not configured' }, { status: 500 })
      }

      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(total * 100), // in paise
        currency: 'INR',
        receipt: order.id,
        notes: { shopId: shop.id, orderId: order.id }
      })

      // We do not decrement inventory yet; it happens on successful payment webhook/verify

      return NextResponse.json({
        success: true,
        orderId: order.id,
        shopName: shop.name,
        razorpayOrder: {
          id: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
        }
      })
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })

  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

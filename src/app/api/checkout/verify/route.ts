import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json()
    
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })

    // 1. Verify signature
    const shasum = crypto.createHmac('sha256', secret)
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // 2. Fetch order to verify state and get shop_id
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('id, shop_id, total_amount, status').eq('id', orderId).single()
      
    if (orderErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'pending') return NextResponse.json({ success: true }) // Already processed

    // 3. Update Order status
    await supabase.from('orders').update({
      status: 'confirmed',
      payment_status: 'paid',
      paid_amount: order.total_amount
    }).eq('id', order.id)

    // 4. Create Payment record
    await supabase.from('payments').insert({
      shop_id: order.shop_id,
      order_id: order.id,
      method: 'online', // or specific method if Razorpay API was queried
      amount: order.total_amount,
      status: 'paid',
      gateway: 'razorpay',
      paid_at: new Date().toISOString()
    })

    // 5. Decrement inventory
    const { data: items } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', order.id)
    if (items) {
      await Promise.all(items.map(i =>
        supabase.from('inventory_ledger').insert({
          shop_id: order.shop_id,
          product_id: i.product_id,
          entry_type: 'sale',
          delta: -i.quantity,
          reference_type: 'order',
          reference_id: order.id,
        })
      ))
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

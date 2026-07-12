import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createInvoiceForOrder } from '@/lib/invoicing'
import { sendOrderConfirmationEmail } from '@/lib/email'
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

    // 2. Fetch order to get shop_id/amount (existence check only — the real
    // concurrency guard is the conditional update below).
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('id, shop_id, total_amount, status').eq('id', orderId).single()

    if (orderErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // 3. Atomically flip status pending -> confirmed. This UPDATE...WHERE is a
    // row-level mutex: if two verify calls race (duplicate webhook fire), only
    // one can match `status = 'pending'` and the other gets 0 rows back, so the
    // inventory decrement below can never run twice for the same order.
    const { data: updatedOrder } = await supabase
      .from('orders')
      .update({ status: 'confirmed', payment_status: 'paid', paid_amount: order.total_amount })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select('id')
      .single()

    if (!updatedOrder) return NextResponse.json({ success: true }) // Already processed by an earlier call

    // 4. Create Payment record. idempotency_key (unique) is a second line of
    // defense against a duplicate Razorpay payment_id being recorded twice.
    const { error: paymentErr } = await supabase.from('payments').insert({
      shop_id: order.shop_id,
      order_id: order.id,
      method: 'online', // or specific method if Razorpay API was queried
      amount: order.total_amount,
      status: 'paid',
      gateway: 'razorpay',
      gateway_payment_id: razorpay_payment_id,
      gateway_order_id: razorpay_order_id,
      idempotency_key: razorpay_payment_id,
      paid_at: new Date().toISOString()
    })
    if (paymentErr && paymentErr.code !== '23505') { // ignore unique-violation on idempotency_key
      console.error('Payment record insert error:', paymentErr)
    }

    // 5. Decrement inventory
    const { data: items } = await supabase.from('order_items').select('product_id, product_name, quantity, line_total').eq('order_id', order.id)
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

    // 6. Invoice + confirmation email
    const invoice = await createInvoiceForOrder(supabase, { shopId: order.shop_id, orderId: order.id })

    const { data: fullOrder } = await supabase
      .from('orders')
      .select('customer_id, customers(name, email)')
      .eq('id', order.id)
      .single()
    const customer = fullOrder?.customers as any
    if (customer?.email) {
      await sendOrderConfirmationEmail({
        to: customer.email,
        customerName: customer.name,
        shopName: (await supabase.from('shops').select('name').eq('id', order.shop_id).single()).data?.name ?? 'Your shop',
        orderId: order.id,
        items: items ?? [],
        totalAmount: Number(order.total_amount),
        invoiceUrl: invoice?.pdfUrl,
      })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

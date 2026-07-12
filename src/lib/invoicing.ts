import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates an invoice row for a confirmed/paid order and triggers PDF generation
 * via the `generate-invoice` edge function. Errors are logged, not thrown —
 * order confirmation must succeed even if invoicing fails.
 */
export async function createInvoiceForOrder(
  supabase: SupabaseClient,
  params: {
    shopId: string
    orderId: string
  }
): Promise<{ invoiceId: string; invoiceNumber: string; pdfUrl: string | null } | null> {
  const { shopId, orderId } = params

  try {
    const { data: shop } = await supabase
      .from('shops')
      .select('name, gstin, pan, phone, email')
      .eq('id', shopId)
      .single()

    const { data: order } = await supabase
      .from('orders')
      .select('subtotal, discount_amount, cgst_amount, sgst_amount, igst_amount, total_amount, shipping_address, customers(name, gstin)')
      .eq('id', orderId)
      .single()

    if (!shop || !order) return null

    const { data: invoiceNumber } = await supabase.rpc('claim_invoice_number', { p_shop_id: shopId })
    if (!invoiceNumber) return null

    const customer = order.customers as any
    const shipping = order.shipping_address as Record<string, string> | null

    const { data: invoice, error: invoiceErr } = await supabase
      .from('invoices')
      .insert({
        shop_id: shopId,
        order_id: orderId,
        invoice_number: invoiceNumber,
        invoice_type: 'sale',
        subtotal: order.subtotal,
        discount_amount: order.discount_amount,
        cgst_amount: order.cgst_amount,
        sgst_amount: order.sgst_amount,
        igst_amount: order.igst_amount,
        total_amount: order.total_amount,
        buyer_name: customer?.name ?? null,
        buyer_gstin: customer?.gstin ?? null,
        buyer_address: shipping ?? null,
        seller_snapshot: { name: shop.name, gstin: shop.gstin, pan: shop.pan, phone: shop.phone, email: shop.email },
      })
      .select('id, invoice_number')
      .single()

    if (invoiceErr || !invoice) {
      console.error('Invoice insert error:', invoiceErr)
      return null
    }

    let pdfUrl: string | null = null
    try {
      const { data: fnData, error: fnErr } = await supabase.functions.invoke('generate-invoice', {
        body: { invoiceId: invoice.id },
      })
      if (fnErr) console.error('generate-invoice function error:', fnErr)
      else pdfUrl = fnData?.pdfUrl ?? null
    } catch (fnErr) {
      console.error('generate-invoice invocation failed:', fnErr)
    }

    return { invoiceId: invoice.id, invoiceNumber: invoice.invoice_number, pdfUrl }
  } catch (err) {
    console.error('createInvoiceForOrder failed:', err)
    return null
  }
}

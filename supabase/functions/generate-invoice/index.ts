import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib@1.17.1?dts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invoiceId } = await req.json()
    if (!invoiceId) {
      throw new Error("invoiceId is required")
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, shops(name, gstin), orders(customer_id)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error("Invoice not found")
    }

    // 2. Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', invoice.order_id)

    // 3. Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()
    const fontSize = 12

    page.drawText(`Invoice #${invoice.invoice_number}`, {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Shop: ${(invoice.shops as any).name}`, {
      x: 50,
      y: height - 80,
      size: fontSize,
    })

    page.drawText(`Total: INR ${invoice.total_amount}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
    })

    let yOffset = 140
    page.drawText("Items:", { x: 50, y: height - yOffset, size: 14 })
    yOffset += 20

    if (items) {
      for (const item of items) {
        page.drawText(`${item.product_name} x ${item.quantity} - INR ${item.line_total}`, {
          x: 50,
          y: height - yOffset,
          size: fontSize,
        })
        yOffset += 20
      }
    }

    const pdfBytes = await pdfDoc.save()

    // 4. Upload to Supabase Storage
    const fileName = `invoices/${invoice.shop_id}/${invoice.invoice_number}.pdf`
    
    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error("Upload error", uploadError)
      throw uploadError
    }

    // 5. Get public URL and update invoice
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(fileName)

    await supabase
      .from('invoices')
      .update({ pdf_url: publicUrl })
      .eq('id', invoiceId)

    return new Response(
      JSON.stringify({ success: true, pdfUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

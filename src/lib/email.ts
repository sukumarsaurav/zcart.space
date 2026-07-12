import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface OrderConfirmationParams {
  to: string
  customerName: string
  shopName: string
  orderId: string
  items: { product_name: string; quantity: number; line_total: number }[]
  totalAmount: number
  invoiceUrl?: string | null
}

/** Sends the order confirmation email. No-ops (logs only) if RESEND_API_KEY isn't set yet. */
export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  const { to, customerName, shopName, orderId, items, totalAmount, invoiceUrl } = params

  if (!resend) {
    console.log(`[email] RESEND_API_KEY not set — skipping order confirmation email to ${to}`)
    return
  }

  const itemRows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;">${i.product_name} × ${i.quantity}</td><td style="padding:8px 0;text-align:right;">₹${Number(i.line_total).toLocaleString('en-IN')}</td></tr>`
    )
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2>Thanks for your order, ${customerName}!</h2>
      <p>Your order from <strong>${shopName}</strong> has been confirmed.</p>
      <p style="color:#666;font-size:14px;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        ${itemRows}
        <tr><td style="padding:12px 0 0;font-weight:bold;border-top:1px solid #eee;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:bold;border-top:1px solid #eee;">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
      </table>
      ${invoiceUrl ? `<p style="margin-top:24px;"><a href="${invoiceUrl}" style="color:#6366f1;">Download your invoice</a></p>` : ''}
    </div>
  `

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'orders@zcart.space',
      to,
      subject: `Order confirmed — ${shopName}`,
      html,
    })
  } catch (err) {
    console.error('sendOrderConfirmationEmail failed:', err)
  }
}

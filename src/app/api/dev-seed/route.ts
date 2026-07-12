import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createInvoiceForOrder } from '@/lib/invoicing'

// Dev-only demo data seeder. Idempotent: safe to call repeatedly, skips
// anything that already exists by slug/email instead of erroring. Each step
// is independently try/caught so one failure (e.g. Auth Admin API being
// flaky) doesn't block the rest of the storefront data from seeding.
// Not reachable in production.

const SHOP_SLUG = 'demo-store'
const OWNER_EMAIL = 'demo@zcart.space'
const OWNER_PASSWORD = 'DemoPass123!'

const img = (seed: string, w = 900, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabase = await createServiceClient()
  const log: string[] = []
  const errors: Record<string, string> = {}

  // ── Connectivity check ──────────────────────────────
  const { error: pingErr } = await supabase.from('shops').select('id').limit(1)
  if (pingErr) {
    return NextResponse.json({
      error: 'Cannot reach Supabase REST API at all — check NEXT_PUBLIC_SUPABASE_URL / network / project status before retrying.',
      detail: pingErr.message,
    }, { status: 500 })
  }
  log.push('Supabase REST connectivity OK')

  // ── Auth user (best-effort — dashboard login only, not required for storefront) ──
  let authUserId: string | null = null
  try {
    const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers()
    if (listErr) throw listErr
    const existingAuthUser = existingUsers?.users.find((u) => u.email === OWNER_EMAIL)

    if (existingAuthUser) {
      authUserId = existingAuthUser.id
      log.push('auth user already exists')
    } else {
      const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
        email: OWNER_EMAIL,
        password: OWNER_PASSWORD,
        email_confirm: true,
      })
      if (authErr) throw authErr
      authUserId = newUser.user?.id ?? null
      log.push('auth user created')
    }
  } catch (e: any) {
    errors.authUser = e?.message ?? String(e)
    log.push('auth user step FAILED (dashboard login will not work, storefront seeding continues)')
  }

  // ── Shop ───────────────────────────────────────────
  let shopId: string | null = null
  try {
    const { data: existingShop } = await supabase.from('shops').select('id').eq('slug', SHOP_SLUG).maybeSingle()

    if (existingShop) {
      shopId = existingShop.id
      log.push('shop already exists')
    } else {
      const { data: newShop, error: shopErr } = await supabase
        .from('shops')
        .insert({
          name: 'Demo Store',
          slug: SHOP_SLUG,
          email: OWNER_EMAIL,
          phone: '9876543210',
          gstin: '27AAAAA0000A1Z5',
          is_active: true,
          theme: { primary_color: '#d9a44a', font: 'inter', template: 'default', radius: 'rounded' },
        })
        .select('id')
        .single()
      if (shopErr || !newShop) throw shopErr ?? new Error('insert returned no row')
      shopId = newShop.id
      log.push('shop created')

      await supabase.from('shop_locations').insert({
        shop_id: shopId,
        name: 'Main Store',
        address_line1: '221B, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        is_primary: true,
        is_active: true,
      })

      if (authUserId) {
        await supabase.from('shop_users').upsert(
          {
            shop_id: shopId,
            auth_user_id: authUserId,
            role: 'owner',
            display_name: 'Demo Owner',
            is_active: true,
            joined_at: new Date().toISOString(),
          },
          { onConflict: 'shop_id,auth_user_id' }
        )
        log.push('shop_location + shop_user created')
      } else {
        log.push('shop_location created (shop_user skipped — no auth user)')
      }
    }
  } catch (e: any) {
    errors.shop = e?.message ?? String(e)
  }

  if (!shopId) {
    return NextResponse.json({ error: 'Could not create/find shop — cannot continue', log, errors }, { status: 500 })
  }

  // ── Categories ─────────────────────────────────────
  const categoryDefs = [
    { name: "Men's Fashion", slug: 'mens-fashion', image_url: img('mens-fashion', 200, 200) },
    { name: "Women's Fashion", slug: 'womens-fashion', image_url: img('womens-fashion', 200, 200) },
    { name: 'Footwear', slug: 'footwear', image_url: img('footwear', 200, 200) },
    { name: 'Accessories', slug: 'accessories', image_url: img('accessories', 200, 200) },
  ]

  const catBySlug = new Map<string, string>()
  try {
    const { data: existingCategories } = await supabase.from('categories').select('id, slug').eq('shop_id', shopId)
    for (const c of existingCategories ?? []) catBySlug.set(c.slug, c.id)

    for (const [i, c] of categoryDefs.entries()) {
      if (catBySlug.has(c.slug)) continue
      const { data: newCat, error } = await supabase
        .from('categories')
        .insert({ shop_id: shopId, name: c.name, slug: c.slug, image_url: c.image_url, sort_order: i, is_active: true })
        .select('id')
        .single()
      if (error) throw error
      if (newCat) catBySlug.set(c.slug, newCat.id)
    }
    log.push(`categories ready (${catBySlug.size})`)
  } catch (e: any) {
    errors.categories = e?.message ?? String(e)
  }

  // ── Products ───────────────────────────────────────
  const productDefs = [
    { name: 'Classic Oxford Shirt', slug: 'classic-oxford-shirt', cat: 'mens-fashion', mrp: 1999, price: 1499, featured: true, stock: 40, desc: 'Crisp cotton oxford shirt with a tailored fit. Perfect for work or weekend wear.', variants: ['S', 'M', 'L', 'XL'] },
    { name: 'Slim Fit Chinos', slug: 'slim-fit-chinos', cat: 'mens-fashion', mrp: 2499, price: 2499, featured: false, stock: 25 },
    { name: 'Denim Jacket', slug: 'denim-jacket', cat: 'mens-fashion', mrp: 3999, price: 2999, featured: true, stock: 15 },
    { name: 'Floral Wrap Dress', slug: 'floral-wrap-dress', cat: 'womens-fashion', mrp: 3499, price: 2499, featured: true, stock: 20, desc: 'Lightweight floral wrap dress with a flattering silhouette, ideal for daytime events.', variants: ['S', 'M', 'L', 'XL (unavailable)'] },
    { name: 'Silk Blend Kurta', slug: 'silk-blend-kurta', cat: 'womens-fashion', mrp: 2199, price: 2199, featured: false, stock: 30 },
    { name: 'Embroidered Saree', slug: 'embroidered-saree', cat: 'womens-fashion', mrp: 8999, price: 6299, featured: true, stock: 8 },
    { name: 'Running Sneakers', slug: 'running-sneakers', cat: 'footwear', mrp: 3999, price: 2799, featured: false, stock: 18 },
    { name: 'Leather Loafers', slug: 'leather-loafers', cat: 'footwear', mrp: 4999, price: 4999, featured: false, stock: 0 },
    { name: 'Leather Handbag', slug: 'leather-handbag', cat: 'accessories', mrp: 5999, price: 3999, featured: true, stock: 12 },
    { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', cat: 'accessories', mrp: 1499, price: 999, featured: false, stock: 3 },
  ]

  const prodBySlug = new Map<string, string>()
  try {
    const { data: existingProducts } = await supabase.from('products').select('id, slug').eq('shop_id', shopId)
    for (const p of existingProducts ?? []) prodBySlug.set(p.slug, p.id)

    for (const p of productDefs) {
      if (prodBySlug.has(p.slug)) continue
      const { data: newProd, error } = await supabase
        .from('products')
        .insert({
          shop_id: shopId,
          category_id: catBySlug.get(p.cat) ?? null,
          name: p.name,
          slug: p.slug,
          description: p.desc ?? `${p.name} — quality product from Demo Store.`,
          images: [img(p.slug), img(p.slug + '-2')],
          mrp: p.mrp,
          selling_price: p.price,
          cost_price: Math.round(p.price * 0.6),
          gst_rate: '12',
          tax_inclusive: true,
          track_inventory: true,
          is_featured: p.featured,
          status: 'active',
        })
        .select('id')
        .single()
      if (error || !newProd) throw error ?? new Error(`insert failed for ${p.slug}`)
      const productId = newProd.id
      prodBySlug.set(p.slug, productId)

      await supabase.from('inventory').insert({
        shop_id: shopId,
        product_id: productId,
        quantity: p.stock,
        reorder_point: 5,
      })

      if (p.variants) {
        await supabase.from('product_variants').insert(
          p.variants.map((v, idx) => ({
            shop_id: shopId,
            product_id: productId,
            name: v.replace(' (unavailable)', ''),
            selling_price: p.price,
            mrp: p.mrp,
            is_active: !v.includes('unavailable'),
            sort_order: idx,
          }))
        )
      }
    }
    log.push(`products ready (${prodBySlug.size})`)
  } catch (e: any) {
    errors.products = e?.message ?? String(e)
    log.push(`products partially seeded (${prodBySlug.size}) before failure`)
  }

  // ── Customer + a sample order ───────────────────────
  try {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('shop_id', shopId)
      .eq('phone', '9123456780')
      .maybeSingle()

    let customerId = existingCustomer?.id
    if (!customerId) {
      const { data: newCust, error } = await supabase
        .from('customers')
        .insert({ shop_id: shopId, name: 'Aisha Verma', phone: '9123456780', email: 'aisha.verma@example.com' })
        .select('id')
        .single()
      if (error) throw error
      customerId = newCust?.id
      log.push('customer created')
    }

    const { data: existingOrders } = await supabase.from('orders').select('id').eq('shop_id', shopId).limit(1)
    if (customerId && (!existingOrders || existingOrders.length === 0)) {
      const shirt = prodBySlug.get('classic-oxford-shirt')
      const sneakers = prodBySlug.get('running-sneakers')

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          shop_id: shopId,
          customer_id: customerId,
          channel: 'online',
          status: 'confirmed',
          payment_status: 'paid',
          subtotal: 1499 + 2799,
          total_amount: 1499 + 2799,
          paid_amount: 1499 + 2799,
          shipping_address: { line1: '221B, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
        })
        .select('id')
        .single()
      if (orderErr) throw orderErr

      if (order) {
        await supabase.from('order_items').insert([
          { shop_id: shopId, order_id: order.id, product_id: shirt, product_name: 'Classic Oxford Shirt', unit: 'pcs', quantity: 1, unit_price: 1499, mrp: 1999, line_total: 1499, taxable_amount: 1499, gst_rate: '12' },
          { shop_id: shopId, order_id: order.id, product_id: sneakers, product_name: 'Running Sneakers', unit: 'pcs', quantity: 1, unit_price: 2799, mrp: 3999, line_total: 2799, taxable_amount: 2799, gst_rate: '12' },
        ])
        await supabase.from('payments').insert({
          shop_id: shopId, order_id: order.id, method: 'upi', amount: 4298, status: 'paid', gateway: 'razorpay', paid_at: new Date().toISOString(),
        })
        await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id)

        try {
          await createInvoiceForOrder(supabase, { shopId, orderId: order.id })
          log.push('sample order + invoice created')
        } catch {
          log.push('sample order created (invoice generation skipped/failed)')
        }
      }
    } else {
      log.push('orders already exist, skipped')
    }
  } catch (e: any) {
    errors.orderData = e?.message ?? String(e)
  }

  return NextResponse.json({
    success: true,
    log,
    errors: Object.keys(errors).length ? errors : undefined,
    shopSlug: SHOP_SLUG,
    storefrontUrl: `/${SHOP_SLUG}`,
    dashboardLogin: authUserId ? { email: OWNER_EMAIL, password: OWNER_PASSWORD } : 'auth user step failed — see errors.authUser',
  })
}

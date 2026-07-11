import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'
import AddToCartButton from '@/components/storefront/AddToCartButton'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string; productSlug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { productSlug } = await params
  const { data: product } = await supabase.from('products').select('name, description').eq('slug', productSlug).single()
  return {
    title: product?.name ?? 'Product',
    description: product?.description ?? undefined,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ shopSlug: string; productSlug: string }>
}) {
  const supabase = await createClient()
  const { shopSlug, productSlug } = await params

  const { data: shop } = await supabase.from('shops').select('id, name, slug, theme').eq('slug', shopSlug).eq('is_active', true).single()
  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const pc = theme.primary_color ?? '#6366f1'

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug), inventory(quantity)')
    .eq('slug', productSlug)
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const disc = Number(product.mrp) > Number(product.selling_price)
    ? Math.round((1 - Number(product.selling_price) / Number(product.mrp)) * 100) : 0
  const stock = product.inventory?.[0]?.quantity ?? null
  const inStock = stock === null || stock > 0

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, images, selling_price, mrp')
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .neq('id', product.id)
    .eq('category_id', product.category_id ?? '')
    .limit(4)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 800, fontSize: 'var(--text-lg)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: pc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} color="white" />
            </div>
            {shop.name}
          </Link>
          <Link href={`/${shopSlug}/cart`} className="btn btn-sm" style={{ background: pc, color: '#fff', borderRadius: 'var(--radius-full)', gap: 'var(--space-2)' }}>
            <ShoppingBag size={14} /> Cart
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          <Link href={`/${shopSlug}`} style={{ color: pc }}>Home</Link>
          <span>/</span>
          <Link href={`/${shopSlug}/products`} style={{ color: pc }}>Products</Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link href={`/${shopSlug}/products?category=${(product.categories as any).slug}`} style={{ color: pc }}>
                {(product.categories as any).name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </div>

        {/* Product layout */}
        <div className="product-detail-layout">
          {/* Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{
              aspectRatio: '1', borderRadius: 'var(--radius-2xl)', overflow: 'hidden',
              background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
              position: 'relative'
            }}>
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 500px" style={{ objectFit: 'cover' }} priority />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><ShoppingBag size={80} /></div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {product.images.map((img: string, i: number) => (
                  <div key={i} style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    border: i === 0 ? `2px solid ${pc}` : '1px solid var(--surface-border)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {product.categories && (
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: pc,
              }}>{(product.categories as any).name}</span>
            )}
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, lineHeight: 1.2 }}>{product.name}</h1>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>₹{Number(product.selling_price).toLocaleString('en-IN')}</span>
              {disc > 0 && (
                <>
                  <span style={{ fontSize: 'var(--text-xl)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>{disc}% OFF</span>
                </>
              )}
            </div>

            {/* GST info */}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
              {product.tax_inclusive ? 'Price inclusive of GST' : `+ ${product.gst_rate}% GST`}
              {product.hsn_code && ` · HSN: ${product.hsn_code}`}
            </p>

            {/* Stock */}
            {stock !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: inStock ? '#22c55e' : '#ef4444',
                }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: inStock ? 'var(--color-success-400)' : 'var(--color-danger-400)' }}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            )}

            {/* Add to cart */}
            <AddToCartButton product={product} shopSlug={shopSlug} primaryColor={pc} disabled={!inStock} />

            {/* Trust signals */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)',
              paddingTop: 'var(--space-4)', borderTop: '1px solid var(--surface-border)',
            }}>
              {[
                { icon: Truck, label: 'Free delivery on eligible orders' },
                { icon: Shield, label: 'Secure payments' },
                { icon: RotateCcw, label: 'Easy returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Icon size={18} color="var(--text-tertiary)" />
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--space-5)' }}>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Description</h2>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {(related?.length ?? 0) > 0 && (
          <section style={{ marginTop: 'var(--space-16)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>You may also like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-5)' }}>
              {related!.map((r) => (
                <Link key={r.id} href={`/${shopSlug}/products/${r.slug}`} style={{
                  background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
                  borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                }}>
                  <div style={{ aspectRatio: '1', background: 'var(--surface-elevated)', position: 'relative' }}>
                    {r.images?.[0] ? <Image src={r.images[0]} alt={r.name} fill sizes="(max-width: 768px) 50vw, 200px" style={{ objectFit: 'cover' }} /> :
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><ShoppingBag size={32} /></div>}
                  </div>
                  <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{r.name}</p>
                    <span style={{ fontWeight: 700 }}>₹{Number(r.selling_price).toLocaleString('en-IN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

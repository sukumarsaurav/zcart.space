import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw, Heart, Ruler, Star } from 'lucide-react'
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
    .select('*, categories(name, slug), inventory(quantity), product_variants(id, name, is_active)')
    .eq('slug', productSlug)
    .eq('shop_id', shop.id)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const disc = Number(product.mrp) > Number(product.selling_price)
    ? Math.round((1 - Number(product.selling_price) / Number(product.mrp)) * 100) : 0
  const stock = product.inventory?.[0]?.quantity ?? null
  const inStock = stock === null || stock > 0
  const variants = (product.product_variants as { id: string; name: string; is_active: boolean }[]) ?? []

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
    <div style={{ minHeight: '100vh', paddingBottom: '96px' }}>
      {/* Header */}
      <header className="sf-header">
        <Link href={`/${shopSlug}/products`} className="sf-back-link">
          <ArrowLeft size={20} /> Back to Shop
        </Link>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6) var(--space-5)' }}>
        {/* Product layout */}
        <div className="product-detail-layout">
          {/* Image */}
          <div style={{
            aspectRatio: '3/4', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            background: 'var(--sf-surface)', position: 'relative',
          }}>
            {product.images?.[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 500px" style={{ objectFit: 'cover' }} priority />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sf-text-tertiary)' }}><ShoppingBag size={80} /></div>
            )}
          </div>

          {/* Product info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {product.categories && (
              <span style={{
                fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--sf-text-secondary)',
              }}>{(product.categories as any).name}</span>
            )}
            <h1 className="sf-heading" style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              {product.name}
            </h1>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span className="sf-price" style={{ fontSize: 'var(--text-3xl)' }}>₹{Number(product.selling_price).toLocaleString('en-IN')}</span>
              {disc > 0 && (
                <>
                  <span className="sf-price-strike" style={{ fontSize: 'var(--text-lg)' }}>₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                  <span className="sf-discount-pill">{disc}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sf-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {product.description}
              </p>
            )}

            {/* Size / variant selector */}
            {variants.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sf-text-secondary)' }}>Size</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--sf-text-secondary)' }}>
                    <Ruler size={13} /> Size Guide
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {variants.map((v) => (
                    <div key={v.id} className={`sf-size-swatch ${v.is_active ? '' : 'unavailable'}`}>{v.name}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <AddToCartButton product={product} shopSlug={shopSlug} primaryColor={pc} disabled={!inStock} />

            {/* Stock */}
            {stock !== null && !inStock && (
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-danger-400)' }}>Out of Stock</p>
            )}

            {/* Trust signals */}
            <div className="sf-trust-row">
              {[
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: 'Easy Returns' },
                { icon: Shield, label: 'Secure Payment' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="sf-trust-item">
                  <Icon size={18} />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h2 className="sf-heading" style={{ fontSize: 'var(--text-lg)' }}>Customer Reviews</h2>
                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--sf-border)', color: 'var(--sf-text-primary)' }}>
                  Write a Review
                </button>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sf-text-secondary)' }}>
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {(related?.length ?? 0) > 0 && (
          <section style={{ marginTop: 'var(--space-12)' }}>
            <h2 className="sf-heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>You May Also Like</h2>
            <div className="sf-product-grid" style={{ padding: 0 }}>
              {related!.map((r) => {
                const rDisc = Number(r.mrp) > Number(r.selling_price) ? Math.round((1 - Number(r.selling_price) / Number(r.mrp)) * 100) : 0
                return (
                  <Link key={r.id} href={`/${shopSlug}/products/${r.slug}`} className="sf-product-card">
                    <div className="sf-product-image-wrap">
                      {r.images?.[0] ? <Image src={r.images[0]} alt={r.name} fill sizes="(max-width: 768px) 50vw, 200px" style={{ objectFit: 'cover' }} /> :
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sf-text-tertiary)' }}><ShoppingBag size={32} /></div>}
                      {rDisc > 0 && <div className="sf-badge-discount">-{rDisc}%</div>}
                    </div>
                    <p className="sf-product-title">{r.name}</p>
                    <div className="sf-price-row">
                      <span className="sf-price">₹{Number(r.selling_price).toLocaleString('en-IN')}</span>
                      {rDisc > 0 && <span className="sf-price-strike">₹{Number(r.mrp).toLocaleString('en-IN')}</span>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="sf-sticky-bottom-bar">
        <button className="sf-icon-btn" aria-label="Add to wishlist"><Heart size={18} /></button>
        <div style={{ flex: 1 }}>
          <AddToCartButton product={product} shopSlug={shopSlug} primaryColor={pc} disabled={!inStock} />
        </div>
      </div>
    </div>
  )
}

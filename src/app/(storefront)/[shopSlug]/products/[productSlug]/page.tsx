import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw, Star } from 'lucide-react'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'
import ProductPurchaseControls from '@/components/storefront/ProductPurchaseControls'
import ProductImageGallery from '@/components/storefront/ProductImageGallery'
import RecentlyViewedTracker from '@/components/storefront/RecentlyViewedTracker'
import ReviewForm from '@/components/storefront/ReviewForm'
import { getWishlistedProductIds } from '../../wishlist-actions'
import { calculateDiscount } from '@/lib/storefront/pricing'
import { formatDistanceToNow } from 'date-fns'

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

  const disc = calculateDiscount(Number(product.mrp), Number(product.selling_price))
  const stock = product.inventory?.[0]?.quantity ?? null
  // If track_inventory is false, always treat as in stock (unlimited supply)
  const inStock = !product.track_inventory || stock === null || stock > 0
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

  const wishlistedIds = await getWishlistedProductIds(shopSlug)
  const isWishlisted = wishlistedIds.has(product.id)

  // Service client: reviewer name is intentionally public alongside a published
  // review, but the anon client's RLS on `customers` only allows reading your
  // own row — this join needs to surface other shoppers' display names too.
  const supabaseService = await createServiceClient()
  const { data: reviews } = await supabaseService
    .from('product_reviews')
    .select('id, rating, title, body, created_at, customers(name)')
    .eq('product_id', product.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '96px' }}>
      <RecentlyViewedTracker shopSlug={shopSlug} productSlug={productSlug} />

      {/* Header */}
      <header className="sf-header">
        <Link href={`/${shopSlug}/products`} className="sf-back-link">
          <ArrowLeft size={20} /> Back to Shop
        </Link>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6) var(--space-5)' }}>
        {/* Product layout */}
        <div className="product-detail-layout">
          {/* Image gallery */}
          <ProductImageGallery
            images={product.images ?? []}
            productName={product.name}
            shopSlug={shopSlug}
            productId={product.id}
            initialWishlisted={isWishlisted}
          />

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

            {/* Size selector + Quantity + Add to cart (shared state, incl. sticky bar) */}
            <ProductPurchaseControls
              product={product}
              shopSlug={shopSlug}
              primaryColor={pc}
              outOfStock={!inStock}
              variants={variants}
              initialWishlisted={isWishlisted}
            />

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
                <ReviewForm shopSlug={shopSlug} productId={product.id} />
              </div>
              {!reviews?.length ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sf-text-secondary)' }}>
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {reviews.map((r) => {
                    const reviewer = Array.isArray(r.customers) ? r.customers[0]?.name : (r.customers as any)?.name
                    return (
                      <div key={r.id} style={{ paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--sf-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <div style={{ display: 'flex' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={14} fill={i < r.rating ? 'var(--color-warning-400)' : 'none'} color="var(--color-warning-400)" />
                            ))}
                          </div>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{reviewer ?? 'Verified Buyer'}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--sf-text-tertiary)' }}>
                            · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {r.title && <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{r.title}</p>}
                        {r.body && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sf-text-secondary)' }}>{r.body}</p>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {(related?.length ?? 0) > 0 && (
          <section style={{ marginTop: 'var(--space-12)' }}>
            <h2 className="sf-heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)' }}>You May Also Like</h2>
            <div className="sf-product-grid" style={{ padding: 0 }}>
              {related!.map((r) => {
                const rDisc = calculateDiscount(Number(r.mrp), Number(r.selling_price))
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
    </div>
  )
}

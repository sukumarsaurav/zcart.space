import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'
import WishlistButton from '@/components/storefront/WishlistButton'
import { getWishlistedProductIds } from '../wishlist-actions'
import SortFilterBar from '@/components/storefront/SortFilterBar'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { data: shop } = await supabase.from('shops').select('name').eq('slug', shopSlug).single()
  return { title: `Products | ${shop?.name ?? 'Shop'}` }
}

export default async function StorefrontProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ category?: string; q?: string; sort?: string; sale?: string; minPrice?: string; maxPrice?: string }>
}) {
  const supabase = await createClient()
  const { shopSlug } = await params
  const sp = await searchParams

  const { data: shop } = await supabase.from('shops').select('id, name, slug, theme').eq('slug', shopSlug).eq('is_active', true).single()
  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const pc = theme.primary_color ?? '#6366f1'

  // Fetch categories for filter (includes subcategories, for resolving deep links
  // like ?category=mens-fashion-t-shirts) — the chip row below only renders top-level ones.
  const { data: categories } = await supabase
    .from('categories').select('id, name, slug, image_url, parent_id').eq('shop_id', shop.id).eq('is_active', true).order('sort_order')
  const topLevelCategories = (categories ?? []).filter((c) => !c.parent_id)

  // Build product query
  let query = supabase
    .from('products')
    .select('id, name, slug, images, selling_price, mrp, category_id, categories(name, slug)')
    .eq('shop_id', shop.id)
    .eq('status', 'active')

  let categoryName = sp.sale === 'true' ? 'Sale & Deals' : 'All Products'
  if (sp.category) {
    const matchCat = categories?.find((c) => c.slug === sp.category)
    if (matchCat) {
      query = query.eq('category_id', matchCat.id)
      categoryName = matchCat.name
    }
  }
  if (sp.q) {
    query = query.ilike('name', `%${sp.q}%`)
    categoryName = `Search: ${sp.q}`
  }
  if (sp.minPrice) query = query.gte('selling_price', Number(sp.minPrice))
  if (sp.maxPrice) query = query.lte('selling_price', Number(sp.maxPrice))

  const sortMap: Record<string, [string, { ascending: boolean }]> = {
    newest: ['created_at', { ascending: false }],
    price_low: ['selling_price', { ascending: true }],
    price_high: ['selling_price', { ascending: false }],
    name: ['name', { ascending: true }],
  }
  const [sortCol, sortDir] = sortMap[sp.sort ?? 'newest'] ?? sortMap.newest
  query = query.order(sortCol, sortDir).limit(60)

  const { data: products } = await query
  const discount = (mrp: number, price: number) => mrp > price ? Math.round((1 - price / mrp) * 100) : 0
  const wishlistedIds = await getWishlistedProductIds(shopSlug)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '90px' /* space for bottom bar */ }}>
      {/* Header */}
      <header className="sf-header" style={{ justifyContent: 'space-between' }}>
        <Link href={`/${shopSlug}`} className="sf-back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="sf-heading" style={{ fontSize: '18px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {categoryName}
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--sf-text-secondary)' }}>
          {products?.length ?? 0} items
        </div>
      </header>

      {/* Category chip row (top-level only) */}
      {topLevelCategories.length > 0 && (
        <div className="sf-chip-row">
          <Link href={`/${shopSlug}/products`} className={`sf-chip ${!sp.category ? 'active' : ''}`}>
            <div className="sf-chip-avatar">
              <span style={{ fontSize: '13px', fontWeight: 600 }}>All</span>
            </div>
            <p className="sf-chip-label">All</p>
          </Link>

          {topLevelCategories.map((cat) => (
            <Link key={cat.id} href={`/${shopSlug}/products?category=${cat.slug}`} className={`sf-chip ${sp.category === cat.slug ? 'active' : ''}`}>
              <div className="sf-chip-avatar" style={{ position: 'relative' }}>
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                ) : (
                  <ShoppingBag size={20} color={sp.category === cat.slug ? 'var(--sf-accent)' : 'var(--sf-text-tertiary)'} />
                )}
              </div>
              <p className="sf-chip-label">{cat.name}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!products?.length ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--sf-text-tertiary)' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No products found</p>
          <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="sf-product-grid">
          {products.map((product) => {
            const disc = discount(Number(product.mrp), Number(product.selling_price))
            return (
              <Link key={product.id} href={`/${shopSlug}/products/${product.slug}`} className="sf-product-card">
                <div className="sf-product-image-wrap">
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 250px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sf-text-tertiary)' }}>
                      <ShoppingBag size={32} />
                    </div>
                  )}
                  {disc > 0 && <div className="sf-badge-discount">-{disc}%</div>}
                  <WishlistButton shopSlug={shopSlug} productId={product.id} initialWishlisted={wishlistedIds.has(product.id)} />
                </div>
                <p className="sf-product-title">{product.name}</p>
                <div className="sf-price-row">
                  <span className="sf-price">₹{Number(product.selling_price).toLocaleString('en-IN')}</span>
                  {disc > 0 && <span className="sf-price-strike">₹{Number(product.mrp).toLocaleString('en-IN')}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sticky Bottom Bar for Sort & Filter */}
      <SortFilterBar />

    </div>
  )
}

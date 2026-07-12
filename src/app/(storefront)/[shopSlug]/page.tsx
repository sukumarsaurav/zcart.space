import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Bell, Heart, ChevronRight, ArrowRight, User, Timer } from 'lucide-react'
import DealCountdown from '@/components/storefront/DealCountdown'
import ProductCard, { type ProductCardData } from '@/components/storefront/ProductCard'
import RecentlyViewedSection from '@/components/storefront/RecentlyViewedSection'
import HeaderSearch from '@/components/storefront/HeaderSearch'
import { getWishlistedProductIds } from './wishlist-actions'
import { calculateDiscount } from '@/lib/storefront/pricing'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { data: shop } = await supabase.from('shops').select('name').eq('slug', shopSlug).single()
  return {
    title: shop?.name ?? 'Shop',
    description: `Welcome to ${shop?.name}. Browse and shop our products online.`,
  }
}

export default async function StorefrontHomePage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const supabase = await createClient()
  const { shopSlug } = await params

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, logo_url, banner_url, phone, email, is_active')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .single()

  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const pc = theme.primary_color ?? '#6366f1'

  // Fetch top-level categories, all products, and this visitor's wishlist
  const [{ data: categories }, { data: allProducts }, wishlistedIds] = await Promise.all([
    supabase.from('categories').select('id, name, slug, image_url').eq('shop_id', shop.id).eq('is_active', true).is('parent_id', null).order('sort_order').limit(10),
    supabase.from('products').select('id, name, slug, images, selling_price, mrp, metadata, is_featured, category_id').eq('shop_id', shop.id).eq('status', 'active'),
    getWishlistedProductIds(shopSlug),
  ])

  const productsList = allProducts || []

  // Find Deal of the Day
  const now = new Date()
  let dealOfTheDay = null
  for (const p of productsList) {
    if (p.metadata?.is_deal_of_the_day) {
      if (!p.metadata.deal_end_time || new Date(p.metadata.deal_end_time) > now) {
        dealOfTheDay = p
        break
      }
    }
  }

  const featured = productsList.filter(p => p.is_featured).slice(0, 6)
  const products = featured.length > 0 ? featured : productsList.slice(0, 6)
  const discount = calculateDiscount

  // Trending Now: top 3 featured products, ranked
  const trending = products.slice(0, 3)

  // One horizontal row of products per top-level category
  const productsByCategory = new Map<string, ProductCardData[]>()
  for (const p of productsList) {
    if (!p.category_id) continue
    const list = productsByCategory.get(p.category_id) ?? []
    list.push(p)
    productsByCategory.set(p.category_id, list)
  }
  const categoryRows = (categories ?? [])
    .map((cat) => ({ category: cat, products: (productsByCategory.get(cat.id) ?? []).slice(0, 8) }))
    .filter((row) => row.products.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      {/* Desktop Header */}
      <header className="desktop-only" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '16px 24px',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        }}>
          {/* Logo Left */}
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt={shop.name} width={40} height={40} style={{ borderRadius: '8px', objectFit: 'cover' }} priority />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: pc, fontSize: '20px' }}>
                {shop.name.charAt(0)}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px' }}>{shop.name.toUpperCase()}</span>
          </Link>
          
          {/* Links Center */}
          <nav style={{ display: 'flex', gap: '32px', fontWeight: 600, fontSize: '13px', letterSpacing: '1px' }}>
            <Link href={`/${shopSlug}/products`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>NEW ARRIVALS</Link>
            <Link href={`/${shopSlug}/categories`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>CATEGORIES</Link>
            <Link href={`/${shopSlug}/sale`} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>SALE</Link>
          </nav>

          {/* Icon Cluster Right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '20px', color: 'var(--text-secondary)', position: 'relative' }}>
            <HeaderSearch shopSlug={shopSlug} />
            <Link href={`/${shopSlug}/wishlist`} aria-label="Wishlist"><Heart size={20} /></Link>
            <Link href={`/user/profile`} aria-label="Profile"><User size={20} /></Link>
            <Link href={`/${shopSlug}/cart`} aria-label="Cart"><ShoppingBag size={20} /></Link>
          </div>
        </div>
      </header>

      {/* App-like Mobile Header */}
      <header className="mobile-only" style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo Left */}
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt={shop.name} width={32} height={32} style={{ borderRadius: '6px', objectFit: 'cover' }} priority />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '6px', background: 'var(--surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: pc, fontSize: '18px' }}>
                {shop.name.charAt(0)}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>{shop.name.toUpperCase()}</span>
          </Link>
          
          {/* Icon Cluster Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', position: 'relative' }}>
            <HeaderSearch shopSlug={shopSlug} />
            <button aria-label="Notifications"><Bell size={20} /></button>
            <Link href={`/${shopSlug}/wishlist`} aria-label="Wishlist"><Heart size={20} /></Link>
            <Link href={`/${shopSlug}/cart`} aria-label="Cart"><ShoppingBag size={20} /></Link>
          </div>
        </div>
      </header>

      {/* Desktop Hero Banner */}
      <section className="desktop-only" style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)', marginBottom: '40px' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px',
        }}>
          <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>NEW COLLECTION 2024</div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', fontFamily: 'var(--shop-font)' }}>
              Timeless Elegance
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '400px', lineHeight: 1.6 }}>
              Discover our carefully curated collection of premium products, designed for those who appreciate quality and sophistication.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link href={`/${shopSlug}/products`} className="btn btn-primary btn-lg" style={{ background: pc, padding: '12px 32px', borderRadius: '4px' }}>
                SHOP NOW
              </Link>
              <Link href={`/${shopSlug}/categories`} className="btn btn-secondary btn-lg" style={{ padding: '12px 32px', borderRadius: '4px' }}>
                VIEW COLLECTIONS
              </Link>
            </div>
          </div>
          <div style={{ position: 'relative', borderLeft: '1px solid var(--surface-border)' }}>
            {shop.banner_url ? (
              <Image
                src={shop.banner_url}
                alt="Hero Banner"
                fill
                sizes="(max-width: 1200px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${pc}44, ${pc}11)` }} />
            )}
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 0' }}>
        {/* Promotional Hero Banner (Mobile) */}
        <section className="mobile-only" style={{ padding: '0 16px', marginBottom: '24px' }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: '20px',
            padding: '32px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            minHeight: '160px',
            justifyContent: 'center'
          }}>
            {shop.banner_url ? (
              <>
                <Image
                  src={shop.banner_url}
                  alt="Promo Banner"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: 'cover', zIndex: 0 }}
                  priority
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2))',
                  zIndex: 1
                }} />
              </>
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${pc}44, ${pc}11)`,
                zIndex: 0
              }} />
            )}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                FLAT 50% OFF
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '16px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                On All Trending Collections
              </p>
              <Link href={`/${shopSlug}/products`} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '13px', fontWeight: 600,
                padding: '8px 16px', borderRadius: '999px',
                display: 'inline-flex', alignItems: 'center', gap: '6px'
              }}>
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Deal of the Day */}
        {dealOfTheDay && dealOfTheDay.metadata?.deal_end_time && (
          <section style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--surface-border)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <div style={{ 
                background: `linear-gradient(135deg, ${pc}22, transparent)`,
                padding: '16px',
                borderBottom: '1px solid var(--surface-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: pc, fontWeight: 700 }}>
                  <Timer size={18} />
                  <span>DEAL OF THE DAY</span>
                </div>
                <DealCountdown targetDate={dealOfTheDay.metadata.deal_end_time} />
              </div>
              
              <Link href={`/${shopSlug}/products/${dealOfTheDay.slug}`} style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', color: 'inherit', textDecoration: 'none' }}>
                <div style={{ width: 100, height: 100, borderRadius: '8px', background: 'var(--surface-bg)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {dealOfTheDay.images?.[0] ? (
                    <Image src={dealOfTheDay.images[0]} alt={dealOfTheDay.name} fill sizes="100px" style={{ objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {dealOfTheDay.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: pc }}>₹{dealOfTheDay.selling_price}</span>
                    {dealOfTheDay.mrp > dealOfTheDay.selling_price && (
                      <>
                        <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>₹{dealOfTheDay.mrp}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success-500)', background: 'var(--color-success-50)', padding: '2px 6px', borderRadius: '4px' }}>
                          {discount(dealOfTheDay.mrp, dealOfTheDay.selling_price)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Trending Now (Horizontal Scroll, ranked) */}
        {trending.length > 0 && (
          <section style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📈 Trending Now
              </h2>
              <Link href={`/${shopSlug}/products`} style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                See all <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{
              display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
            }} className="no-scrollbar">
              {trending.map((product, i) => (
                <ProductCard key={product.id} shopSlug={shopSlug} product={product} wishlisted={wishlistedIds.has(product.id)} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Categories (Horizontal Scroll) */}
        {(categories?.length ?? 0) > 0 && (
          <section id="categories" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Categories</h2>
              <Link href={`/${shopSlug}/products`} style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>See all</Link>
            </div>
            
            {/* Scrollable container hiding scrollbars */}
            <div style={{ 
              display: 'flex', gap: '16px', padding: '0 16px',
              overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', msOverflowStyle: 'none'
            }} className="no-scrollbar">
              <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
              {categories!.map((cat) => (
                <Link key={cat.id} href={`/${shopSlug}/products?category=${cat.slug}`} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  minWidth: '72px', scrollSnapAlign: 'start'
                }}>
                  <div style={{ 
                    width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                    background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={24} color="var(--text-tertiary)" />
                    )}
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Flash Sale / Featured Grid */}
        <section style={{ padding: '0 16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ⚡ Flash Sale
            </h2>
            <Link href={`/${shopSlug}/products`} style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="responsive-product-grid">
            {products?.map((product) => (
              <ProductCard key={product.id} shopSlug={shopSlug} product={product} wishlisted={wishlistedIds.has(product.id)} minWidth={0} />
            ))}
          </div>
        </section>

        {/* Recently Viewed (client-driven, localStorage) */}
        <RecentlyViewedSection shopSlug={shopSlug} wishlistedIds={Array.from(wishlistedIds)} />

        {/* One horizontal row per top-level category */}
        {categoryRows.map(({ category, products: catProducts }) => (
          <section key={category.id} style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{category.name}</h2>
              <Link href={`/${shopSlug}/products?category=${category.slug}`} style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                See All <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{
              display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
            }} className="no-scrollbar">
              {catProducts.map((product) => (
                <ProductCard key={product.id} shopSlug={shopSlug} product={product} wishlisted={wishlistedIds.has(product.id)} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, ArrowUpDown, SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'
import type { ShopTheme } from '@/types/database'

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
  searchParams: Promise<{ category?: string; q?: string; sort?: string; sale?: string }>
}) {
  const supabase = await createClient()
  const { shopSlug } = await params
  const sp = await searchParams

  const { data: shop } = await supabase.from('shops').select('id, name, slug, theme').eq('slug', shopSlug).eq('is_active', true).single()
  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const pc = theme.primary_color ?? '#6366f1'

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories').select('id, name, slug, image_url').eq('shop_id', shop.id).eq('is_active', true).order('sort_order')

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', paddingBottom: '70px' /* space for bottom bar */ }}>
      {/* Native App-style Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{ 
          maxWidth: 1200, margin: '0 auto', padding: '12px 16px', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
        }}>
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '16px', fontWeight: 600, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {categoryName}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {products?.length ?? 0} items
          </div>
        </div>
      </header>

      {/* Horizontal Category Scroller (Mobile-style) */}
      {(categories?.length ?? 0) > 0 && (
        <div style={{ 
          background: 'var(--surface-card)', 
          borderBottom: '1px solid var(--surface-border)',
          padding: '16px 0', marginBottom: '16px' 
        }}>
          <div style={{ 
            display: 'flex', gap: '16px', padding: '0 16px',
            overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }} className="no-scrollbar">
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            
            {/* "All" button */}
            <Link href={`/${shopSlug}/products`} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              minWidth: '64px', scrollSnapAlign: 'start'
            }}>
              <div style={{ 
                width: 64, height: 64, borderRadius: '50%', 
                background: !sp.category ? pc : 'var(--surface-elevated)', 
                border: `2px solid ${!sp.category ? pc : 'var(--surface-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: !sp.category ? '#fff' : 'var(--text-primary)',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>All</span>
              </div>
              <p style={{ fontSize: '12px', fontWeight: !sp.category ? 700 : 500, color: !sp.category ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                All
              </p>
            </Link>

            {/* Categories */}
            {categories!.map((cat) => (
              <Link key={cat.id} href={`/${shopSlug}/products?category=${cat.slug}`} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                minWidth: '64px', scrollSnapAlign: 'start'
              }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  background: 'var(--surface-elevated)', 
                  border: `2px solid ${sp.category === cat.slug ? pc : 'var(--surface-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}>
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} fill sizes="64px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <ShoppingBag size={20} color={sp.category === cat.slug ? pc : 'var(--text-tertiary)'} />
                  )}
                </div>
                <p style={{ fontSize: '12px', fontWeight: sp.category === cat.slug ? 700 : 500, color: sp.category === cat.slug ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        
        {/* Product Grid - Strict 2 Column on Mobile */}
        {!products?.length ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-tertiary)' }}>
            <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No products found</p>
            <p style={{ fontSize: '14px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', // Strict 2 col on mobile
            gap: '12px',
          }}>
            {products.map((product) => {
              const disc = discount(Number(product.mrp), Number(product.selling_price))
              return (
                <Link key={product.id} href={`/${shopSlug}/products/${product.slug}`} style={{
                  background: 'var(--surface-card)', borderRadius: '16px', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column'
                }}>
                  {/* Image container */}
                  <div style={{ aspectRatio: '3/4', background: 'var(--surface-elevated)', position: 'relative', overflow: 'hidden' }}>
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 250px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                        <ShoppingBag size={32} />
                      </div>
                    )}
                    
                    {/* Discount Badge */}
                    {disc > 0 && (
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        color: '#fff', fontSize: '11px', fontWeight: 600,
                        padding: '4px 8px', borderRadius: '8px',
                      }}>
                        -{disc}%
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{Number(product.selling_price).toLocaleString('en-IN')}
                      </span>
                      {disc > 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                          ₹{Number(product.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar for Sort & Filter */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(24,24,27,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--surface-border)',
        display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        <button style={{ 
          flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500, borderRight: '1px solid var(--surface-border)',
          background: 'transparent', borderTop: 'none', borderBottom: 'none', borderLeft: 'none'
        }}>
          <ArrowUpDown size={16} /> Sort
        </button>
        <button style={{ 
          flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
          background: 'transparent', border: 'none'
        }}>
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>

    </div>
  )
}

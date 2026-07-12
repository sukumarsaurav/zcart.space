import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flame, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import DealCountdown from '@/components/storefront/DealCountdown'
import { calculateDiscount } from '@/lib/storefront/pricing'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { data: shop } = await supabase.from('shops').select('name').eq('slug', shopSlug).single()
  return {
    title: `Sale & Deals | ${shop?.name ?? 'Shop'}`,
    description: `Shop the latest deals and discounts at ${shop?.name}.`,
  }
}

export default async function SalePage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const supabase = await createClient()
  const { shopSlug } = await params

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, is_active')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .single()

  if (!shop) notFound()

  // Fetch all discounted products (where MRP > selling_price)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, images, selling_price, mrp, metadata, category:categories(name)')
    .eq('shop_id', shop.id)
    .eq('status', 'active')

  const discountedProducts = (products || []).filter(p => Number(p.mrp) > Number(p.selling_price))

  // A real countdown only makes sense against a real end time — reuse the same
  // is_deal_of_the_day / deal_end_time metadata the home page's Deal of the
  // Day section uses, rather than a fabricated end-of-day timer.
  const now = new Date()
  const dealEndTime = discountedProducts.find((p) => {
    const meta = p.metadata as { is_deal_of_the_day?: boolean; deal_end_time?: string } | null
    return meta?.is_deal_of_the_day && (!meta.deal_end_time || new Date(meta.deal_end_time) > now)
  })?.metadata as { deal_end_time?: string } | undefined

  // Sort by highest discount percentage
  discountedProducts.sort((a, b) => {
    const discA = (Number(a.mrp) - Number(a.selling_price)) / Number(a.mrp)
    const discB = (Number(b.mrp) - Number(b.selling_price)) / Number(b.mrp)
    return discB - discA
  })

  const dealOfTheDay = discountedProducts.length > 0 ? discountedProducts[0] : null
  const remainingSaleItems = discountedProducts.slice(1)
  const otherSaleItems = remainingSaleItems.slice(0, 12)
  const hasMoreSaleItems = remainingSaleItems.length > 12

  const getDiscountPercent = calculateDiscount

  return (
    <div data-storefront-theme="dark-gold" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Header */}
      <header className="sf-header">
        <Link href={`/${shopSlug}`} className="sf-back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="sf-heading" style={{ fontSize: 'var(--text-lg)', flex: 1 }}>
          Sale &amp; Deals
        </h1>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>

        {!dealOfTheDay ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sf-text-tertiary)' }}>
            <Tag size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: 500 }}>No deals currently available</p>
            <p style={{ fontSize: '14px', marginTop: 8 }}>Check back later for exciting offers!</p>
          </div>
        ) : (
          <>
            {/* Deal of the Day Section */}
            <section style={{ marginBottom: '40px' }}>
              <h2 className="sf-heading" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Flame size={20} color="var(--sf-accent)" /> Deal of the Day
              </h2>

              <Link href={`/${shopSlug}/products/${dealOfTheDay.slug}`} style={{ display: 'block' }}>
                <div className="sf-deal-card">
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
                    {dealOfTheDay.images?.[0] ? (
                      <Image src={dealOfTheDay.images[0]} alt={dealOfTheDay.name} fill sizes="(max-width: 600px) 100vw, 600px" style={{ objectFit: 'cover' }} priority />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sf-surface-raised)' }}>
                        <Tag size={48} color="var(--sf-text-tertiary)" />
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px' }}>
                    <div className="sf-discount-pill" style={{ marginBottom: '10px' }}>
                      {getDiscountPercent(Number(dealOfTheDay.mrp), Number(dealOfTheDay.selling_price))}% OFF
                    </div>
                    <h3 className="sf-heading" style={{ fontSize: '20px', marginBottom: '4px' }}>
                      {dealOfTheDay.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--sf-text-secondary)', marginBottom: '16px' }}>
                      {(dealOfTheDay.category as any)?.name ?? 'Featured Item'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span className="sf-price" style={{ fontSize: '24px' }}>
                          ₹{Number(dealOfTheDay.selling_price).toLocaleString('en-IN')}
                        </span>
                        <span className="sf-price-strike">
                          ₹{Number(dealOfTheDay.mrp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {dealEndTime?.deal_end_time && <DealCountdown targetDate={dealEndTime.deal_end_time} isDark />}
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* On Sale Grid */}
            {otherSaleItems.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 className="sf-heading" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={18} color="var(--sf-text-secondary)" /> On Sale
                  </h2>
                  {hasMoreSaleItems && (
                    <Link href={`/${shopSlug}/products?sale=true`} style={{ fontSize: '14px', color: 'var(--sf-text-secondary)' }}>
                      View all
                    </Link>
                  )}
                </div>

                <div className="sf-product-grid" style={{ padding: 0 }}>
                  {otherSaleItems.map(product => {
                    const disc = getDiscountPercent(Number(product.mrp), Number(product.selling_price))
                    return (
                      <Link key={product.id} href={`/${shopSlug}/products/${product.slug}`} className="sf-product-card">
                        <div className="sf-product-image-wrap">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 600px) 50vw, 280px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Tag size={24} color="var(--sf-text-tertiary)" />
                            </div>
                          )}
                          <div className="sf-badge-discount">-{disc}%</div>
                        </div>

                        <p className="sf-product-title">{product.name}</p>
                        <div className="sf-price-row">
                          <span className="sf-price">₹{Number(product.selling_price).toLocaleString('en-IN')}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

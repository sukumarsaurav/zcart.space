import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flame, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import SaleCountdown from './SaleCountdown'

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
    .select('id, name, slug, images, selling_price, mrp, category:categories(name)')
    .eq('shop_id', shop.id)
    .eq('status', 'active')
  
  const discountedProducts = (products || []).filter(p => Number(p.mrp) > Number(p.selling_price))

  // Sort by highest discount percentage
  discountedProducts.sort((a, b) => {
    const discA = (Number(a.mrp) - Number(a.selling_price)) / Number(a.mrp)
    const discB = (Number(b.mrp) - Number(b.selling_price)) / Number(b.mrp)
    return discB - discA
  })

  const dealOfTheDay = discountedProducts.length > 0 ? discountedProducts[0] : null
  const otherSaleItems = discountedProducts.slice(1)

  const getDiscountPercent = (mrp: number, price: number) => {
    return Math.round((1 - price / mrp) * 100)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#171717', color: '#fff', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#171717',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <Link href={`/${shopSlug}`} className="btn btn-ghost btn-icon" style={{ color: '#fff' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>
            Sale & Deals
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        
        {!dealOfTheDay ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
            <Tag size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', fontWeight: 500 }}>No deals currently available</p>
            <p style={{ fontSize: '14px', marginTop: 8 }}>Check back later for exciting offers!</p>
          </div>
        ) : (
          <>
            {/* Deal of the Day Section */}
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#fff' }}>
                <Flame size={20} color="#ef4444" /> Deal of the Day
              </h2>
              
              <Link href={`/${shopSlug}/products/${dealOfTheDay.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{
                  background: '#222',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #333'
                }}>
                  {/* Image */}
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative' }}>
                    {dealOfTheDay.images?.[0] ? (
                      <Image src={dealOfTheDay.images[0]} alt={dealOfTheDay.name} fill sizes="(max-width: 600px) 100vw, 600px" style={{ objectFit: 'cover' }} priority />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
                        <Tag size={48} color="#666" />
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
                      {getDiscountPercent(Number(dealOfTheDay.mrp), Number(dealOfTheDay.selling_price))}% OFF
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {dealOfTheDay.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                      {(dealOfTheDay.category as any)?.name ?? 'Featured Item'}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                          ₹{Number(dealOfTheDay.selling_price).toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666', textDecoration: 'line-through' }}>
                          ₹{Number(dealOfTheDay.mrp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <SaleCountdown />
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* On Sale Grid */}
            {otherSaleItems.length > 0 && (
              <section>
                <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#fff' }}>
                  <Tag size={18} color="#a3a3a3" /> On Sale
                </h2>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}>
                  {otherSaleItems.map(product => {
                    const disc = getDiscountPercent(Number(product.mrp), Number(product.selling_price))
                    return (
                      <Link key={product.id} href={`/${shopSlug}/products/${product.slug}`} style={{
                        background: '#222', borderRadius: '12px', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', border: '1px solid #333'
                      }}>
                        <div style={{ aspectRatio: '1/1', position: 'relative', background: '#2a2a2a' }}>
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 600px) 50vw, 280px" style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Tag size={24} color="#555" />
                            </div>
                          )}
                          
                          <div style={{
                            position: 'absolute', top: '8px', left: '8px',
                            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                            color: '#fff', fontSize: '11px', fontWeight: 700,
                            padding: '4px 8px', borderRadius: '8px',
                          }}>
                            -{disc}%
                          </div>
                        </div>
                        
                        <div style={{ padding: '12px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, color: '#e5e5e5', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {product.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                              ₹{Number(product.selling_price).toLocaleString('en-IN')}
                            </span>
                          </div>
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

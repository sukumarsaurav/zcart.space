import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'
import type { Metadata } from 'next'
import ProductCard from '@/components/storefront/ProductCard'
import { getWishlistedProductIds } from '../wishlist-actions'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const { shopSlug } = await params
  return { title: `Wishlist | ${shopSlug}` }
}

export default async function WishlistPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const supabase = await createClient()
  const { shopSlug } = await params

  const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).eq('is_active', true).single()
  if (!shop) notFound()

  const wishlistedIds = await getWishlistedProductIds(shopSlug)

  const { data: products } = wishlistedIds.size > 0
    ? await supabase
        .from('products')
        .select('id, name, slug, images, mrp, selling_price')
        .eq('shop_id', shop.id)
        .eq('status', 'active')
        .in('id', Array.from(wishlistedIds))
    : { data: [] }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '48px' }}>
      <header className="sf-header">
        <Link href={`/${shopSlug}`} className="sf-back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="sf-heading" style={{ fontSize: 'var(--text-lg)', flex: 1 }}>My Wishlist</h1>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-6) var(--space-5)' }}>
        {!products?.length ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Heart size={28} /></div>
            <p className="empty-state-title">Your wishlist is empty</p>
            <p className="empty-state-description">Tap the heart on any product to save it here.</p>
            <Link href={`/${shopSlug}/products`} className="btn btn-primary">Browse products</Link>
          </div>
        ) : (
          <div className="responsive-product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} shopSlug={shopSlug} product={product} wishlisted minWidth={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

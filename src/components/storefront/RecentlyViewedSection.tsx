'use client'

import { useEffect, useState } from 'react'
import { getProductsBySlugs } from '@/app/(storefront)/[shopSlug]/recently-viewed-actions'
import ProductCard, { type ProductCardData } from './ProductCard'

export default function RecentlyViewedSection({ shopSlug, wishlistedIds }: { shopSlug: string; wishlistedIds: string[] }) {
  const [products, setProducts] = useState<ProductCardData[] | null>(null)

  useEffect(() => {
    const key = `zcart_recently_viewed_${shopSlug}`
    const slugs: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    if (slugs.length === 0) return
    getProductsBySlugs(shopSlug, slugs).then(setProducts)
  }, [shopSlug])

  if (!products || products.length === 0) return null

  const wishlistedSet = new Set(wishlistedIds)

  return (
    <section style={{ padding: '0 16px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Recently Viewed</h2>
      </div>

      <div style={{
        display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
      }} className="no-scrollbar">
        {products.map((product) => (
          <ProductCard key={product.id} shopSlug={shopSlug} product={product} wishlisted={wishlistedSet.has(product.id)} />
        ))}
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import WishlistButton from './WishlistButton'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  shopSlug: string
  productId: string
  initialWishlisted: boolean
}

export default function ProductImageGallery({ images, productName, shopSlug, productId, initialWishlisted }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{
        aspectRatio: '3/4', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        background: 'var(--sf-surface)', position: 'relative',
      }}>
        {activeImage ? (
          <Image key={activeImage} src={activeImage} alt={productName} fill sizes="(max-width: 768px) 100vw, 500px" style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sf-text-tertiary)' }}><ShoppingBag size={80} /></div>
        )}

        <WishlistButton
          shopSlug={shopSlug}
          productId={productId}
          initialWishlisted={initialWishlisted}
          size={18}
          className="sf-wishlist-btn"
          style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}
        />
      </div>

      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              style={{
                width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative',
                border: `2px solid ${i === activeIndex ? 'var(--sf-accent)' : 'var(--sf-border)'}`,
                opacity: i === activeIndex ? 1 : 0.7,
                flexShrink: 0,
              }}
            >
              <Image src={img} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

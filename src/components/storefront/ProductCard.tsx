'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import WishlistButton from './WishlistButton'

export interface ProductCardData {
  id: string
  name: string
  slug: string
  images: string[] | null
  mrp: number
  selling_price: number
}

interface ProductCardProps {
  shopSlug: string
  product: ProductCardData
  wishlisted: boolean
  rank?: number
  minWidth?: number
}

function discount(mrp: number, price: number) {
  return mrp > price ? Math.round((1 - price / mrp) * 100) : 0
}

export default function ProductCard({ shopSlug, product, wishlisted, rank, minWidth = 160 }: ProductCardProps) {
  const disc = discount(Number(product.mrp), Number(product.selling_price))

  return (
    <Link
      href={`/${shopSlug}/products/${product.slug}`}
      style={{
        background: 'var(--surface-card)', borderRadius: '16px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', minWidth, flexShrink: 0, scrollSnapAlign: 'start',
      }}
    >
      <div style={{ aspectRatio: '3/4', background: 'var(--surface-elevated)', position: 'relative', overflow: 'hidden' }}>
        {product.images?.[0] ? (
          <Image src={product.images[0]} alt={product.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
            <ShoppingBag size={32} />
          </div>
        )}

        {rank !== undefined && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', color: '#fff',
            fontSize: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rank}
          </div>
        )}

        {disc > 0 && (
          <div style={{
            position: 'absolute', top: '8px', right: rank !== undefined ? undefined : '8px', left: rank !== undefined ? '38px' : undefined,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            color: '#fff', fontSize: '11px', fontWeight: 600,
            padding: '4px 8px', borderRadius: '8px',
          }}>
            -{disc}%
          </div>
        )}

        <WishlistButton
          shopSlug={shopSlug}
          productId={product.id}
          initialWishlisted={wishlisted}
          size={14}
          className="sf-wishlist-btn"
          style={{ position: 'absolute', top: '8px', right: '8px' }}
        />
      </div>

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
}

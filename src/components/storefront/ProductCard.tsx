import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import WishlistButton from './WishlistButton'
import { calculateDiscount } from '@/lib/storefront/pricing'
import { formatCurrency } from '@/lib/formatters'

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

export default function ProductCard({ shopSlug, product, wishlisted, rank, minWidth = 160 }: ProductCardProps) {
  const disc = calculateDiscount(Number(product.mrp), Number(product.selling_price))

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
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 45vw, (max-width: 1200px) 25vw, 240px"
            style={{ objectFit: 'cover' }}
          />
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
            position: 'absolute', left: '8px', top: rank !== undefined ? '40px' : '8px',
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
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--sf-text-primary, var(--text-primary))', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(product.selling_price)}
          </span>
          {disc > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
              {formatCurrency(product.mrp)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

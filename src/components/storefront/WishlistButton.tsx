'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/app/(storefront)/[shopSlug]/wishlist-actions'

interface WishlistButtonProps {
  shopSlug: string
  productId: string
  initialWishlisted: boolean
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function WishlistButton({ shopSlug, productId, initialWishlisted, size = 16, className, style }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = !wishlisted
    setWishlisted(next) // optimistic

    startTransition(async () => {
      const result = await toggleWishlist(shopSlug, productId)
      if (result.requiresLogin) {
        setWishlisted(!next) // revert
        router.push(`/user/login?redirect=/${shopSlug}`)
        return
      }
      setWishlisted(result.wishlisted)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
      className={className ?? 'sf-wishlist-btn'}
      style={{ ...style, ...(wishlisted ? { color: 'var(--sf-accent)' } : {}) }}
    >
      <Heart size={size} fill={wishlisted ? 'currentColor' : 'none'} />
    </button>
  )
}

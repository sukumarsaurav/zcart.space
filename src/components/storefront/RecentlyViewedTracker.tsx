'use client'

import { useEffect } from 'react'

const MAX_ITEMS = 12

// Records this product view in localStorage so the storefront home page can
// render a "Recently Viewed" row. Guest-only, per-browser — no login or
// server-side tracking involved.
export default function RecentlyViewedTracker({ shopSlug, productSlug }: { shopSlug: string; productSlug: string }) {
  useEffect(() => {
    const key = `zcart_recently_viewed_${shopSlug}`
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? '[]')
    const next = [productSlug, ...existing.filter((s) => s !== productSlug)].slice(0, MAX_ITEMS)
    localStorage.setItem(key, JSON.stringify(next))
  }, [shopSlug, productSlug])

  return null
}

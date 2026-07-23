'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  name: string
  slug: string
  selling_price: number
  images: string[] | null
}

export default function HeaderSearch({ shopSlug }: { shopSlug: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('id').eq('slug', shopSlug).single()
      if (!shop) {
        setLoading(false)
        return
      }

      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug, selling_price, images')
        .eq('shop_id', shop.id)
        .eq('status', 'active')
        .ilike('name', `%${query.trim()}%`)
        .limit(5)

      setResults((products as SearchResult[]) ?? [])
      setLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query, shopSlug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/${shopSlug}/products?q=${encodeURIComponent(query.trim())}`)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  if (!open) {
    return (
      <button
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="touch-target"
        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
      >
        <Search size={20} />
      </button>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-full)', padding: '6px 8px 6px 16px',
          boxShadow: 'var(--shadow-lg)', zIndex: 200, width: 'calc(100vw - 32px)', maxWidth: 320,
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, height: 36 }}
        />
        {loading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />}
        <button
          type="button"
          aria-label="Close search"
          onClick={() => { setOpen(false); setQuery(''); setResults([]) }}
          className="btn btn-ghost btn-icon btn-sm touch-target"
        >
          <X size={16} />
        </button>

        {/* Live results popover */}
        {results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
            background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden', zIndex: 210,
          }}>
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/${shopSlug}/products/${p.slug}`}
                onClick={() => { setOpen(false); setQuery(''); setResults([]) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderBottom: '1px solid var(--surface-border)', textDecoration: 'none',
                  color: 'var(--text-primary)', transition: 'background 0.15s',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 6, overflow: 'hidden', background: 'var(--surface-elevated)', flexShrink: 0, position: 'relative' }}>
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill sizes="36px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><ShoppingBag size={16} /></div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: 'var(--color-primary-400)' }}>₹{p.selling_price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}



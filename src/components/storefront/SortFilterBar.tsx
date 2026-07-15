'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function SortFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openPanel, setOpenPanel] = useState<'sort' | 'filter' | null>(null)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  const currentSort = searchParams.get('sort') ?? 'newest'
  const hasActiveFilter = !!(searchParams.get('minPrice') || searchParams.get('maxPrice'))

  const navigate = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <>
      <div className="sf-sticky-bottom-bar" style={{ padding: 0 }}>
        <button
          onClick={() => setOpenPanel(openPanel === 'sort' ? null : 'sort')}
          style={{
            flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            color: currentSort !== 'newest' ? 'var(--sf-accent)' : 'var(--sf-text-primary)', fontSize: '14px', fontWeight: 500, borderRight: '1px solid var(--sf-border)',
          }}
        >
          <ArrowUpDown size={16} /> Sort
        </button>
        <button
          onClick={() => setOpenPanel(openPanel === 'filter' ? null : 'filter')}
          style={{
            flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            color: hasActiveFilter ? 'var(--sf-accent)' : 'var(--sf-text-primary)', fontSize: '14px', fontWeight: 500,
          }}
        >
          <SlidersHorizontal size={16} /> Filter{hasActiveFilter ? ' (1)' : ''}
        </button>
      </div>

      {openPanel && (
        <div
          onClick={() => setOpenPanel(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--sf-surface-raised, var(--surface-elevated))', width: '100%', borderRadius: '20px 20px 0 0',
              padding: 'var(--space-6)', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--space-6))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{openPanel === 'sort' ? 'Sort by' : 'Filter'}</h3>
              <button onClick={() => setOpenPanel(null)} aria-label="Close"><X size={20} /></button>
            </div>

            {openPanel === 'sort' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { navigate({ sort: opt.value === 'newest' ? null : opt.value }); setOpenPanel(null) }}
                    style={{
                      textAlign: 'left', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                      background: currentSort === opt.value ? 'rgba(15,23,42,0.04)' : 'transparent',
                      color: currentSort === opt.value ? 'var(--sf-accent)' : 'var(--sf-text-primary)',
                      fontWeight: currentSort === opt.value ? 600 : 500,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {openPanel === 'filter' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label style={{ fontSize: 'var(--text-sm)', color: 'var(--sf-text-secondary)', marginBottom: 'var(--space-2)', display: 'block' }}>
                    Price range
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    <input
                      type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                      className="input" style={{ flex: 1 }}
                    />
                    <span style={{ color: 'var(--sf-text-tertiary)' }}>–</span>
                    <input
                      type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                      className="input" style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button
                    onClick={() => { setMinPrice(''); setMaxPrice(''); navigate({ minPrice: null, maxPrice: null }); setOpenPanel(null) }}
                    className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => { navigate({ minPrice: minPrice || null, maxPrice: maxPrice || null }); setOpenPanel(null) }}
                    className="sf-cta-primary" style={{ flex: 1, justifyContent: 'center', padding: 'var(--space-3)', border: 'none' }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

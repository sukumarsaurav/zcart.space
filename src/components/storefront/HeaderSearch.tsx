'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function HeaderSearch({ shopSlug }: { shopSlug: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/${shopSlug}/products?q=${encodeURIComponent(query.trim())}`)
    setOpen(false)
  }

  if (!open) {
    return (
      <button aria-label="Search" onClick={() => setOpen(true)}>
        <Search size={20} />
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: 'absolute', top: '100%', right: 0, marginTop: 8,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-full)', padding: '6px 8px 6px 16px',
        boxShadow: 'var(--shadow-lg)', zIndex: 200, width: 260,
      }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => { if (!query) setOpen(false) }}
        placeholder="Search products…"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
      />
      <button type="button" aria-label="Close search" onClick={() => { setOpen(false); setQuery('') }} className="btn btn-ghost btn-icon btn-sm">
        <X size={14} />
      </button>
    </form>
  )
}

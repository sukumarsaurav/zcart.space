'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X } from 'lucide-react'

export default function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="mkt-nav mkt-nav-bar">
      <div className="mkt-nav-inner">
        <Link href="/" className="mkt-logo">
          <span className="mkt-logo-mark">
            <ShoppingBag size={18} />
          </span>
          <span className="gradient-text">zCart</span>
        </Link>

        <div className="desktop-only mkt-nav-links">
          <Link href="/#features" className="mkt-nav-link">Features</Link>
          <Link href="/pricing" className="mkt-nav-link">Pricing</Link>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get started free</Link>
        </div>

        <button
          className="mobile-only btn btn-ghost btn-icon"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="mobile-only mkt-nav-mobile">
          <Link href="/#features" onClick={() => setOpen(false)} className="mkt-nav-link">Features</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="mkt-nav-link">Pricing</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Sign in</Link>
          <Link href="/signup" onClick={() => setOpen(false)} className="btn btn-primary btn-sm">Get started free</Link>
        </div>
      )}
    </nav>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Store, ShieldCheck } from 'lucide-react'

export default function StickyFloatingCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
        width: '90%',
        maxWidth: '680px',
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--color-primary-500)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Store size={18} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--text-sm)' }}>
            Start your shop on zCart for Free
          </p>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={12} color="var(--color-success-500)" /> No credit card required • Setup in 2 mins
          </p>
        </div>
      </div>

      <Link href="/signup" className="btn btn-primary btn-sm" style={{ gap: '6px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}>
        Create Free Shop <ArrowRight size={14} />
      </Link>
    </div>
  )
}

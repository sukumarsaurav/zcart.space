'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, LayoutDashboard } from 'lucide-react'

interface ModeSwitcherProps {
  compact?: boolean
  style?: React.CSSProperties
}

export default function ModeSwitcher({ compact, style }: ModeSwitcherProps) {
  const pathname = usePathname()
  const isPos = pathname.startsWith('/pos')

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--surface-elevated, #f1f5f9)',
        border: '1px solid var(--surface-border, #e2e8f0)',
        padding: '3px',
        borderRadius: '9999px',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      <Link
        href="/pos"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 10px' : '5px 12px',
          borderRadius: '9999px',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          background: isPos
            ? 'var(--color-primary-500, #6366f1)'
            : 'transparent',
          color: isPos ? '#ffffff' : 'var(--text-secondary, #64748b)',
          boxShadow: isPos ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
        }}
        title="POS Billing Counter"
      >
        <Zap size={compact ? 14 : 15} />
        <span className="mode-switcher-text">POS Counter</span>
      </Link>

      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 10px' : '5px 12px',
          borderRadius: '9999px',
          fontSize: compact ? '12px' : '13px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          background: !isPos
            ? 'var(--color-primary-500, #6366f1)'
            : 'transparent',
          color: !isPos ? '#ffffff' : 'var(--text-secondary, #64748b)',
          boxShadow: !isPos ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
        }}
        title="Admin Panel"
      >
        <LayoutDashboard size={compact ? 14 : 15} />
        <span className="mode-switcher-text">Admin Panel</span>
      </Link>
    </div>
  )
}

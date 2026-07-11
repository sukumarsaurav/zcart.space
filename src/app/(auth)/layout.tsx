import type { Metadata } from 'next'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <nav style={{
        padding: 'var(--space-5) var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }} className="gradient-text">zCart</span>
        </Link>
        <Link href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Back to home
        </Link>
      </nav>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0,
        }}>
          <div style={{
            position: 'absolute', top: '20%', left: '15%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', right: '15%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            borderRadius: '50%', filter: 'blur(40px)',
          }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

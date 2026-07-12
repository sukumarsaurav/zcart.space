'use client'

import { useState } from 'react'
import { Mail, KeyRound, Loader2, ArrowRight, ShoppingBag } from 'lucide-react'
import { signInWithOtp, verifyOtp } from './actions'

interface ShopBranding {
  name: string
  logo_url: string | null
}

export default function UserLoginClient({ shop, redirectTo }: { shop: ShopBranding | null; redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'token'>('email')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    try {
      await signInWithOtp(email)
      setStep('token')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    try {
      await verifyOtp(email, token, redirectTo)
    } catch (err: any) {
      setError(err.message)
      setIsPending(false)
    }
  }

  return (
    <div
      data-storefront-theme={shop ? 'dark-gold' : undefined}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: shop ? 'var(--sf-bg)' : 'var(--surface-sunken)',
        padding: 'var(--space-4)'
      }}
    >
      <div style={{
        background: shop ? 'var(--sf-surface)' : 'var(--surface-elevated)',
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${shop ? 'var(--sf-border)' : 'var(--surface-border)'}`,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          {shop?.logo_url ? (
            <img src={shop.logo_url} alt={shop.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto var(--space-4)' }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)'
            }}>
              {shop ? <ShoppingBag size={22} color="var(--sf-accent)" /> : <KeyRound size={24} color="var(--text-secondary)" />}
            </div>
          )}
          <h1
            className={shop ? 'sf-heading' : undefined}
            style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: shop ? 'var(--sf-text-primary)' : 'var(--text-primary)', marginBottom: 'var(--space-2)' }}
          >
            {shop ? `Sign in to ${shop.name}` : 'Welcome to zCart'}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: shop ? 'var(--sf-text-secondary)' : 'var(--text-tertiary)' }}>
            {step === 'email' ? 'Enter your email to receive a secure login code.' : 'Enter the code sent to your email.'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger-400)', borderRadius: 'var(--radius-lg)',
            fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Email address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 40 }}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || !email}
              className={`btn btn-primary btn-lg ${isPending ? 'btn-loading' : ''}`}
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)', background: shop ? 'var(--sf-accent)' : undefined, color: shop ? 'var(--sf-accent-text)' : undefined }}
            >
              <span className="btn-text">
                {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Send Login Code'}
              </span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="label">Login Code</label>
              <input
                type="text"
                required
                value={token}
                onChange={e => setToken(e.target.value)}
                className="input"
                style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: 'var(--text-lg)' }}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || token.length < 6}
              className={`btn btn-primary btn-lg ${isPending ? 'btn-loading' : ''}`}
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)', background: shop ? 'var(--sf-accent)' : undefined, color: shop ? 'var(--sf-accent-text)' : undefined }}
            >
              <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Login <ArrowRight size={18} /></>}
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setToken(''); setError(null); }}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-sm)' }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

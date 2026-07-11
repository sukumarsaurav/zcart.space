'use client'

import { useState } from 'react'
import { Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react'
import { signInWithOtp, verifyOtp } from './actions'

export default function UserLoginPage() {
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
      await verifyOtp(email, token)
    } catch (err: any) {
      setError(err.message)
      setIsPending(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken)',
      padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--surface-elevated)',
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--surface-border)',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ 
            width: 48, height: 48, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' 
          }}>
            <KeyRound size={24} color="var(--text-secondary)" />
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Welcome to zCart
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
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
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
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
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
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

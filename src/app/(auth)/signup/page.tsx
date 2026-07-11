'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signupAction, type ActionState } from '../actions'
import { Mail, Lock, Store, Phone, ArrowRight, AlertCircle, Check } from 'lucide-react'

const initialState: ActionState = {}

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
]

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState)

  return (
    <div className="animate-scale-in">
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Create your shop
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Free forever. No credit card required.
          </p>
        </div>

        {/* Error */}
        {state.error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-5)',
          }}>
            <AlertCircle size={16} color="var(--color-danger-400)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-400)' }}>{state.error}</p>
          </div>
        )}

        {/* Form */}
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Shop name */}
          <div className="input-wrapper">
            <label htmlFor="shopName" className="input-label">Shop name</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', pointerEvents: 'none',
              }}>
                <Store size={15} />
              </span>
              <input
                id="shopName"
                name="shopName"
                type="text"
                autoComplete="organization"
                placeholder="My Awesome Shop"
                className={`input input-icon-left ${state.fieldErrors?.shopName ? 'input-error' : ''}`}
              />
            </div>
            {state.fieldErrors?.shopName ? (
              <p className="input-helper error">{state.fieldErrors.shopName[0]}</p>
            ) : (
              <p className="input-helper">This will be your store name visible to customers</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="input-wrapper">
            <label htmlFor="phone" className="input-label">
              Phone number <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', pointerEvents: 'none',
              }}>
                <Phone size={15} />
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                className="input input-icon-left"
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-wrapper">
            <label htmlFor="email" className="input-label">Email address</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', pointerEvents: 'none',
              }}>
                <Mail size={15} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input input-icon-left ${state.fieldErrors?.email ? 'input-error' : ''}`}
              />
            </div>
            {state.fieldErrors?.email && (
              <p className="input-helper error">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div className="input-wrapper">
            <label htmlFor="password" className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)', pointerEvents: 'none',
              }}>
                <Lock size={15} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`input input-icon-left ${state.fieldErrors?.password ? 'input-error' : ''}`}
              />
            </div>
            {state.fieldErrors?.password && (
              <p className="input-helper error">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className={`btn btn-primary btn-lg ${pending ? 'btn-loading' : ''}`}
            style={{ marginTop: 'var(--space-2)', width: '100%', justifyContent: 'center' }}
          >
            <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              Create my shop <ArrowRight size={16} />
            </span>
          </button>

          {/* Trust signals */}
          <div style={{
            display: 'flex', gap: 'var(--space-4)', justifyContent: 'center',
            flexWrap: 'wrap', marginTop: 'var(--space-1)',
          }}>
            {['Free forever', 'No credit card', 'Setup in 5 min'].map((t) => (
              <span key={t} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
              }}>
                <Check size={11} color="var(--color-success-400)" />
                {t}
              </span>
            ))}
          </div>
        </form>

        {/* Sign in link */}
        <p style={{
          textAlign: 'center', marginTop: 'var(--space-6)',
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary-400)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Terms note */}
      <p style={{
        textAlign: 'center', marginTop: 'var(--space-4)',
        fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)',
      }}>
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

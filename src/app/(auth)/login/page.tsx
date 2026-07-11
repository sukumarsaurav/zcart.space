'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { loginAction, type ActionState } from '../actions'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

const initialState: ActionState = {}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <div className="animate-scale-in">
      <div className="card" style={{ padding: 'var(--space-8)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Sign in to your zCart dashboard
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" className="input-label">Password</label>
              <Link href="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-400)' }}>
                Forgot password?
              </Link>
            </div>
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
                autoComplete="current-password"
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
              Sign in <ArrowRight size={16} />
            </span>
          </button>
        </form>

        {/* Sign up link */}
        <p style={{
          textAlign: 'center', marginTop: 'var(--space-6)',
          fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--color-primary-400)', fontWeight: 500 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

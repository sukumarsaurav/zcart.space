import Link from 'next/link'
import { ShoppingBag, BarChart3, Package, Receipt, Zap, Shield, Globe, ArrowRight, Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'zCart — The all-in-one platform for local shops',
}

const features = [
  {
    icon: Globe,
    title: 'Online Storefront',
    description: 'Beautiful, mobile-first online store with 3 premium templates. Go live in minutes.',
  },
  {
    icon: ShoppingBag,
    title: 'POS Billing',
    description: 'Fast counter billing with barcode support. Works on any tablet or laptop.',
  },
  {
    icon: Package,
    title: 'Unified Inventory',
    description: 'One stock pool shared across your online store and physical counter. No overselling.',
  },
  {
    icon: Receipt,
    title: 'GST Invoices',
    description: 'Auto-generated GST-compliant PDF invoices with proper HSN codes and tax breakup.',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Revenue charts, top products, and daily summaries — all at a glance.',
  },
  {
    icon: Shield,
    title: 'Khata / Credit',
    description: 'Track customer credit balances digitally. No more paper khata.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['1 storefront', '50 products', 'Basic POS', 'GST invoices', '5 orders/day'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₹499',
    period: 'per month',
    features: ['1 storefront', 'Unlimited products', 'Full POS', 'Custom domain', 'Analytics', 'Khata / Credit'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '₹1,299',
    period: 'per month',
    features: ['3 storefronts', 'Multi-staff logins', 'Multi-location stock', 'Coupons & Loyalty', 'WhatsApp notifications', 'Priority support'],
    cta: 'Start free trial',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(9,9,11,0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--surface-border)',
        padding: '0 var(--space-6)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1280px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }} className="gradient-text">zCart</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'var(--space-24) var(--space-6) var(--space-20)',
        textAlign: 'center',
      }}>
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="badge badge-primary badge-dot" style={{ marginBottom: 'var(--space-6)', display: 'inline-flex' }}>
            Built for Indian local businesses
          </span>
        </div>
        <h1 className="animate-fade-in-up" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 'var(--space-6)',
          animationDelay: '80ms',
        }}>
          Run your entire shop<br />
          <span className="gradient-text">from one place</span>
        </h1>
        <p className="animate-fade-in-up" style={{
          fontSize: 'var(--text-xl)',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          margin: '0 auto var(--space-10)',
          lineHeight: 1.7,
          animationDelay: '160ms',
        }}>
          Online store + POS billing + inventory + GST invoicing. Everything Dukaan and Vyapar do, combined into one powerful platform.
        </p>
        <div className="animate-fade-in-up" style={{
          display: 'flex', gap: 'var(--space-4)',
          justifyContent: 'center', flexWrap: 'wrap',
          animationDelay: '240ms',
        }}>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ gap: 'var(--space-2)' }}>
            Start for free <ArrowRight size={18} />
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg">See all features</Link>
        </div>
        {/* Hero card */}
        <div className="animate-fade-in-up" style={{
          marginTop: 'var(--space-16)',
          background: 'var(--surface-card)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          maxWidth: '900px',
          margin: 'var(--space-16) auto 0',
          animationDelay: '320ms',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 'var(--space-4)',
          }}>
            {[
              { label: 'Revenue Today', value: '₹24,580', trend: '+18%', color: 'var(--color-primary-400)' },
              { label: 'Orders', value: '47', trend: '+5', color: 'var(--color-success-400)' },
              { label: 'Products', value: '312', trend: 'Active', color: 'var(--color-accent-400)' },
              { label: 'Low Stock', value: '3', trend: 'Items', color: 'var(--color-warning-400)' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--surface-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                textAlign: 'left',
              }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>{item.label}</p>
                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: item.color }}>{item.value}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>{item.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Everything you need to sell
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
            No separate apps. No juggling spreadsheets. One platform.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-5)',
        }}>
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card card-hover animate-fade-in-up" style={{
                padding: 'var(--space-6)',
                animationDelay: `${i * 60}ms`,
              }}>
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                  color: 'var(--color-primary-400)',
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {f.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
            Start free. Upgrade when you grow.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-5)',
          alignItems: 'start',
        }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight
                ? 'linear-gradient(145deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))'
                : 'var(--surface-card)',
              border: plan.highlight
                ? '1px solid rgba(99,102,241,0.4)'
                : '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              position: 'relative',
              boxShadow: plan.highlight ? 'var(--shadow-glow)' : 'none',
            }}>
              {plan.highlight && (
                <span className="badge badge-primary" style={{
                  position: 'absolute', top: -12, left: '50%',
                  transform: 'translateX(-50%)',
                }}>Most popular</span>
              )}
              <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{plan.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 800 }}>{plan.price}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>/{plan.period}</span>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <Check size={14} color="var(--color-success-400)" style={{ flexShrink: 0 }} />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`btn btn-lg ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: 'var(--space-20) var(--space-6)',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-16) var(--space-8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Zap size={20} color="var(--color-warning-400)" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Get started in 5 minutes</span>
          </div>
          <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
            Ready to modernize your shop?
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '480px', margin: '0 auto var(--space-8)' }}>
            Join thousands of local shop owners already running their business on zCart.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Create your free shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--surface-border)',
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}>
        <p>© 2026 zCart. Built for India's local businesses.</p>
      </footer>
    </div>
  )
}

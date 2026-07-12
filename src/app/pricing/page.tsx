import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PricingSection from '@/components/marketing/PricingSection'
import FeatureComparisonTable from '@/components/marketing/FeatureComparisonTable'
import FaqAccordion from '@/components/marketing/FaqAccordion'
import { getPlansWithFeatures, getFullPricingData } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'Pricing — zCart',
  description: 'Simple, transparent pricing for zCart. Start free, upgrade as your shop grows.',
}

const faqs = [
  { question: 'Can I switch plans later?', answer: 'Yes — upgrade or downgrade any time from your dashboard settings. Changes apply from your next billing cycle, and your data carries over automatically.' },
  { question: 'What happens if I go over a plan limit?', answer: 'We\'ll let you know before you hit a hard limit (like product count or staff seats) so you can upgrade smoothly — you won\'t lose access to your existing data.' },
  { question: 'Is there a free trial on paid plans?', answer: 'Starter and Pro both include a free trial period before billing starts. No card is required to try the Free plan itself.' },
  { question: 'Do you offer discounts for yearly billing?', answer: 'Yes — paying yearly saves up to 20% compared to paying monthly, shown automatically when you toggle to Yearly above.' },
  { question: 'How is Enterprise pricing determined?', answer: 'Enterprise is for multi-location and franchise operations with custom needs — reach out and we\'ll put together a plan based on your number of locations and staff.' },
]

export default async function PricingPage() {
  const [cardPlans, fullData] = await Promise.all([getPlansWithFeatures(), getFullPricingData()])

  return (
    <div data-marketing-theme="royal" style={{ background: 'var(--surface-bg)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MarketingNav />

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-20) var(--space-6) var(--space-8)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: 'var(--space-4)' }}>
          Simple, transparent <span className="gradient-text">pricing</span>
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto' }}>
          Start free, no card required. Upgrade whenever your shop is ready to grow.
        </p>
      </section>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        {cardPlans.length > 0 ? (
          <PricingSection plans={cardPlans} />
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Pricing is being updated — check back shortly.</p>
        )}
      </section>

      {fullData.plans.length > 0 && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-20)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Compare every feature</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>A full breakdown of what&apos;s included in each plan.</p>
          </div>
          <FeatureComparisonTable plans={fullData.plans} features={fullData.features} matrix={fullData.matrix} />
        </section>
      )}

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-16) var(--space-6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>Pricing questions</h2>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-20) var(--space-6)', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-16) var(--space-8)',
        }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Still deciding?</h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: 480, margin: '0 auto var(--space-8)' }}>
            Start on the Free plan — no card required — and upgrade whenever you&apos;re ready.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Create your free shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

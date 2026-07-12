'use client'

import { useState } from 'react'
import PricingCard from './PricingCard'
import type { Plan } from '@/types/database'

export interface PlanWithFeatures extends Plan {
  featureLabels: string[]
}

const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function PricingSection({ plans }: { plans: PlanWithFeatures[] }) {
  const [yearly, setYearly] = useState(false)

  return (
    <div>
      <div className="mkt-billing-toggle-wrap">
        <div className="mkt-billing-toggle">
          <button
            onClick={() => setYearly(false)}
            className={`btn btn-sm ${!yearly ? 'active' : ''}`}
            aria-pressed={!yearly}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`btn btn-sm ${yearly ? 'active' : ''}`}
            aria-pressed={yearly}
          >
            Yearly <span className="badge badge-success">Save up to 20%</span>
          </button>
        </div>
      </div>

      <div className="mkt-pricing-grid">
        {plans.map((plan) => {
          const isContactUs = plan.price_monthly === null
          const activePrice = yearly ? plan.price_yearly : plan.price_monthly

          let priceLabel = 'Contact us'
          let periodLabel = ''
          let savingsLabel: string | null = null

          if (!isContactUs) {
            if (activePrice === 0) {
              priceLabel = '₹0'
              periodLabel = 'forever'
            } else if (yearly) {
              const monthlyEquivalent = Math.round((plan.price_yearly ?? 0) / 12)
              priceLabel = fmtINR(monthlyEquivalent)
              periodLabel = 'month, billed yearly'
              const fullYearAtMonthlyRate = (plan.price_monthly ?? 0) * 12
              const pct = fullYearAtMonthlyRate > 0
                ? Math.round((1 - (plan.price_yearly ?? 0) / fullYearAtMonthlyRate) * 100)
                : 0
              if (pct > 0) savingsLabel = `Save ${pct}% vs monthly`
            } else {
              priceLabel = fmtINR(activePrice ?? 0)
              periodLabel = 'month'
            }
          }

          return (
            <PricingCard
              key={plan.id}
              name={plan.name}
              tagline={plan.tagline}
              priceLabel={priceLabel}
              periodLabel={periodLabel}
              savingsLabel={savingsLabel}
              featureLabels={plan.featureLabels}
              ctaLabel={plan.cta_label}
              isPopular={plan.is_popular}
            />
          )
        })}
      </div>
    </div>
  )
}

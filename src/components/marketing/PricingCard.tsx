import Link from 'next/link'
import { Check } from 'lucide-react'

export interface PricingCardProps {
  name: string
  tagline: string | null
  priceLabel: string
  periodLabel: string
  savingsLabel?: string | null
  featureLabels: string[]
  ctaLabel: string
  isPopular: boolean
}

export default function PricingCard({ name, tagline, priceLabel, periodLabel, savingsLabel, featureLabels, ctaLabel, isPopular }: PricingCardProps) {
  return (
    <div className={`pricing-card ${isPopular ? 'pricing-card--popular' : ''}`}>
      {isPopular && (
        <span className="badge badge-primary pricing-card-badge">Most popular</span>
      )}
      <h3>{name}</h3>
      {tagline && <p className="pricing-card-tagline">{tagline}</p>}
      <div className="pricing-card-price">
        <strong>{priceLabel}</strong>
        {periodLabel && <span>/{periodLabel}</span>}
      </div>
      <div className="pricing-card-savings">
        {savingsLabel && <span className="badge badge-success">{savingsLabel}</span>}
      </div>
      <ul className="pricing-card-features">
        {featureLabels.map((feat) => (
          <li key={feat}>
            <Check size={14} />
            {feat}
          </li>
        ))}
      </ul>
      <Link href="/signup" className={`btn btn-lg ${isPopular ? 'btn-primary' : 'btn-secondary'}`}>
        {ctaLabel}
      </Link>
    </div>
  )
}

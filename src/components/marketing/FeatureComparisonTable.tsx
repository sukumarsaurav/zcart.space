import { Fragment } from 'react'
import { Check, Minus } from 'lucide-react'
import type { Plan, FeatureCatalogEntry, PlanFeature } from '@/types/database'

export default function FeatureComparisonTable({
  plans,
  features,
  matrix,
}: {
  plans: Plan[]
  features: FeatureCatalogEntry[]
  matrix: PlanFeature[]
}) {
  const included = new Set(matrix.filter((m) => m.is_included).map((m) => `${m.plan_id}:${m.feature_id}`))
  const notes = new Map(matrix.filter((m) => m.note).map((m) => [`${m.plan_id}:${m.feature_id}`, m.note]))

  const categories = Array.from(new Set(features.map((f) => f.category)))

  return (
    <div className="table-wrapper" style={{ overflowX: 'auto' }}>
      <table className="table" style={{ minWidth: 640 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 220 }}>Feature</th>
            {plans.map((p) => (
              <th key={p.id} style={{ textAlign: 'center' }}>{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <Fragment key={category}>
              <tr>
                <td colSpan={plans.length + 1} style={{
                  background: 'rgba(15,23,42,0.03)', fontWeight: 700,
                  fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                }}>
                  {category}
                </td>
              </tr>
              {features.filter((f) => f.category === category).map((feature) => (
                <tr key={feature.id}>
                  <td>{feature.label}</td>
                  {plans.map((p) => {
                    const key = `${p.id}:${feature.id}`
                    const isIncluded = included.has(key)
                    const note = notes.get(key)
                    return (
                      <td key={p.id} style={{ textAlign: 'center' }}>
                        {isIncluded ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Check size={16} color="var(--color-success-400)" />
                            {note && <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{note}</span>}
                          </div>
                        ) : (
                          <Minus size={14} color="var(--text-tertiary)" style={{ opacity: 0.4 }} />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

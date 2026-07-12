import { Check, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface AlternatingFeatureProps {
  icon: LucideIcon
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  imageOnLeft?: boolean
  visual: ReactNode
}

export default function AlternatingFeature({
  icon: Icon, eyebrow, title, description, bullets, imageOnLeft, visual,
}: AlternatingFeatureProps) {
  const textBlock = (
    <div>
      <span className="mkt-eyebrow">
        <Icon size={14} /> {eyebrow}
      </span>
      <h3 className="mkt-feature-title">{title}</h3>
      <p className="mkt-feature-desc">{description}</p>
      <ul className="mkt-check-list">
        {bullets.map((b) => (
          <li key={b}>
            <span className="mkt-check-bullet">
              <Check size={11} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  )

  const visualBlock = <div className="mock-visual">{visual}</div>

  return (
    <div className="mkt-split">
      {imageOnLeft ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </div>
  )
}

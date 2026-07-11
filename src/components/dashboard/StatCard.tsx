'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: React.ReactNode
  iconBg?: string
  iconColor?: string
}

export default function StatCard({ label, value, trend, trendUp, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p className="stat-card-label">{label}</p>
          <p className="stat-card-value" style={{ marginTop: 'var(--space-2)' }}>{value}</p>
          {trend && (
            <div className={`stat-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`} style={{ marginTop: 'var(--space-2)' }}>
              {trendUp
                ? <TrendingUp size={12} />
                : <TrendingDown size={12} />
              }
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div
          className="stat-card-icon"
          style={{
            background: iconBg ?? 'rgba(99,102,241,0.12)',
            color: iconColor ?? 'var(--color-primary-400)',
            border: `1px solid ${iconBg ? 'transparent' : 'rgba(99,102,241,0.2)'}`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface TopProductRow {
  product_name: string
  revenue: number
  units_sold: number
}

interface Props { data: TopProductRow[] }

const COLORS = [
  'var(--color-primary-400)',
  'var(--color-accent-400)',
  'var(--color-info-400)',
  'var(--color-success-400)',
  'var(--color-warning-400)',
]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3) var(--space-4)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>{d.name}</p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-400)', fontWeight: 600 }}>
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(d.revenue)}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{d.units_sold} units</p>
    </div>
  )
}

export default function TopProductsChart({ data }: Props) {
  const chartData = data.map((r) => ({
    name: r.product_name?.length > 16 ? r.product_name.slice(0, 14) + '…' : r.product_name,
    revenue: Number(r.revenue ?? 0),
    units_sold: Number(r.units_sold ?? 0),
  }))

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Top Products</h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>By revenue</p>
        </div>
      </div>
      <div className="card-body">
        {chartData.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No sales data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                type="number"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

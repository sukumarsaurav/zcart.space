'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface DailySaleRow {
  sale_date: string
  gross_revenue: number
  order_count: number
}

interface Props { data: DailySaleRow[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface-elevated)',
      border: '1px solid var(--surface-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-3) var(--space-4)',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary-400)' }}>
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value)}
      </p>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
        {payload[1]?.value} orders
      </p>
    </div>
  )
}

export default function RevenueChart({ data }: Props) {
  const chartData = data.map((row) => ({
    date: (() => { try { return format(parseISO(String(row.sale_date)), 'MMM d') } catch { return String(row.sale_date) } })(),
    revenue: Number(row.gross_revenue ?? 0),
    orders: Number(row.order_count ?? 0),
  }))

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Revenue (Last 7 Days)</h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Daily gross revenue</p>
        </div>
      </div>
      <div className="card-body">
        {chartData.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-10)' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No sales data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-primary-400)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--color-primary-400)', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--color-primary-300)', strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--color-accent-400)"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

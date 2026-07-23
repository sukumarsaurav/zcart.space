'use client'

import { useState } from 'react'
import { updatePlanDetailsAction } from '@/app/(admin)/admin/actions'
import type { Plan } from '@/types/database'
import { Edit3, Sparkles, Package, Users, Store } from 'lucide-react'

interface PlansManagerClientProps {
  plans: Plan[]
}

export default function PlansManagerClient({ plans: initialPlans }: PlansManagerClientProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState<Partial<Plan>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      tagline: plan.tagline || '',
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_products: plan.max_products,
      max_staff: plan.max_staff,
      max_storefronts: plan.max_storefronts,
      is_popular: plan.is_popular,
      is_active: plan.is_active,
    })
    setMessage(null)
  }

  const handleSave = async () => {
    if (!editingPlan) return
    setIsSubmitting(true)
    setMessage(null)

    const res = await updatePlanDetailsAction(editingPlan.id, formData)
    setIsSubmitting(false)

    if (res.success) {
      setMessage({ type: 'success', text: 'Plan details updated successfully!' })
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? ({ ...p, ...formData } as Plan) : p))
      )
      setTimeout(() => {
        setEditingPlan(null)
      }, 1200)
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update plan' })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="admin-card"
            style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', borderColor: plan.is_popular ? 'var(--admin-primary)' : 'var(--admin-border-subtle)'
            }}
          >
            {plan.is_popular && (
              <div className="admin-badge admin-badge-starter" style={{ position: 'absolute', top: -12, right: 16, backgroundColor: 'var(--admin-primary)', color: '#ffffff' }}>
                <Sparkles size={12} /> Popular
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span className="admin-badge admin-badge-starter" style={{ textTransform: 'uppercase' }}>
                  {plan.key} Tier
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0.35rem 0 0 0' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0', minHeight: 36 }}>
                  {plan.tagline || 'Standard subscription tier for merchant shops.'}
                </p>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>₹{plan.price_monthly ?? 0}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>/ month</span>
                </div>
                {plan.price_yearly && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-emerald)', marginTop: '0.25rem' }}>
                    ₹{plan.price_yearly} / year (Billed annually)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Package size={14} color="var(--admin-primary)" /> Max Products:</span>
                  <strong style={{ color: '#ffffff' }}>{plan.max_products === null ? 'Unlimited' : plan.max_products}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} color="var(--admin-primary)" /> Max Staff:</span>
                  <strong style={{ color: '#ffffff' }}>{plan.max_staff === null ? 'Unlimited' : plan.max_staff}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.35rem', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Store size={14} color="var(--admin-primary)" /> Max Storefronts:</span>
                  <strong style={{ color: '#ffffff' }}>{plan.max_storefronts === null ? 'Unlimited' : plan.max_storefronts}</strong>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--admin-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`admin-badge ${plan.is_active ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                {plan.is_active ? 'Active' : 'Disabled'}
              </span>

              <button onClick={() => handleOpenEdit(plan)} className="admin-btn admin-btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                <Edit3 size={14} /> Edit Tier
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPlan && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Edit Subscription Plan</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>{editingPlan.name} ({editingPlan.key})</p>
              </div>
              <button onClick={() => setEditingPlan(null)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            {message && (
              <div className={`admin-badge ${message.type === 'success' ? 'admin-badge-active' : 'admin-badge-suspended'}`} style={{ padding: '0.65rem', width: '100%' }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Plan Name</label>
                  <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="admin-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Tagline</label>
                  <input type="text" value={formData.tagline || ''} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className="admin-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Monthly Price (₹)</label>
                  <input type="number" value={formData.price_monthly ?? ''} onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })} className="admin-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Yearly Price (₹)</label>
                  <input type="number" value={formData.price_yearly ?? ''} onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })} className="admin-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Max Products</label>
                  <input type="number" value={formData.max_products ?? ''} onChange={(e) => setFormData({ ...formData, max_products: e.target.value ? Number(e.target.value) : null })} className="admin-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Max Staff</label>
                  <input type="number" value={formData.max_staff ?? ''} onChange={(e) => setFormData({ ...formData, max_staff: e.target.value ? Number(e.target.value) : null })} className="admin-input" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--admin-text-muted)', marginBottom: '0.25rem' }}>Max Storefronts</label>
                  <input type="number" value={formData.max_storefronts ?? ''} onChange={(e) => setFormData({ ...formData, max_storefronts: e.target.value ? Number(e.target.value) : null })} className="admin-input" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-subtle)' }}>
              <button onClick={() => setEditingPlan(null)} className="admin-btn admin-btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={isSubmitting} className="admin-btn admin-btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Plan Limits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

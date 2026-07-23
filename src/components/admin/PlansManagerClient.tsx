'use client'

import { useState } from 'react'
import { updatePlanDetailsAction } from '@/app/(admin)/admin/actions'
import type { Plan } from '@/types/database'
import {
  CreditCard,
  Edit3,
  Check,
  Zap,
  Sparkles,
  Users,
  Store,
  Layers,
  CheckCircle2,
  XCircle,
  Package
} from 'lucide-react'

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
      // Update local state
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
    <div className="space-y-6">
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-slate-900 border rounded-2xl p-6 shadow-xl flex flex-col justify-between relative transition-all ${
              plan.is_popular
                ? 'border-indigo-500/80 shadow-indigo-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 right-4 px-3 py-1 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                Popular Choice
              </div>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                  {plan.key} Tier
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  {plan.tagline || 'Standard subscription tier for merchant shops.'}
                </p>
              </div>

              {/* Price Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    ₹{plan.price_monthly ?? 0}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                {plan.price_yearly && (
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    ₹{plan.price_yearly} / year (Billed annually)
                  </div>
                )}
              </div>

              {/* Limits List */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-indigo-400" />
                    Max Products:
                  </span>
                  <span className="font-bold text-white">
                    {plan.max_products === null ? 'Unlimited' : plan.max_products}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Max Staff:
                  </span>
                  <span className="font-bold text-white">
                    {plan.max_staff === null ? 'Unlimited' : plan.max_staff}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-indigo-400" />
                    Max Storefronts:
                  </span>
                  <span className="font-bold text-white">
                    {plan.max_storefronts === null ? 'Unlimited' : plan.max_storefronts}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800 mt-6 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                plan.is_active
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}>
                {plan.is_active ? 'Active' : 'Disabled'}
              </span>

              <button
                onClick={() => handleOpenEdit(plan)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              >
                <Edit3 className="w-3.5 h-3.5 text-white" />
                <span>Edit Tier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Subscription Plan</h3>
                <p className="text-xs text-slate-400">{editingPlan.name} ({editingPlan.key})</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  message.type === 'success'
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950 border border-rose-800 text-rose-300'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Plan Display Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_monthly ?? ''}
                    onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price_yearly ?? ''}
                    onChange={(e) => setFormData({ ...formData, price_yearly: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Max Products</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.max_products ?? ''}
                    onChange={(e) => setFormData({ ...formData, max_products: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Max Staff</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.max_staff ?? ''}
                    onChange={(e) => setFormData({ ...formData, max_staff: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Max Storefronts</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.max_storefronts ?? ''}
                    onChange={(e) => setFormData({ ...formData, max_storefronts: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular ?? false}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">Mark as Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active ?? true}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">Plan Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
              >
                {isSubmitting ? 'Saving...' : 'Save Plan Limits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

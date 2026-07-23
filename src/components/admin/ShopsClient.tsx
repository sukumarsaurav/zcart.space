'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { updateShopPlanAction, toggleShopStatusAction } from '@/app/(admin)/admin/actions'
import type { Shop, ShopPlan } from '@/types/database'
import {
  Search,
  Store,
  Filter,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  ShieldAlert,
  ExternalLink,
  Info,
  Check,
  ChevronDown,
  Building2,
  FileText
} from 'lucide-react'

export interface ExtendedShop extends Shop {
  owner_name?: string
  owner_email?: string
  owner_phone?: string
  total_orders_count?: number
  total_gmv?: number
}

interface ShopsClientProps {
  shops: ExtendedShop[]
}

export default function ShopsClient({ shops: initialShops }: ShopsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended'>('all')
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all')

  // Edit Plan Modal State
  const [editingShop, setEditingShop] = useState<ExtendedShop | null>(null)
  const [newPlan, setNewPlan] = useState<ShopPlan>('free')
  const [planExpiry, setPlanExpiry] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Detail Drawer State
  const [drawerShop, setDrawerShop] = useState<ExtendedShop | null>(null)

  // Filter logic
  const filteredShops = initialShops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.owner_name && shop.owner_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shop.email && shop.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && shop.is_active) ||
      (selectedStatus === 'suspended' && !shop.is_active)

    const matchesPlan =
      selectedPlanFilter === 'all' || shop.plan === selectedPlanFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  // Open Edit Modal
  const handleOpenEditModal = (shop: ExtendedShop) => {
    setEditingShop(shop)
    setNewPlan(shop.plan || 'free')
    setPlanExpiry(shop.plan_expires_at ? new Date(shop.plan_expires_at).toISOString().split('T')[0] : '')
    setModalMessage(null)
  }

  // Submit Plan Update
  const handleSavePlan = async () => {
    if (!editingShop) return
    setIsSubmitting(true)
    setModalMessage(null)

    const res = await updateShopPlanAction(editingShop.id, newPlan, planExpiry || null)
    setIsSubmitting(false)

    if (res.success) {
      setModalMessage({ type: 'success', text: 'Shop plan updated successfully!' })
      setTimeout(() => {
        setEditingShop(null)
      }, 1200)
    } else {
      setModalMessage({ type: 'error', text: res.error || 'Failed to update shop plan' })
    }
  }

  // Toggle Shop Active/Suspended Status
  const handleToggleStatus = async (shop: ExtendedShop) => {
    const nextStatus = !shop.is_active
    const confirmText = nextStatus
      ? `Are you sure you want to activate ${shop.name}?`
      : `Are you sure you want to suspend ${shop.name}? Merchants won't be able to access the store.`

    if (!confirm(confirmText)) return

    const res = await toggleShopStatusAction(shop.id, nextStatus)
    if (!res.success) {
      alert(`Error updating shop status: ${res.error}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shop name, slug, owner name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedStatus === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedStatus === 'active' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('suspended')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedStatus === 'suspended' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suspended
            </button>
          </div>

          {/* Plan Filter */}
          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Shops Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Shop Info</th>
                <th className="py-3.5 px-4">Owner Contact</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Total GMV</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Store className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-medium text-slate-400">No shops found matching filters</p>
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Shop Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-950 to-slate-900 border border-indigo-800/50 text-indigo-300 font-bold flex items-center justify-center text-sm shadow">
                          {shop.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{shop.name}</span>
                            <a
                              href={`/store/${shop.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-500 hover:text-indigo-400"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                            zcart.space/store/{shop.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner Contact */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">{shop.owner_name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {shop.phone || shop.owner_phone || shop.email || 'No contact'}
                      </div>
                    </td>

                    {/* Subscription Plan */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          shop.plan === 'enterprise'
                            ? 'bg-amber-950/80 border border-amber-700/50 text-amber-300'
                            : shop.plan === 'pro'
                            ? 'bg-purple-950/80 border border-purple-700/50 text-purple-300'
                            : shop.plan === 'starter'
                            ? 'bg-indigo-950/80 border border-indigo-700/50 text-indigo-300'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {shop.plan || 'free'}
                        </span>
                        {shop.plan_expires_at && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Exp: {new Date(shop.plan_expires_at).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total GMV */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-sm">
                        {formatCurrency(shop.total_gmv || 0)}
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-300">
                        {shop.total_orders_count || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {shop.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-950/80 text-rose-400 border border-rose-800/60">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          Suspended
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDrawerShop(shop)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Details"
                        >
                          <Info className="w-4 h-4 text-slate-300" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(shop)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-950 border border-indigo-800/60 hover:bg-indigo-900 text-indigo-300 font-medium text-xs flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Edit Plan</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(shop)}
                          className={`px-2.5 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                            shop.is_active
                              ? 'bg-rose-950/60 border border-rose-900/60 text-rose-300 hover:bg-rose-900'
                              : 'bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900'
                          }`}
                        >
                          {shop.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Modify Shop Subscription</h3>
                <p className="text-xs text-slate-400">{editingShop.name} ({editingShop.slug})</p>
              </div>
              <button
                onClick={() => setEditingShop(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {modalMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  modalMessage.type === 'success'
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950 border border-rose-800 text-rose-300'
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subscription Tier Plan
                </label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as ShopPlan)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="free">Free (₹0/month)</option>
                  <option value="starter">Starter (₹499/month)</option>
                  <option value="pro">Pro (₹1,499/month)</option>
                  <option value="enterprise">Enterprise (₹3,999/month)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Plan Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={planExpiry}
                  onChange={(e) => setPlanExpiry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setEditingShop(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30"
              >
                {isSubmitting ? 'Saving...' : 'Save Plan Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Details Drawer Modal */}
      {drawerShop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-bold flex items-center justify-center text-base">
                  {drawerShop.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{drawerShop.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{drawerShop.slug}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerShop(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-300 text-sm border-b border-slate-800 pb-2">
                  Merchant Account Overview
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Owner Name</span>
                    <span className="font-medium text-slate-200">{drawerShop.owner_name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Phone</span>
                    <span className="font-medium text-slate-200">{drawerShop.phone || drawerShop.owner_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Email</span>
                    <span className="font-medium text-slate-200">{drawerShop.email || drawerShop.owner_email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">GSTIN</span>
                    <span className="font-medium text-slate-200">{drawerShop.gstin || 'Not Provided'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-300 text-sm border-b border-slate-800 pb-2">
                  Storefront & Metrics
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Total GMV</span>
                    <span className="font-bold text-emerald-400 text-sm">{formatCurrency(drawerShop.total_gmv || 0)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Completed Orders</span>
                    <span className="font-bold text-white text-sm">{drawerShop.total_orders_count || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Current Plan</span>
                    <span className="font-medium text-indigo-300 uppercase">{drawerShop.plan || 'free'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Custom Domain</span>
                    <span className="font-medium text-slate-200">{drawerShop.custom_domain || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

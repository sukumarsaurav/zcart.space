'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/formatters'
import { updateShopPlanAction, toggleShopStatusAction } from '@/app/(admin)/admin/actions'
import type { Shop, ShopPlan } from '@/types/database'
import {
  Search,
  Store,
  CheckCircle2,
  XCircle,
  Edit3,
  ExternalLink,
  Info
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

  const handleOpenEditModal = (shop: ExtendedShop) => {
    setEditingShop(shop)
    setNewPlan(shop.plan || 'free')
    setPlanExpiry(shop.plan_expires_at ? new Date(shop.plan_expires_at).toISOString().split('T')[0] : '')
    setModalMessage(null)
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div className="admin-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        {/* Search Input */}
        <div className="admin-search-wrapper" style={{ width: 320 }}>
          <Search className="admin-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shop name, slug, owner..."
            className="admin-search-input"
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)', borderRadius: '10px' }}>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`admin-btn ${selectedStatus === 'all' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`admin-btn ${selectedStatus === 'active' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('suspended')}
              className={`admin-btn ${selectedStatus === 'suspended' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              Suspended
            </button>
          </div>

          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="admin-input"
            style={{ width: 'auto', padding: '0.35rem 0.75rem' }}
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Shop Info</th>
              <th>Owner Contact</th>
              <th>Plan</th>
              <th>Total GMV</th>
              <th>Orders</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-subtle)' }}>
                  <Store size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0 }}>No shops found matching filters</p>
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '10px',
                        backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)',
                        color: 'var(--admin-primary)', fontWeight: 'bold', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem'
                      }}>
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span>{shop.name}</span>
                          <a href={`/store/${shop.slug}`} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-text-subtle)' }}>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-subtle)', fontFamily: 'monospace' }}>
                          zcart.space/store/{shop.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{shop.owner_name || 'N/A'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                      {shop.phone || shop.owner_phone || shop.email || 'No contact'}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      shop.plan === 'enterprise' ? 'admin-badge-enterprise' :
                      shop.plan === 'pro' ? 'admin-badge-pro' :
                      shop.plan === 'starter' ? 'admin-badge-starter' : 'admin-badge-free'
                    }`}>
                      {shop.plan || 'free'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{formatCurrency(shop.total_gmv || 0)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{shop.total_orders_count || 0}</div>
                  </td>
                  <td>
                    {shop.is_active ? (
                      <span className="admin-badge admin-badge-active">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-suspended">
                        <XCircle size={12} /> Suspended
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        onClick={() => setDrawerShop(shop)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.35rem', borderRadius: '8px' }}
                        title="View Details"
                      >
                        <Info size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(shop)}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        <Edit3 size={12} /> Edit Plan
                      </button>
                      <button
                        onClick={() => handleToggleStatus(shop)}
                        className={`admin-btn ${shop.is_active ? 'admin-btn-danger' : 'admin-btn-success'}`}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
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

      {/* Edit Plan Modal */}
      {editingShop && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Modify Shop Subscription</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: '0.25rem 0 0 0' }}>{editingShop.name} ({editingShop.slug})</p>
              </div>
              <button onClick={() => setEditingShop(null)} style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            {modalMessage && (
              <div className={`admin-badge ${modalMessage.type === 'success' ? 'admin-badge-active' : 'admin-badge-suspended'}`} style={{ padding: '0.65rem 0.85rem', width: '100%', borderRadius: '10px' }}>
                {modalMessage.text}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }}>
                  Subscription Tier Plan
                </label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as ShopPlan)}
                  className="admin-input"
                >
                  <option value="free">Free (₹0/month)</option>
                  <option value="starter">Starter (₹499/month)</option>
                  <option value="pro">Pro (₹1,499/month)</option>
                  <option value="enterprise">Enterprise (₹3,999/month)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }}>
                  Plan Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={planExpiry}
                  onChange={(e) => setPlanExpiry(e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-subtle)' }}>
              <button onClick={() => setEditingShop(null)} className="admin-btn admin-btn-secondary">Cancel</button>
              <button onClick={handleSavePlan} disabled={isSubmitting} className="admin-btn admin-btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Plan Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerShop && (
        <div className="admin-modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }}>
          <div style={{ width: 450, height: '100%', backgroundColor: 'var(--admin-bg-surface)', borderLeft: '1px solid var(--admin-border-accent)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>{drawerShop.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', margin: 0, fontFamily: 'monospace' }}>{drawerShop.slug}</p>
              </div>
              <button onClick={() => setDrawerShop(null)} className="admin-btn admin-btn-secondary" style={{ padding: '0.35rem 0.65rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Merchant Account</h4>
                <p style={{ margin: '0.25rem 0' }}><strong>Owner:</strong> {drawerShop.owner_name || 'N/A'}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Phone:</strong> {drawerShop.phone || drawerShop.owner_phone || 'N/A'}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {drawerShop.email || drawerShop.owner_email || 'N/A'}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>GSTIN:</strong> {drawerShop.gstin || 'Not Provided'}</p>
              </div>

              <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--admin-bg-base)', border: '1px solid var(--admin-border-subtle)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--admin-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sales Telemetry</h4>
                <p style={{ margin: '0.25rem 0' }}><strong>Total Sales:</strong> <span style={{ color: 'var(--admin-emerald)', fontWeight: 'bold' }}>{formatCurrency(drawerShop.total_gmv || 0)}</span></p>
                <p style={{ margin: '0.25rem 0' }}><strong>Total Orders:</strong> {drawerShop.total_orders_count || 0}</p>
                <p style={{ margin: '0.25rem 0' }}><strong>Plan:</strong> <span style={{ textTransform: 'uppercase' }}>{drawerShop.plan || 'free'}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

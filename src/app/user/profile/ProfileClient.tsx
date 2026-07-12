'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, MapPin, Package, Edit2, Plus, Clock, ExternalLink, X } from 'lucide-react'
import { updateProfile, saveAddress } from './actions'

export default function ProfileClient({ initialProfile, initialAddresses, initialOrders, email }: any) {
  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'orders'>('details')
  const [editingDetails, setEditingDetails] = useState(false)
  const [fullName, setFullName] = useState(initialProfile.full_name ?? '')
  const [phone, setPhone] = useState(initialProfile.phone ?? '')
  const [savingDetails, setSavingDetails] = useState(false)
  const [addressModal, setAddressModal] = useState<any | null>(null)
  const router = useRouter()

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    const result = await updateProfile(fullName, phone)
    setSavingDetails(false)
    if (!result.error) {
      setEditingDetails(false)
      router.refresh()
    }
  }

  return (
    <div className="profile-layout">
      {/* Sidebar Nav */}
      <aside className="profile-sidebar">
        <button
          onClick={() => setActiveTab('details')}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)', textAlign: 'left',
            background: activeTab === 'details' ? 'var(--surface-elevated)' : 'transparent',
            color: activeTab === 'details' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'details' ? 600 : 500,
            transition: 'all 0.2s'
          }}
        >
          <User size={18} /> Profile Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)', textAlign: 'left',
            background: activeTab === 'addresses' ? 'var(--surface-elevated)' : 'transparent',
            color: activeTab === 'addresses' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'addresses' ? 600 : 500,
            transition: 'all 0.2s'
          }}
        >
          <MapPin size={18} /> Saved Addresses
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)', textAlign: 'left',
            background: activeTab === 'orders' ? 'var(--surface-elevated)' : 'transparent',
            color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'orders' ? 600 : 500,
            transition: 'all 0.2s'
          }}
        >
          <Package size={18} /> Order History
        </button>
      </aside>

      {/* Main Content Pane */}
      <div style={{ flex: 1, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', border: '1px solid var(--surface-border)' }}>

        {activeTab === 'details' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
              Profile Details
              {!editingDetails && (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingDetails(true)}><Edit2 size={14} /> Edit</button>
              )}
            </h2>

            <div className="profile-avatar-row">
              <img src={initialProfile.avatar_url} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{initialProfile.full_name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{email}</div>
              </div>
            </div>

            {editingDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
                <div className="input-wrapper">
                  <label className="input-label">Full name</label>
                  <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Phone number</label>
                  <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={() => { setEditingDetails(false); setFullName(initialProfile.full_name ?? ''); setPhone(initialProfile.phone ?? '') }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveDetails} disabled={savingDetails}>
                    {savingDetails ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-grid">
                <div>
                  <label className="label">Phone Number</label>
                  <div className="input" style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}>
                    {initialProfile.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="input" style={{ background: 'var(--surface-sunken)', color: 'var(--text-secondary)' }}>
                    {email}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
              Saved Addresses
              <button className="btn btn-secondary btn-sm" onClick={() => setAddressModal({})}><Plus size={14} /> Add New</button>
            </h2>

            {initialAddresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                <MapPin size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
                <p>You have no saved addresses yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {initialAddresses.map((addr: any) => (
                  <div key={addr.id} style={{ padding: 'var(--space-4)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <strong style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {addr.label}
                        {addr.is_default && <span className="badge badge-success">Default</span>}
                      </strong>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setAddressModal(addr)}><Edit2 size={14} /></button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                      {addr.full_name}<br/>
                      {addr.address_line1} {addr.address_line2 && `, ${addr.address_line2}`}<br/>
                      {addr.city}, {addr.state} {addr.pincode}<br/>
                      Phone: {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Order History</h2>

            {initialOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-lg)' }}>
                <Package size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {initialOrders.map((order: any) => (
                  <div key={order.id} className="profile-order-card">
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="var(--text-secondary)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{order.shop.name}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', display: 'flex', gap: 'var(--space-3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}</span>
                        <span>Status: <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{order.status}</span></span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>₹{order.total_amount.toLocaleString('en-IN')}</div>
                      <a href={`/${order.shop.slug}/order-success?id=${order.id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }}>
                        View <ExternalLink size={14} style={{ marginLeft: 4 }} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {addressModal && (
        <AddressModal
          profileId={initialProfile.id}
          address={addressModal}
          onClose={() => setAddressModal(null)}
          onSaved={() => { setAddressModal(null); router.refresh() }}
        />
      )}
    </div>
  )
}

function AddressModal({ profileId, address, onClose, onSaved }: { profileId: string; address: any; onClose: () => void; onSaved: () => void }) {
  const [label, setLabel] = useState(address.label ?? 'Home')
  const [fullName, setFullName] = useState(address.full_name ?? '')
  const [phone, setPhone] = useState(address.phone ?? '')
  const [addressLine1, setAddressLine1] = useState(address.address_line1 ?? '')
  const [addressLine2, setAddressLine2] = useState(address.address_line2 ?? '')
  const [city, setCity] = useState(address.city ?? '')
  const [state, setState] = useState(address.state ?? '')
  const [pincode, setPincode] = useState(address.pincode ?? '')
  const [isDefault, setIsDefault] = useState(address.is_default ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const result = await saveAddress(profileId, {
      id: address.id, label, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault,
    })
    setSaving(false)
    if (result.error) { setError(result.error); return }
    onSaved()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{address.id ? 'Edit address' : 'Add address'}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body form-grid">
          <div className="form-grid form-grid-2">
            <div className="input-wrapper">
              <label className="input-label">Label</label>
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home, Work…" />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>
          <div className="input-wrapper">
            <label className="input-label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Address line 1</label>
            <input className="input" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Address line 2 (optional)</label>
            <input className="input" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          </div>
          <div className="form-grid form-grid-3">
            <div className="input-wrapper">
              <label className="input-label">City</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="input-wrapper">
              <label className="input-label">State</label>
              <input className="input" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Pincode</label>
              <input className="input" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            Set as default address
          </label>
          {error && <p className="input-helper error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save address'}
          </button>
        </div>
      </div>
    </div>
  )
}

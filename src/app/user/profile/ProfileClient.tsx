'use client'

import { useState } from 'react'
import { User, MapPin, Package, Edit2, Plus, Clock, ExternalLink } from 'lucide-react'

export default function ProfileClient({ initialProfile, initialAddresses, initialOrders, email }: any) {
  const [activeTab, setActiveTab] = useState<'details' | 'addresses' | 'orders'>('details')

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
              <button className="btn btn-ghost btn-sm"><Edit2 size={14} /> Edit</button>
            </h2>
            
            <div className="profile-avatar-row">
              <img src={initialProfile.avatar_url} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>{initialProfile.full_name}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{email}</div>
              </div>
            </div>

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
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
              Saved Addresses
              <button className="btn btn-secondary btn-sm"><Plus size={14} /> Add New</button>
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
                      <button className="btn btn-ghost btn-sm btn-icon"><Edit2 size={14} /></button>
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
                      <a href={`/${order.shop.slug}/order/${order.id}`} className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }}>
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
    </div>
  )
}

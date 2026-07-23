import React from 'react'
import { ShoppingBag, Star, MessageCircle, Heart, Search, Home, Grid, User } from 'lucide-react'

const products = [
  { name: 'Silk Kurta — Indigo', price: '₹1,499', mrp: '₹2,099', off: '29% off', rating: '4.9' },
  { name: 'Cotton Saree — Rose', price: '₹999', mrp: '₹1,299', off: '23% off', rating: '4.8' },
]

export default function StorefrontMockup() {
  return (
    <div
      className="mock-phone"
      aria-hidden="true"
      style={{
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        borderRadius: '32px',
        border: '8px solid #1e293b',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        background: '#0f172a',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* Phone Header Bar */}
      <div className="mock-phone-header" style={{ padding: '12px 14px', background: '#0b1120', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '13px', display: 'block', color: '#f8fafc' }}>Meera Fashions</span>
          <span style={{ fontSize: '9px', color: '#94a3b8' }}>meerafashions.zcart.space</span>
        </div>
        <span className="mock-phone-cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ShoppingBag size={15} color="#6366f1" />
          <span style={{ background: '#6366f1', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '50%' }}>2</span>
        </span>
      </div>

      {/* Search Input */}
      <div style={{ padding: '8px 12px', background: '#0f172a' }}>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '10px', color: '#94a3b8' }}>
          <Search size={11} /> Search sarees, kurtas & dresses...
        </div>
      </div>

      {/* Sale Banner */}
      <div className="mock-phone-banner" style={{ background: 'linear-gradient(90deg, #4f46e5, #818cf8)', padding: '6px 12px', fontSize: '10px', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Festive Sale is Live</span>
        <span style={{ fontSize: '9px', opacity: 0.9 }}>Ends in 04:12:36</span>
      </div>

      {/* Product Grid */}
      <div className="mock-phone-grid" style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {products.map((p) => (
          <div key={p.name} className="mock-phone-product" style={{ background: '#1e293b', borderRadius: '10px', overflow: 'hidden', padding: '6px' }}>
            <div className="mock-phone-img" style={{ height: '90px', background: '#334155', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '4px' }}>
              <span className="mock-phone-discount" style={{ background: '#ef4444', color: '#fff', fontSize: '8px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>{p.off}</span>
              <Heart size={12} color="#94a3b8" />
            </div>

            <div style={{ marginTop: '6px' }}>
              <span className="mock-phone-title" style={{ fontSize: '10px', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '9px', color: '#f59e0b', margin: '2px 0' }}>
                <Star size={8} fill="#f59e0b" color="#f59e0b" />
                <span>{p.rating}</span>
              </div>
              <div className="mock-phone-price" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <strong style={{ color: '#6366f1' }}>{p.price}</strong>
                <s style={{ fontSize: '8px', color: '#64748b' }}>{p.mrp}</s>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Bar */}
      <div style={{ padding: '8px 10px', display: 'flex', gap: '6px' }}>
        <button style={{ flex: 1, background: '#25d366', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <MessageCircle size={12} /> WhatsApp Order
        </button>
        <button style={{ flex: 1, background: '#6366f1', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '6px' }}>
          Checkout (2)
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div style={{ background: '#0b1120', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '6px 12px', display: 'flex', justifyContent: 'space-around', color: '#94a3b8', fontSize: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#6366f1' }}>
          <Home size={12} /> Home
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Grid size={12} /> Shop
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <User size={12} /> Account
        </div>
      </div>
    </div>
  )
}

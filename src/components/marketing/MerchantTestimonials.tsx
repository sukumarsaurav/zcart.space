import React from 'react'
import { Star, ShieldCheck, MapPin, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Rajesh Sharma',
    shop: 'Sharma Kirana & General Store',
    city: 'Bangalore, Karnataka',
    rating: 5,
    quote: 'POS billing takes under 5 seconds per customer now. The barcode scanner integration and loose quantity pricing saved us hours of daily manual math.',
    tag: 'Grocery & Retail',
  },
  {
    name: 'Meera Kapoor',
    shop: 'Meera Fashions & Boutique',
    city: 'Jaipur, Rajasthan',
    rating: 5,
    quote: 'Our online storefront catalog got us 200+ new Instagram orders in our first month. Having one live stock pool between our shop counter and website is a game-changer.',
    tag: 'Fashion & Apparel',
  },
  {
    name: 'Vikram Patel',
    shop: 'Patel Mobile & Electronics',
    city: 'Ahmedabad, Gujarat',
    rating: 5,
    quote: 'Sending WhatsApp payment reminders with instant UPI links recovered ₹1.5L in outstanding Khata dues within 2 weeks. Plus GST invoices are 100% automatic.',
    tag: 'Electronics & Mobiles',
  },
]

export default function MerchantTestimonials() {
  return (
    <div style={{ padding: 'var(--space-12) 0', background: 'var(--bg-base)' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8)' }}>
          <span style={{ color: 'var(--color-primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>
            Merchant Stories
          </span>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '8px 0 12px' }}>
            Loved by 50,000+ local shop owners across India
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', margin: 0 }}>
            Hear how merchants use Shopz to streamline billing, boost online orders, and collect payments faster.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="card card-hover"
              style={{
                padding: 'var(--space-6)',
                background: 'var(--surface-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                    {t.tag}
                  </span>
                </div>

                <Quote size={20} color="var(--color-primary-400)" style={{ opacity: 0.6, marginBottom: '8px' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: 0 }}>{t.name}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>{t.shop}</p>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={10} color="var(--color-primary-500)" /> {t.city}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

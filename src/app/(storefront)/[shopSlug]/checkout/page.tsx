'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck, MapPin, Phone, User, Loader2, CreditCard } from 'lucide-react'

// Note: Add this script to your global layout or load it dynamically:
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

export default function CheckoutPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const router = useRouter()
  const [shopSlug, setShopSlug] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')

  useEffect(() => {
    params.then((p) => {
      setShopSlug(p.shopSlug)
      const data = JSON.parse(localStorage.getItem(`zcart_cart_${p.shopSlug}`) ?? '[]')
      if (data.length === 0) {
        router.replace(`/${p.shopSlug}/cart`)
      } else {
        setCart(data)
        setLoaded(true)
      }
    })
  }, [params, router])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)

    try {
      // 1. Call our API to create order (and Razorpay order if online)
      const res = await fetch(`/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopSlug,
          cart,
          customer: { name, phone, email },
          shipping: { address, city, state, pincode },
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')

      if (paymentMethod === 'cod') {
        // COD order placed successfully
        localStorage.removeItem(`zcart_cart_${shopSlug}`)
        router.push(`/${shopSlug}/order-success?id=${data.orderId}`)
      } else {
        // Online payment via Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: data.shopName,
          description: `Order #${data.orderId.slice(0, 8).toUpperCase()}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyRes.ok) {
              localStorage.removeItem(`zcart_cart_${shopSlug}`)
              router.push(`/${shopSlug}/order-success?id=${data.orderId}`)
            } else {
              setError('Payment verification failed. Please contact support.')
              setProcessing(false)
            }
          },
          prefill: {
            name, email, contact: phone,
          },
          theme: { color: 'var(--color-primary-500)' },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', function (response: any) {
          setError(response.error.description)
          setProcessing(false)
        })
        rzp.open()
      }
    } catch (err: any) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (!loaded) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      <header style={{
        background: 'var(--surface-card)',
        borderBottom: '1px solid var(--surface-border)',
        padding: 'var(--space-4) var(--space-6)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${shopSlug}/cart`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-success-400)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            <ShieldCheck size={16} /> Secure Checkout
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <form onSubmit={handleCheckout} className="checkout-layout">
          
          {/* Left - Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Contact Details */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <User size={18} color="var(--color-primary-400)" />
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Contact Details</h2>
                </div>
              </div>
              <div className="card-body form-section">
                <div className="input-wrapper">
                  <label className="input-label">Full Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="John Doe" />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="input-wrapper">
                    <label className="input-label">Phone Number *</label>
                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input" placeholder="9876543210" />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Email (Optional)</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="john@example.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MapPin size={18} color="var(--color-info-400)" />
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Shipping Address</h2>
                </div>
              </div>
              <div className="card-body form-section">
                <div className="input-wrapper">
                  <label className="input-label">Street Address *</label>
                  <input required value={address} onChange={e => setAddress(e.target.value)} className="input" placeholder="House/Flat No., Building Name, Street" />
                </div>
                <div className="form-grid form-grid-3">
                  <div className="input-wrapper">
                    <label className="input-label">City *</label>
                    <input required value={city} onChange={e => setCity(e.target.value)} className="input" placeholder="Mumbai" />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">State *</label>
                    <input required value={state} onChange={e => setState(e.target.value)} className="input" placeholder="Maharashtra" />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">PIN Code *</label>
                    <input required value={pincode} onChange={e => setPincode(e.target.value)} className="input" placeholder="400001" maxLength={6} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CreditCard size={18} color="var(--color-success-400)" />
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Payment Method</h2>
                </div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: `1px solid ${paymentMethod === 'online' ? 'var(--color-primary-500)' : 'var(--surface-border)'}`, borderRadius: 'var(--radius-lg)', background: paymentMethod === 'online' ? 'rgba(99,102,241,0.05)' : 'var(--surface-elevated)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} style={{ width: 18, height: 18, accentColor: 'var(--color-primary-500)' }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>Pay Online</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>UPI, Credit/Debit Cards, NetBanking</p>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-primary-500)' : 'var(--surface-border)'}`, borderRadius: 'var(--radius-lg)', background: paymentMethod === 'cod' ? 'rgba(99,102,241,0.05)' : 'var(--surface-elevated)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ width: 18, height: 18, accentColor: 'var(--color-primary-500)' }} />
                  <div>
                    <p style={{ fontWeight: 600 }}>Cash on Delivery (COD)</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right - Summary */}
          <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="card">
              <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Order Summary</h2></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 300, overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
                  {cart.map(i => (
                    <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>{i.quantity}x</span>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{i.name}</span>
                      </div>
                      <span style={{ fontWeight: 500 }}>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: '1px dashed var(--surface-border)', paddingTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span style={{ color: 'var(--color-success-400)' }}>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 800, marginTop: 'var(--space-2)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--color-primary-400)' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={processing} className={`btn btn-primary btn-lg ${processing ? 'btn-loading' : ''}`} style={{ width: '100%', justifyContent: 'center' }}>
              <span className="btn-text">
                {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : `Place Order (₹${total.toLocaleString('en-IN')})`}
              </span>
            </button>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

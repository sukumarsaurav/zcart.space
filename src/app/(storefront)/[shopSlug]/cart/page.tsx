'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShoppingCart, ArrowRight } from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  unit: string
  quantity: number
}

export default function CartPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const [shopSlug, setShopSlug] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    params.then((p) => {
      setShopSlug(p.shopSlug)
      const data = JSON.parse(localStorage.getItem(`zcart_cart_${p.shopSlug}`) ?? '[]')
      setCart(data)
      setLoaded(true)
    })
  }, [params])

  const saveCart = useCallback((items: CartItem[]) => {
    setCart(items)
    localStorage.setItem(`zcart_cart_${shopSlug}`, JSON.stringify(items))
  }, [shopSlug])

  const updateQty = (productId: string, delta: number) => {
    const next = cart.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    saveCart(next)
  }

  const removeItem = (productId: string) => {
    saveCart(cart.filter((i) => i.productId !== productId))
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>Loading…</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={`/${shopSlug}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 800 }}>
            <ArrowLeft size={16} /> Back to shop
          </Link>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{itemCount} items in cart</span>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Your Cart</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-20)', color: 'var(--text-tertiary)' }}>
            <ShoppingCart size={56} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>Your cart is empty</p>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Add products to get started</p>
            <Link href={`/${shopSlug}/products`} className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  {/* Image */}
                  <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--surface-elevated)', flexShrink: 0, position: 'relative' }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{item.name}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>₹{item.price.toLocaleString('en-IN')} per {item.unit}</p>
                  </div>

                  {/* Controls */}
                  <div className="cart-item-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-400)', padding: 4 }} aria-label="Remove item">
                      <Trash2 size={14} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button onClick={() => updateQty(item.productId, -1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ width: 32, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, 1)} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              position: 'sticky', top: 80,
              background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-4)',
            }}>
              <h2 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Order Summary</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <span>Delivery</span>
                  <span style={{ color: 'var(--color-success-400)' }}>Free</span>
                </div>
                <div style={{ height: 1, background: 'var(--surface-border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 800 }}>
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link
                href={`/${shopSlug}/checkout`}
                id="checkout-btn"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-5)',
                  background: 'var(--color-primary-500)', color: '#fff',
                  borderRadius: 'var(--radius-lg)', fontWeight: 700,
                  fontSize: 'var(--text-sm)', textDecoration: 'none',
                }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link href={`/${shopSlug}/products`} style={{
                textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
              }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

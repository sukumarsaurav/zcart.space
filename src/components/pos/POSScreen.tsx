'use client'

import { useState, useCallback, useRef, type KeyboardEvent } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingBag, X, User, CreditCard, Banknote, Smartphone, Check, ScanLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BarcodeScannerModal from '@/components/shared/BarcodeScannerModal'

interface POSProduct {
  id: string
  name: string
  images: string[]
  selling_price: number
  mrp: number
  gst_rate: string
  unit: string
  barcode: string | null
  sku: string | null
  category_id: string | null
  track_inventory: boolean
  categories: { name: string } | null
  inventory: { quantity: number }[]
}

interface CartItem {
  product: POSProduct
  quantity: number
  discount: number
}

interface POSScreenProps {
  shopId: string
  products: POSProduct[]
  categories: { id: string; name: string }[]
}

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
]

export default function POSScreen({ shopId, products, categories }: POSScreenProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountTendered, setAmountTendered] = useState('')
  const [checkoutMode, setCheckoutMode] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanNotice, setScanNotice] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode === search
    const matchCat = !selectedCategory || p.category_id === selectedCategory
    return matchSearch && matchCat
  })

  const addToCart = useCallback((product: POSProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
  }, [])

  const updateQty = useCallback((productId: string, delta: number) => {
    setCart((prev) => prev
      .map((i) => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter((i) => i.quantity > 0)
    )
  }, [])

  // Shared by both scan paths: a physical USB/Bluetooth barcode scanner (which
  // just types the code + Enter into whatever input is focused) and the
  // in-browser camera scanner below.
  const handleBarcodeScanned = useCallback((code: string) => {
    const match = products.find((p) => p.barcode === code)
    if (match) {
      if (match.track_inventory !== false && (match.inventory?.[0]?.quantity ?? 0) === 0) {
        setScanNotice(`"${match.name}" is out of stock`)
      } else {
        addToCart(match)
        setScanNotice(`Added "${match.name}"`)
      }
      setSearch('')
    } else {
      setScanNotice(`No product found for barcode ${code}`)
      setSearch(code)
    }
    setTimeout(() => setScanNotice(null), 2500)
  }, [products, addToCart])

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const code = search.trim()
    if (!code) return
    // Only auto-add on an exact barcode match — a partial name search hitting
    // Enter shouldn't silently add whatever happens to be first in the grid.
    if (products.some((p) => p.barcode === code)) {
      e.preventDefault()
      handleBarcodeScanned(code)
    }
  }

  const handleCameraDetected = useCallback((code: string) => {
    setScannerOpen(false)
    handleBarcodeScanned(code)
  }, [handleBarcodeScanned])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const cartSubtotal = cart.reduce((s, i) => s + i.product.selling_price * i.quantity - i.discount, 0)
  const cartTax = cart.reduce((s, i) => {
    const rate = Number(i.product.gst_rate) / 100
    const lineTotal = i.product.selling_price * i.quantity - i.discount
    return s + (lineTotal * rate) / (1 + rate)
  }, 0)
  const cartTotal = cartSubtotal
  const change = Number(amountTendered) - cartTotal

  const handleCheckout = async () => {
    if (!cart.length) return
    setProcessing(true)
    setError(null)

    const supabase = createClient()

    try {
      // Resolve customer
      let customerId: string | null = null
      if (customerPhone.trim()) {
        const { data: existing } = await supabase
          .from('customers').select('id').eq('shop_id', shopId).eq('phone', customerPhone.trim()).single()
        if (existing) {
          customerId = existing.id
        } else {
          const { data: newCust } = await supabase
            .from('customers').insert({ shop_id: shopId, name: 'Walk-in Customer', phone: customerPhone.trim() }).select('id').single()
          if (newCust) customerId = newCust.id
        }
      }

      // Create order
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        shop_id: shopId,
        customer_id: customerId,
        channel: 'pos',
        status: 'delivered',
        payment_status: 'paid',
        subtotal: cartSubtotal,
        total_amount: cartTotal,
        paid_amount: cartTotal,
        delivery_status: 'not_required',
      }).select('id').single()

      if (orderErr || !order) throw orderErr ?? new Error('Failed to create order')

      // Insert order items
      const items = cart.map((i) => ({
        order_id: order.id,
        shop_id: shopId,
        product_id: i.product.id,
        product_name: i.product.name,
        unit: i.product.unit,
        quantity: i.quantity,
        unit_price: i.product.selling_price,
        mrp: i.product.mrp,
        discount_amount: i.discount,
        gst_rate: i.product.gst_rate,
        line_total: i.product.selling_price * i.quantity - i.discount,
        taxable_amount: i.product.selling_price * i.quantity - i.discount,
      }))
      await supabase.from('order_items').insert(items)

      // Create payment record
      await supabase.from('payments').insert({
        shop_id: shopId,
        order_id: order.id,
        method: paymentMethod,
        amount: cartTotal,
        status: 'paid',
        paid_at: new Date().toISOString(),
        gateway: 'manual',
      })

      // Decrement inventory via ledger entries
      await Promise.all(cart.map((i) =>
        supabase.from('inventory_ledger').insert({
          shop_id: shopId,
          product_id: i.product.id,
          entry_type: 'sale',
          delta: -i.quantity,
          quantity_after: Math.max(0, (i.product.inventory?.[0]?.quantity ?? 0) - i.quantity),
          reference_type: 'order',
          reference_id: order.id,
        })
      ))

      setSuccess(order.id)
      setCart([])
      setCustomerPhone('')
      setAmountTendered('')
      setCheckoutMode(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="pos-layout">
      {/* Mobile Tab Selector */}
      <div className="pos-mobile-toggle">
        <button
          onClick={() => setActiveTab('products')}
          className={`pos-toggle-btn ${activeTab === 'products' ? 'active' : ''}`}
        >
          <ShoppingBag size={16} /> Products ({filteredProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`pos-toggle-btn ${activeTab === 'cart' ? 'active' : ''}`}
        >
          Cart {totalCartQty > 0 && `(${totalCartQty})`}
        </button>
      </div>

      {/* Left — Product browser */}
      <div className={`pos-product-browser ${activeTab === 'cart' ? 'hidden-mobile' : ''}`}>
        {/* Search bar */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <Search size={16} />
              </span>
              <input
                ref={searchRef}
                id="pos-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products or scan barcode…"
                className="input input-icon-left"
                autoFocus
              />
            </div>
            <button
              id="pos-scan-btn"
              onClick={() => setScannerOpen(true)}
              className="btn btn-secondary btn-icon"
              aria-label="Scan barcode with camera"
              title="Scan barcode with camera"
            >
              <ScanLine size={18} />
            </button>
          </div>

          {scanNotice && (
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: scanNotice.startsWith('Added') ? 'var(--color-success-400)' : 'var(--color-warning-400)' }}>
              {scanNotice}
            </p>
          )}

          {/* Categories */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
            >All</button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
                className={`btn btn-sm ${selectedCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexShrink: 0 }}
              >{c.name}</button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)', alignContent: 'start' }}>
          {filteredProducts.map((product) => {
            const stock = product.inventory?.[0]?.quantity ?? 0
            const inCart = cart.find((i) => i.product.id === product.id)
            const outOfStock = product.track_inventory !== false && stock === 0

            return (
              <button
                key={product.id}
                onClick={() => !outOfStock && addToCart(product)}
                disabled={outOfStock}
                id={`pos-product-${product.id}`}
                style={{
                  background: inCart ? 'rgba(99,102,241,0.08)' : 'var(--surface-card)',
                  border: `1px solid ${inCart ? 'rgba(99,102,241,0.4)' : 'var(--surface-border)'}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-3)',
                  cursor: outOfStock ? 'not-allowed' : 'pointer',
                  opacity: outOfStock ? 0.45 : 1,
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
                }}
              >
                {/* Product image */}
                <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', background: 'var(--surface-elevated)', overflow: 'hidden', marginBottom: 4 }}>
                  {product.images?.[0]
                    ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><ShoppingBag size={20} /></div>
                  }
                </div>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.3, color: 'var(--text-primary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {product.name}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: inCart ? 'var(--color-primary-400)' : 'var(--text-primary)' }}>
                    ₹{product.selling_price}
                  </p>
                  {inCart && (
                    <span className="badge badge-primary" style={{ padding: '1px 6px', fontSize: 10 }}>{inCart.quantity}</span>
                  )}
                </div>
                {outOfStock && <span className="badge badge-danger" style={{ fontSize: 10 }}>Out of stock</span>}
              </button>
            )
          })}
          {!filteredProducts.length && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-tertiary)' }}>
              <Search size={32} style={{ margin: '0 auto var(--space-4)' }} />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right — Cart */}
      <div className={`pos-cart-pane ${activeTab === 'products' ? 'hidden-mobile' : ''}`}>
        {/* Success overlay */}
        {success && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50, background: 'var(--surface-card)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)',
          }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={36} color="var(--color-success-400)" />
            </div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Sale Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Order #{success.slice(0, 8).toUpperCase()}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button onClick={() => setSuccess(null)} className="btn btn-primary">New Sale</button>
              <a href={`/orders/${success}`} className="btn btn-secondary">View Order</a>
            </div>
          </div>
        )}

        {/* Cart header */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ShoppingBag size={18} color="var(--color-primary-400)" />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Cart</span>
            {cart.length > 0 && <span className="badge badge-primary" style={{ fontWeight: 700 }}>{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="btn btn-ghost btn-sm btn-danger" style={{ fontSize: 'var(--text-xs)' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!cart.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 'var(--space-3)', color: 'var(--text-tertiary)' }}>
              <ShoppingBag size={40} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>Add products to start billing</p>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-2)' }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{
                  display: 'flex', gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 2,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      ₹{item.product.selling_price} × {item.quantity} = <strong style={{ color: 'var(--text-secondary)' }}>₹{(item.product.selling_price * item.quantity).toFixed(0)}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <button onClick={() => updateQty(item.product.id, -1)} className="btn btn-ghost btn-icon btn-sm"><Minus size={12} /></button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="btn btn-ghost btn-icon btn-sm"><Plus size={12} /></button>
                    <button onClick={() => removeItem(item.product.id)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger-400)' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout panel */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid var(--surface-border)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', background: 'var(--surface-elevated)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                <span>₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-base)', fontWeight: 700, paddingTop: 'var(--space-2)', borderTop: '1px solid var(--surface-border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-primary-400)', fontSize: 'var(--text-xl)' }}>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer phone */}
            <div className="input-wrapper">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}><User size={14} /></span>
                <input
                  id="pos-customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Customer phone (optional)"
                  className="input input-icon-left"
                  style={{ fontSize: 'var(--text-sm)' }}
                />
              </div>
            </div>

            {/* Payment method */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-2)' }}>
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  id={`pos-pay-${id}`}
                  onClick={() => setPaymentMethod(id)}
                  className={`btn btn-sm ${paymentMethod === id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexDirection: 'column', gap: 4, height: 52, padding: 'var(--space-2)' }}
                >
                  <Icon size={16} />
                  <span style={{ fontSize: 10 }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Cash tendered */}
            {paymentMethod === 'cash' && (
              <div className="input-wrapper">
                <input
                  id="pos-tendered"
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  placeholder="Amount tendered"
                  className="input"
                  style={{ fontSize: 'var(--text-sm)' }}
                />
                {Number(amountTendered) >= cartTotal && cartTotal > 0 && (
                  <p className="input-helper" style={{ color: 'var(--color-success-400)', fontWeight: 600 }}>
                    Change: ₹{change.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {error && <p style={{ color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)' }}>{error}</p>}

            {/* Charge button */}
            <button
              id="pos-charge-btn"
              onClick={handleCheckout}
              disabled={processing}
              className={`btn btn-primary btn-lg ${processing ? 'btn-loading' : ''}`}
              style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--text-base)', fontWeight: 700 }}
            >
              <span className="btn-text">
                {processing ? 'Processing…' : `Charge ₹${cartTotal.toFixed(2)}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {scannerOpen && (
        <BarcodeScannerModal onDetected={handleCameraDetected} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  )
}

'use client'

import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingBag, X, User, CreditCard, Banknote, Smartphone, Check, ScanLine, Ticket, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BarcodeScannerModal from '@/components/shared/BarcodeScannerModal'
import ModeSwitcher from '@/components/shared/ModeSwitcher'

import type { ProductBatch } from '@/types/database'

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
  has_batch?: boolean
  has_expiry?: boolean
  min_selling_price: number | null
  categories: { name: string } | null
  inventory: { quantity: number }[]
}

interface CartItem {
  product: POSProduct
  quantity: number
  discount: number
  unitPrice: number
  selectedBatch?: ProductBatch | null
  availableBatches?: ProductBatch[]
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
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'F4') {
        e.preventDefault()
        if (cart.length > 0) setCheckoutMode(true)
      } else if (e.key === 'Escape') {
        if (checkoutMode) {
          setCheckoutMode(false)
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [cart.length, checkoutMode])

  const getCouponDiscount = useCallback((subtotal: number, coupon: any) => {
    if (!coupon) return 0
    if (coupon.discount_type === 'percent') {
      const discount = subtotal * (Number(coupon.discount_value) / 100)
      if (coupon.max_discount !== null) {
        return Math.min(discount, Number(coupon.max_discount))
      }
      return discount
    } else {
      return Math.min(Number(coupon.discount_value), subtotal)
    }
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode === search
    const matchCat = !selectedCategory || p.category_id === selectedCategory
    return matchSearch && matchCat
  })

  const addToCart = useCallback(async (product: POSProduct) => {
    const supabase = createClient()
    const { data: batches } = await supabase
      .from('product_batches')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .gt('quantity', 0)
      .order('created_at', { ascending: true }) // FIFO: oldest batch first

    const availableBatches = (batches ?? []) as ProductBatch[]
    const selectedBatch = availableBatches.length > 0 ? availableBatches[0] : null
    const unitPrice = selectedBatch ? Number(selectedBatch.selling_price) : Number(product.selling_price)

    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1, discount: 0, unitPrice, selectedBatch, availableBatches }]
    })
  }, [])

  const switchBatch = useCallback((productId: string, batchId: string) => {
    setCart((prev) => prev.map((item) => {
      if (item.product.id !== productId) return item
      const newBatch = item.availableBatches?.find((b) => b.id === batchId) ?? null
      const unitPrice = newBatch ? Number(newBatch.selling_price) : Number(item.product.selling_price)
      return { ...item, selectedBatch: newBatch, unitPrice }
    }))
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

  const cartSubtotal = cart.reduce((s, i) => s + (i.unitPrice ?? i.product.selling_price) * i.quantity - i.discount, 0)

  // Calculate dynamic coupon validity and discount
  let couponErrorMsg: string | null = null
  let couponDiscount = 0
  if (appliedCoupon) {
    if (cartSubtotal < Number(appliedCoupon.min_order_value)) {
      couponErrorMsg = `Coupon requires minimum order of ₹${appliedCoupon.min_order_value}`
    } else {
      const calculatedDiscount = getCouponDiscount(cartSubtotal, appliedCoupon)
      // Check if any product goes below floor price
      let floorPriceViolated = false
      for (const item of cart) {
        const item_unit_price = item.unitPrice ?? item.product.selling_price
        const item_total = item_unit_price * item.quantity
        const item_share = item_total / cartSubtotal
        const item_discount = calculatedDiscount * item_share
        const effective_unit_price = (item_total - item_discount) / item.quantity
        if (item.product.min_selling_price !== null && effective_unit_price < Number(item.product.min_selling_price)) {
          couponErrorMsg = `Discount pushes "${item.product.name}" below its minimum selling price (₹${item.product.min_selling_price})`
          floorPriceViolated = true
          break
        }
      }
      if (!floorPriceViolated) {
        couponDiscount = calculatedDiscount
      }
    }
  }

  const cartTax = cart.reduce((s, i) => {
    const rate = Number(i.product.gst_rate) / 100
    const item_unit_price = i.unitPrice ?? i.product.selling_price
    const item_total = item_unit_price * i.quantity - i.discount
    const item_share = cartSubtotal > 0 ? (item_total / cartSubtotal) : 0
    const item_discount = couponDiscount * item_share
    const lineTotal = item_total - item_discount
    return s + (lineTotal * rate) / (1 + rate)
  }, 0)

  const cartTotal = Math.max(0, cartSubtotal - couponDiscount)
  const change = Number(amountTendered) - cartTotal

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    const supabase = createClient()
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('shop_id', shopId)
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !coupon) {
        setCouponError('Invalid coupon code')
        setAppliedCoupon(null)
        return
      }

      // Check dates
      const now = new Date()
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        setCouponError('Coupon is not active yet')
        return
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        setCouponError('Coupon has expired')
        return
      }

      // Check usage limits
      if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
        setCouponError('Coupon limit reached')
        return
      }

      // Check minimum order value
      if (cartSubtotal < Number(coupon.min_order_value)) {
        setCouponError(`Min order value is ₹${coupon.min_order_value}`)
        return
      }

      // Check floor price
      const discount = getCouponDiscount(cartSubtotal, coupon)
      for (const item of cart) {
        const item_total = item.product.selling_price * item.quantity
        const item_share = item_total / cartSubtotal
        const item_discount = discount * item_share
        const effective_unit_price = (item_total - item_discount) / item.quantity
        if (item.product.min_selling_price !== null && effective_unit_price < Number(item.product.min_selling_price)) {
          setCouponError(`Discount pushes "${item.product.name}" below its minimum selling price (₹${item.product.min_selling_price})`)
          return
        }
      }

      setAppliedCoupon(coupon)
      setCouponError(null)
    } catch (err) {
      setCouponError('Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!cart.length) return
    if (appliedCoupon && couponErrorMsg) {
      setError(couponErrorMsg)
      return
    }
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
        discount_amount: couponDiscount,
        total_amount: cartTotal,
        paid_amount: cartTotal,
        delivery_status: 'not_required',
        coupon_id: appliedCoupon?.id || null,
        coupon_code: appliedCoupon?.code || null,
      }).select('id').single()

      if (orderErr || !order) throw orderErr ?? new Error('Failed to create order')

      // Insert order items
      const items = cart.map((i) => {
        const item_unit_price = i.unitPrice ?? i.product.selling_price
        const item_total = item_unit_price * i.quantity - i.discount
        const item_share = cartSubtotal > 0 ? (item_total / cartSubtotal) : 0
        const item_discount = couponDiscount * item_share
        const final_line_total = item_total - item_discount

        return {
          order_id: order.id,
          shop_id: shopId,
          product_id: i.product.id,
          product_name: i.product.name,
          unit: i.product.unit,
          quantity: i.quantity,
          unit_price: item_unit_price,
          mrp: i.selectedBatch?.mrp ?? i.product.mrp,
          discount_amount: i.discount + item_discount,
          gst_rate: i.product.gst_rate,
          line_total: final_line_total,
          taxable_amount: final_line_total,
        }
      })
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

      // Decrement inventory via ledger entries and deduct batch quantity
      await Promise.all(cart.map(async (i) => {
        await supabase.from('inventory_ledger').insert({
          shop_id: shopId,
          product_id: i.product.id,
          entry_type: 'sale',
          delta: -i.quantity,
          quantity_after: Math.max(0, (i.product.inventory?.[0]?.quantity ?? 0) - i.quantity),
          reference_type: 'order',
          reference_id: order.id,
        })

        if (i.selectedBatch?.id) {
          const { data: b } = await supabase
            .from('product_batches')
            .select('quantity')
            .eq('id', i.selectedBatch.id)
            .single()
          const currentBatchQty = Number(b?.quantity ?? i.selectedBatch.quantity)
          await supabase
            .from('product_batches')
            .update({ quantity: Math.max(0, currentBatchQty - i.quantity) })
            .eq('id', i.selectedBatch.id)
        }
      }))

      // Increment coupon usage count
      if (appliedCoupon) {
        const { data: latestCoupon } = await supabase
          .from('coupons')
          .select('usage_count')
          .eq('id', appliedCoupon.id)
          .single()
        const currentUsage = latestCoupon?.usage_count ?? 0
        await supabase
          .from('coupons')
          .update({ usage_count: currentUsage + 1 })
          .eq('id', appliedCoupon.id)
      }

      setSuccess(order.id)
      setCart([])
      setCustomerPhone('')
      setAmountTendered('')
      setAppliedCoupon(null)
      setCouponCode('')
      setCheckoutMode(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  // POS Keyboard Shortcuts (F1: Search, F2: Charge, F4: Cycle Payment, Esc: Clear)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase()
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea'

      if (e.key === 'F1' || (e.key === '/' && !isInputFocused)) {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'F2' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault()
        if (cart.length > 0 && !processing) {
          handleCheckout()
        }
      } else if (e.key === 'F4') {
        e.preventDefault()
        setPaymentMethod((prev) => (prev === 'cash' ? 'upi' : prev === 'upi' ? 'card' : 'cash'))
      } else if (e.key === 'Escape') {
        if (scannerOpen) setScannerOpen(false)
        else setSearch('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart, processing, scannerOpen, handleCheckout])

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
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>₹{item.unitPrice ?? item.product.selling_price} × {item.quantity} = <strong style={{ color: 'var(--text-secondary)' }}>₹{((item.unitPrice ?? item.product.selling_price) * item.quantity).toFixed(0)}</strong></span>
                      {item.product.min_selling_price !== null && (
                        <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                          Floor: ₹{item.product.min_selling_price}
                        </span>
                      )}
                    </p>
                    {item.availableBatches && item.availableBatches.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <select
                          className="input select"
                          style={{ fontSize: 11, padding: '2px 6px', height: 24, borderRadius: 4, width: 'auto', background: 'var(--surface-elevated)' }}
                          value={item.selectedBatch?.id || ''}
                          onChange={(e) => switchBatch(item.product.id, e.target.value)}
                        >
                          {item.availableBatches.map((b) => (
                            <option key={b.id} value={b.id}>
                              Batch: {b.batch_number} — ₹{b.selling_price} ({b.quantity} left)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <button onClick={() => updateQty(item.product.id, -1)} className="btn btn-ghost btn-icon touch-target" style={{ width: 36, height: 36 }} aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} className="btn btn-ghost btn-icon touch-target" style={{ width: 36, height: 36 }} aria-label="Increase quantity"><Plus size={14} /></button>
                    <button onClick={() => removeItem(item.product.id)} className="btn btn-ghost btn-icon touch-target" style={{ width: 36, height: 36, color: 'var(--color-danger-400)' }} aria-label="Remove item"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile floating mini-cart bar */}
        {cart.length > 0 && activeTab === 'products' && (
          <div
            onClick={() => setActiveTab('cart')}
            className="md:hidden"
            style={{
              position: 'fixed',
              bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
              left: '16px',
              right: '16px',
              zIndex: 100,
              background: 'var(--color-primary-500)',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xl)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} />
              <span style={{ fontSize: '14px' }}>
                {totalCartQty} {totalCartQty === 1 ? 'item' : 'items'} · ₹{cartTotal.toFixed(0)}
              </span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              View Cart →
            </span>
          </div>
        )}

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
              {appliedCoupon && !couponErrorMsg && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,197,94,0.08)', border: '1px dashed rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ticket size={14} color="var(--color-success-500)" />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-success-500)' }}>{appliedCoupon.code}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                      (-₹{couponDiscount.toFixed(2)})
                    </span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              )}
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

            {/* Promo Code Input */}
            {!appliedCoupon ? (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                      <Ticket size={14} />
                    </span>
                    <input
                      id="pos-coupon-code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="input input-icon-left"
                      style={{ fontSize: 'var(--text-sm)' }}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="btn btn-secondary"
                    style={{ height: 42, padding: '0 var(--space-4)' }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p style={{ color: 'var(--color-danger-400)', fontSize: 11, margin: 0 }}>{couponError}</p>
                )}
              </div>
            ) : null}
            {appliedCoupon && couponErrorMsg && (
              <p style={{ color: 'var(--color-danger-400)', fontSize: 11, margin: 0 }}>{couponErrorMsg}</p>
            )}

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
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => setAmountTendered(String(Math.ceil(cartTotal)))}
                    style={{ fontSize: 11, padding: '3px 8px' }}
                  >
                    Exact (₹{Math.ceil(cartTotal)})
                  </button>
                  {[100, 200, 500, 2000].map((denom) => {
                    if (denom < Math.ceil(cartTotal) && cartTotal > 0) return null
                    return (
                      <button
                        key={denom}
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={() => setAmountTendered(String(denom))}
                        style={{ fontSize: 11, padding: '3px 8px' }}
                      >
                        ₹{denom}
                      </button>
                    )
                  })}
                </div>
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

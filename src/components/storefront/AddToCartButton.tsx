'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    selling_price: number
    images: string[]
    unit: string
  }
  shopSlug: string
  primaryColor: string
  disabled?: boolean
}

export default function AddToCartButton({ product, shopSlug, primaryColor, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    // Get existing cart from localStorage
    const storageKey = `zcart_cart_${shopSlug}`
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]')

    const idx = existing.findIndex((i: any) => i.productId === product.id)
    if (idx >= 0) {
      existing[idx].quantity += quantity
    } else {
      existing.push({
        productId: product.id,
        name: product.name,
        price: product.selling_price,
        image: product.images?.[0] ?? null,
        unit: product.unit,
        quantity,
      })
    }

    localStorage.setItem(storageKey, JSON.stringify(existing))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)

    // Dispatch custom event so cart page can react
    window.dispatchEvent(new CustomEvent('cart-updated'))
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Quantity */}
      <div style={{
        display: 'flex', alignItems: 'center', border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      }}>
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          style={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          }}
          aria-label="Decrease quantity"
        >
          <Minus size={15} />
        </button>
        <span style={{ width: 48, textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          style={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
          }}
          aria-label="Increase quantity"
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={disabled}
        id="add-to-cart-btn"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-6)',
          background: disabled ? 'var(--surface-elevated)' : primaryColor,
          color: disabled ? 'var(--text-tertiary)' : '#fff',
          border: 'none', borderRadius: 'var(--radius-lg)',
          fontSize: 'var(--text-sm)', fontWeight: 700,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
          minHeight: 44,
        }}
      >
        <ShoppingCart size={16} />
        {added ? 'Added!' : disabled ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}

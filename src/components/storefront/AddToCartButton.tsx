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
  variantId?: string | null
  variantName?: string | null
  validate?: () => boolean
}

export default function AddToCartButton({ product, shopSlug, primaryColor, disabled, variantId, variantName, validate }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (validate && !validate()) return

    // Get existing cart from localStorage
    const storageKey = `zcart_cart_${shopSlug}`
    const existing = JSON.parse(localStorage.getItem(storageKey) ?? '[]')

    const idx = existing.findIndex((i: any) => i.productId === product.id && (i.variantId ?? null) === (variantId ?? null))
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
        variantId: variantId ?? null,
        variantName: variantName ?? null,
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
      <div className="sf-quantity-stepper">
        <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
          <Minus size={15} />
        </button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
          <Plus size={15} />
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={disabled}
        id="add-to-cart-btn"
        className="sf-cta-primary"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-6)',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          minHeight: 44,
          background: disabled ? 'var(--sf-surface-raised, var(--surface-elevated))' : undefined,
          color: disabled ? 'var(--sf-text-tertiary, var(--text-tertiary))' : undefined,
        }}
      >
        <ShoppingCart size={16} />
        {added ? 'Added!' : disabled ? 'Out of Stock' : 'Buy Now'}
      </button>
    </div>
  )
}

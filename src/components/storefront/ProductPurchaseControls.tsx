'use client'

import { useState } from 'react'
import { Ruler, X } from 'lucide-react'
import AddToCartButton from './AddToCartButton'
import WishlistButton from './WishlistButton'

interface Variant {
  id: string
  name: string
  is_active: boolean
}

interface ProductPurchaseControlsProps {
  product: {
    id: string
    name: string
    selling_price: number
    images: string[]
    unit: string
  }
  shopSlug: string
  primaryColor: string
  outOfStock: boolean
  variants: Variant[]
  initialWishlisted: boolean
}

export default function ProductPurchaseControls({ product, shopSlug, primaryColor, outOfStock, variants, initialWishlisted }: ProductPurchaseControlsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showSelectPrompt, setShowSelectPrompt] = useState(false)

  const requiresVariant = variants.length > 0
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null

  const validate = () => {
    if (requiresVariant && !selectedVariant) {
      setShowSelectPrompt(true)
      return false
    }
    return true
  }

  return (
    <>
      {requiresVariant && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--sf-text-secondary)' }}>Size</span>
            <button
              type="button"
              onClick={() => setShowSizeGuide(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--sf-text-secondary)' }}
            >
              <Ruler size={13} /> Size Guide
            </button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.is_active}
                onClick={() => { setSelectedVariantId(v.id); setShowSelectPrompt(false) }}
                className={`sf-size-swatch ${!v.is_active ? 'unavailable' : v.id === selectedVariantId ? 'selected' : ''}`}
              >
                {v.name}
              </button>
            ))}
          </div>
          {showSelectPrompt && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-400)', marginTop: 'var(--space-2)' }}>
              Please select a size before adding to cart.
            </p>
          )}
        </div>
      )}

      <AddToCartButton
        product={product}
        shopSlug={shopSlug}
        primaryColor={primaryColor}
        disabled={outOfStock}
        variantId={selectedVariant?.id}
        variantName={selectedVariant?.name}
        validate={validate}
      />

      {/* Sticky bottom bar (mobile) — shares the same size selection above via position:fixed */}
      <div className="sf-sticky-bottom-bar">
        <WishlistButton shopSlug={shopSlug} productId={product.id} initialWishlisted={initialWishlisted} size={18} className="sf-icon-btn" />
        <div style={{ flex: 1 }}>
          <AddToCartButton
            product={product}
            shopSlug={shopSlug}
            primaryColor={primaryColor}
            disabled={outOfStock}
            variantId={selectedVariant?.id}
            variantName={selectedVariant?.name}
            validate={validate}
          />
        </div>
      </div>

      {showSizeGuide && (
        <div className="modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Size Guide</h3>
              <button onClick={() => setShowSizeGuide(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <table className="table">
                <thead>
                  <tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr>
                </thead>
                <tbody>
                  <tr><td>S</td><td>36–38</td><td>27</td></tr>
                  <tr><td>M</td><td>39–41</td><td>28</td></tr>
                  <tr><td>L</td><td>42–44</td><td>29</td></tr>
                  <tr><td>XL</td><td>45–47</td><td>30</td></tr>
                </tbody>
              </table>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--sf-text-secondary)', marginTop: 'var(--space-3)' }}>
                Measurements are approximate and may vary slightly by style.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

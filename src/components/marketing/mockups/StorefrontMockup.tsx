import { ShoppingBag } from 'lucide-react'

/**
 * Static phone-frame preview of the customer storefront, in the real
 * storefront theme: dark surface, gold accent, serif shop name, MRP
 * strike-through pricing and sale banner (see (storefront)/[shopSlug]).
 */

const products = [
  { name: 'Silk Kurta — Indigo', price: '₹1,499', mrp: '₹2,099', off: '29% off' },
  { name: 'Cotton Saree — Rose', price: '₹999', mrp: '₹1,299', off: '23% off' },
]

export default function StorefrontMockup() {
  return (
    <div className="mock-phone" aria-hidden="true">
      <div className="mock-phone-header">
        <span>Meera Fashions</span>
        <span className="mock-phone-cart">
          <ShoppingBag size={15} />
          <span>2</span>
        </span>
      </div>
      <div className="mock-phone-banner">
        <span>Festive Sale is live</span>
        <span>ends in 04:12:36</span>
      </div>
      <div className="mock-phone-grid">
        {products.map((p) => (
          <div key={p.name} className="mock-phone-product">
            <div className="mock-phone-img">
              <span className="mock-phone-discount">{p.off}</span>
            </div>
            <span className="mock-phone-title">{p.name}</span>
            <span className="mock-phone-price">
              <strong>{p.price}</strong>
              <s>{p.mrp}</s>
              <span className="mock-phone-pill">{p.off}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="mock-phone-cta">Add to cart</div>
    </div>
  )
}

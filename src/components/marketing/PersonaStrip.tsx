import { Shirt, Utensils, Pill, Smartphone, ShoppingBasket, Gem, Coffee, Wrench } from 'lucide-react'

const personas = [
  { icon: ShoppingBasket, label: 'Kirana & Grocery' },
  { icon: Shirt, label: 'Fashion & Apparel' },
  { icon: Smartphone, label: 'Electronics' },
  { icon: Pill, label: 'Pharmacy' },
  { icon: Utensils, label: 'Restaurants & Cafés' },
  { icon: Gem, label: 'Jewellery' },
  { icon: Coffee, label: 'Bakery & Sweets' },
  { icon: Wrench, label: 'Hardware & Tools' },
]

export default function PersonaStrip() {
  const doubled = [...personas, ...personas]
  return (
    <div className="mkt-persona-track">
      <div>
        {doubled.map((p, i) => (
          <div key={`${p.label}-${i}`} className="mkt-persona-chip">
            <p.icon size={16} color="var(--color-primary-400)" />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  )
}

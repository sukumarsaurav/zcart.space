import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Storefront demo', href: '/demo-store' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/' },
      { label: 'Contact', href: 'mailto:hello@zcart.space' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/' },
      { label: 'Terms of Service', href: '/' },
    ],
  },
]

export default function MarketingFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-footer-grid">
        <div>
          <div className="mkt-logo">
            <span className="mkt-logo-mark mkt-logo-mark--sm">
              <ShoppingBag size={15} />
            </span>
            <span className="gradient-text">zCart</span>
          </div>
          <p className="mkt-footer-tagline">
            The all-in-one platform for India&apos;s local shops — storefront, POS, inventory, and GST invoicing in one place.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mkt-footer-col-title">{col.title}</p>
            <div className="mkt-footer-links">
              {col.links.map((l) => (
                <Link key={l.label} href={l.href}>{l.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mkt-footer-bottom">
        <p>© 2026 zCart. Built for India&apos;s local businesses.</p>
      </div>
    </footer>
  )
}

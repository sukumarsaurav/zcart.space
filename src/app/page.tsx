import Link from 'next/link'
import {
  Package, Receipt, Shield, Globe, ArrowRight,
  Store, MessageCircle, Building2, UserPlus, Palette, Rocket,
  Barcode, Bot, FileCheck2, Wallet, Headphones, RefreshCw, CloudCog, MapPinned,
} from 'lucide-react'
import type { Metadata } from 'next'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PricingSection from '@/components/marketing/PricingSection'
import FaqAccordion from '@/components/marketing/FaqAccordion'
import AlternatingFeature from '@/components/marketing/AlternatingFeature'
import PersonaStrip from '@/components/marketing/PersonaStrip'
import DashboardMockup from '@/components/marketing/mockups/DashboardMockup'
import InvoiceMockup from '@/components/marketing/mockups/InvoiceMockup'
import InventoryMockup from '@/components/marketing/mockups/InventoryMockup'
import StorefrontMockup from '@/components/marketing/mockups/StorefrontMockup'
import { getPlansWithFeatures } from '@/lib/plans'

export const metadata: Metadata = {
  title: 'zCart — The all-in-one platform for local shops',
}

const steps = [
  { icon: UserPlus, title: 'Create your shop', description: 'Sign up free and set up your shop profile — name, GSTIN, and location — in under 2 minutes.' },
  { icon: Palette, title: 'Add products & pick a theme', description: 'Upload your catalogue and choose a storefront theme. No design or coding needed.' },
  { icon: Rocket, title: 'Start selling everywhere', description: 'Go live online, bill at the counter with POS, and take orders over WhatsApp — all from one dashboard.' },
]

const deepDives = [
  {
    icon: Receipt,
    eyebrow: 'Billing & compliance',
    title: 'GST invoicing that just works',
    description: 'Every sale — online or at the counter — generates a GST-compliant PDF invoice automatically, with correct HSN codes and CGST/SGST/IGST breakup, numbered without gaps.',
    bullets: ['Auto-numbered invoices per financial year', 'HSN codes & tax breakup built in', 'Downloadable PDF, sent to customers by email', 'GST summary reports for filing'],
    visual: <InvoiceMockup />,
  },
  {
    icon: Package,
    eyebrow: 'Inventory',
    title: 'One stock pool, every channel',
    description: 'Online orders, POS sales, and WhatsApp orders all draw from the same live inventory ledger — so you never oversell, and low-stock alerts fire before you run out.',
    bullets: ['Real-time stock sync across channels', 'Multi-location stock tracking', 'Low-stock alerts with reorder points', 'Immutable inventory ledger for full audit trail'],
    imageOnLeft: true,
    visual: <InventoryMockup />,
  },
  {
    icon: Globe,
    eyebrow: 'Storefront & sales',
    title: 'A real online store, live in minutes',
    description: 'A branded, mobile-first storefront with premium themes, product variants, and sale pages — plus counter billing on any tablet, so your shop sells everywhere your customers are.',
    bullets: ['Mobile-first storefront themes', 'Barcode-ready POS billing', 'Product size/colour variants', 'Custom domain support'],
    visual: <StorefrontMockup />,
  },
]

const highlights = [
  { icon: Barcode, title: 'Barcode-ready POS', description: 'Scan and bill in seconds at the counter, on any tablet or laptop.' },
  { icon: Bot, title: 'Smart low-stock alerts', description: 'Get flagged before you run out, based on per-product reorder points.' },
  { icon: FileCheck2, title: 'GST-compliant by default', description: 'Every invoice is generated correctly, automatically, every time.' },
  { icon: Wallet, title: 'Flexible payments', description: 'Accept UPI, cards, and Cash on Delivery — or run a digital khata.' },
]

const channels = [
  { icon: Globe, title: 'Online storefront', description: 'A branded, mobile-first storefront with your own theme and (optionally) custom domain.' },
  { icon: Store, title: 'In-store POS', description: 'Fast counter billing on any tablet or laptop, sharing the same product catalogue and stock.' },
  { icon: MessageCircle, title: 'WhatsApp orders', description: 'Take and log orders that come in over WhatsApp, tracked in the same order pipeline.' },
  { icon: Building2, title: 'Marketplace-ready', description: 'One inventory pool so you never oversell across channels.' },
]

const whyChoose = [
  { icon: Headphones, title: 'Real support', description: 'Reach a human when something breaks, not a bot loop.' },
  { icon: RefreshCw, title: 'Shipped continuously', description: 'New features roll out regularly, no separate upgrade needed.' },
  { icon: CloudCog, title: 'Real-time sync', description: 'Every channel reads from the same live data, always current.' },
  { icon: MapPinned, title: 'Access anywhere', description: 'It\'s a web app — run your shop from any device, any location.' },
]

const faqs = [
  { question: 'Do I need an existing website to use zCart?', answer: 'No. zCart gives you a complete storefront, so you can start selling online without any prior website or technical setup.' },
  { question: 'Can I switch plans later?', answer: 'Yes, you can upgrade or downgrade your plan at any time from your dashboard settings. Changes apply from your next billing cycle.' },
  { question: 'Is my shop’s data isolated from other shops on the platform?', answer: 'Yes. Every shop’s data — products, orders, customers — is isolated at the database level, so no other shop on the platform can ever read or modify your data.' },
  { question: 'What payment methods can my customers use at checkout?', answer: 'Customers can pay online via UPI, cards, and other methods through your configured payment gateway, or choose Cash on Delivery.' },
  { question: 'Is there a setup fee?', answer: 'No setup fees. The Free plan has no cost at all, and paid plans are billed monthly or yearly with no hidden charges.' },
]

export default async function LandingPage() {
  const plans = await getPlansWithFeatures()
  const teaserPlans = plans.filter((p) => p.key !== 'enterprise')

  return (
    <div data-marketing-theme="royal" className="mkt-page">
      <MarketingNav />

      {/* Hero — copy beside the actual merchant dashboard */}
      <section className="mkt-section">
        <div className="mkt-split mkt-split--hero">
          <div>
            <span className="badge badge-primary badge-dot mkt-hero-badge">
              Built for Indian local businesses
            </span>
            <h1 className="mkt-hero-title">
              Run your entire shop<br />
              <span className="gradient-text">from one place</span>
            </h1>
            <p className="mkt-hero-sub">
              Online store, POS billing, unified inventory, and GST invoicing — all in one platform built for India&apos;s local shops.
            </p>
            <div className="mkt-cta-row">
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start for free <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="btn btn-secondary btn-lg">See pricing</Link>
            </div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      {/* Persona strip */}
      <section className="mkt-persona-band">
        <PersonaStrip />
      </section>

      {/* How it works */}
      <section className="mkt-section">
        <div className="mkt-section-head">
          <span className="mkt-eyebrow">Getting started</span>
          <h2 className="mkt-h2">How it works</h2>
          <p className="mkt-lead">Live in three steps, no developer required.</p>
        </div>
        <div className="mkt-grid-loose">
          {steps.map((s, i) => (
            <div key={s.title} className="mkt-step">
              <div className="mkt-step-num">{i + 1}</div>
              <s.icon size={22} className="mkt-step-icon" />
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep-dive alternating feature sections */}
      <section id="features" className="mkt-section mkt-deep-dives">
        {deepDives.map((d) => (
          <AlternatingFeature key={d.title} {...d} />
        ))}
      </section>

      {/* Highlights grid */}
      <section className="mkt-section">
        <div className="mkt-section-head">
          <h2 className="mkt-h2">Built for the counter and the checkout</h2>
          <p className="mkt-lead">The daily details that keep a shop running smoothly.</p>
        </div>
        <div className="mkt-grid-cards">
          {highlights.map((h) => (
            <div key={h.title} className="card card-hover mkt-feature-card">
              <div className="mkt-icon-chip mkt-icon-chip--accent">
                <h.icon size={20} />
              </div>
              <h3>{h.title}</h3>
              <p>{h.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Channels */}
      <section className="mkt-section mkt-section--tight">
        <div className="mkt-section-head">
          <h2 className="mkt-h2">Sell wherever your customers are</h2>
          <p className="mkt-lead">One catalogue and one stock pool, across every channel.</p>
        </div>
        <div className="mkt-grid-cards">
          {channels.map((c) => (
            <div key={c.title} className="card card-hover mkt-feature-card">
              <div className="mkt-icon-chip mkt-icon-chip--primary">
                <c.icon size={20} />
              </div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="mkt-section mkt-section--tight">
        <div className="mkt-section-head">
          <h2 className="mkt-h2">Why shop owners choose zCart</h2>
        </div>
        <div className="mkt-grid-loose">
          {whyChoose.map((w) => (
            <div key={w.title} className="mkt-centered-card">
              <div className="mkt-icon-chip mkt-icon-chip--gradient">
                <w.icon size={22} />
              </div>
              <h3>{w.title}</h3>
              <p>{w.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mkt-section">
        <div className="mkt-section-head">
          <h2 className="mkt-h2">Simple pricing</h2>
          <p className="mkt-lead">Start free. Upgrade when you grow.</p>
        </div>
        {teaserPlans.length > 0 && <PricingSection plans={teaserPlans} />}
        <div className="mkt-section-foot">
          <Link href="/pricing" className="btn btn-ghost">
            Compare all plans & features <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mkt-section mkt-section--tight">
        <div className="mkt-section-head">
          <h2 className="mkt-h2">Frequently asked questions</h2>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      {/* CTA */}
      <section className="mkt-section">
        <div className="mkt-cta-panel">
          <div className="mkt-cta-kicker">
            <Shield size={20} />
            <span>Get started in 5 minutes</span>
          </div>
          <h2>Ready to modernize your shop?</h2>
          <p>Join local shop owners already running their business on zCart.</p>
          <Link href="/signup" className="btn btn-primary btn-lg">
            Create your free shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

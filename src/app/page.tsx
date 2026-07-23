import Link from 'next/link'
import {
  Package, Receipt, Shield, Globe, ArrowRight, Star,
  Store, MessageCircle, Building2, UserPlus, Palette, Rocket,
  Barcode, Bot, FileCheck2, Wallet, Headphones, RefreshCw, CloudCog, MapPinned,
  Sparkles, CheckCircle2, Play
} from 'lucide-react'
import type { Metadata } from 'next'
import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import PricingSection from '@/components/marketing/PricingSection'
import FaqAccordion from '@/components/marketing/FaqAccordion'
import AlternatingFeature from '@/components/marketing/AlternatingFeature'
import PersonaStrip from '@/components/marketing/PersonaStrip'
import TrustStatsBand from '@/components/marketing/TrustStatsBand'
import InteractiveFeatureShowcase from '@/components/marketing/InteractiveFeatureShowcase'
import CategorySolutions from '@/components/marketing/CategorySolutions'
import MerchantTestimonials from '@/components/marketing/MerchantTestimonials'
import StickyFloatingCta from '@/components/marketing/StickyFloatingCta'
import DashboardMockup from '@/components/marketing/mockups/DashboardMockup'
import InvoiceMockup from '@/components/marketing/mockups/InvoiceMockup'
import InventoryMockup from '@/components/marketing/mockups/InventoryMockup'
import StorefrontMockup from '@/components/marketing/mockups/StorefrontMockup'
import FeatureComparisonTable from '@/components/marketing/FeatureComparisonTable'
import { getPlansWithFeatures, getFullPricingData } from '@/lib/plans'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'zCart — The All-in-One Operating System for Indian Local Shops',
  description: 'Online store, speed POS billing, unified inventory ledger, and GST invoicing — built specifically for India\'s retail and wholesale merchants.',
}

const steps = [
  { icon: UserPlus, title: 'Create your free shop', description: 'Sign up in 60 seconds. Input your shop name, location, and GSTIN — no technical setup or developer required.' },
  { icon: Palette, title: 'Add products & pick a theme', description: 'Upload your product catalog or import via Excel/POS. Choose a mobile-first storefront theme.' },
  { icon: Rocket, title: 'Sell online, counter & WhatsApp', description: 'Bill customers at the counter, accept online orders, and log WhatsApp sales — all drawing from one live stock pool.' },
]

const deepDives = [
  {
    icon: Receipt,
    eyebrow: 'Billing & Compliance',
    title: '100% Tax-Compliant GST Invoicing',
    description: 'Every sale — counter POS, online storefront, or WhatsApp order — generates a gap-free GST PDF invoice instantly with exact HSN tax codes.',
    bullets: ['Auto-numbered financial year series', 'HSN & SAC code catalog library', 'Instant PDF share via WhatsApp & Email', 'GSTR-1 & GSTR-3B tax export reports'],
    visual: <InvoiceMockup />,
  },
  {
    icon: Package,
    eyebrow: 'Inventory Management',
    title: 'One Live Stock Pool Across Every Channel',
    description: 'Counter sales, online storefront orders, and WhatsApp sales deduct from the same central inventory ledger in real-time.',
    bullets: ['Real-time stock ledger synchronization', 'Batch number & expiry date tracking', 'Low-stock warnings with reorder thresholds', 'Multi-godown & shop location tracking'],
    imageOnLeft: true,
    visual: <InventoryMockup />,
  },
  {
    icon: Globe,
    eyebrow: 'Digital Storefront',
    title: 'Your Branded E-Commerce Storefront in Minutes',
    description: 'Give your local shop a mobile-first online presence with custom themes, product variants, and direct WhatsApp checkout.',
    bullets: ['Mobile-optimized storefront themes', 'Custom domain support (yourname.com)', 'Product size, colour & attribute variants', 'Seamless online payment gateway checkout'],
    visual: <StorefrontMockup />,
  },
]

const whyChoose = [
  { icon: Headphones, title: 'Dedicated Human Support', description: 'Reach our team on WhatsApp or phone whenever you need guidance.' },
  { icon: RefreshCw, title: 'Continuous Feature Updates', description: 'New enhancements roll out automatically at zero extra cost.' },
  { icon: CloudCog, title: 'Real-Time Sync', description: 'Zero lag between counter POS billing and online storefront inventory.' },
  { icon: MapPinned, title: 'Access from Any Device', description: 'Cloud web application — access your shop dashboard from mobile, tablet, or PC.' },
]

const faqs = [
  { question: 'Do I need technical skills or a developer to set up zCart?', answer: 'No! zCart is designed for local shop owners. You can launch your shop, add products, and start billing in under 5 minutes without any technical knowledge.' },
  { question: 'Does zCart support barcode scanners and thermal printers?', answer: 'Yes. zCart POS works with any standard USB/Bluetooth barcode scanner and thermal receipt printer on laptop, tablet, or desktop.' },
  { question: 'How does zCart keep my shop\'s inventory in sync?', answer: 'zCart uses a single live stock database. When an item is sold at the counter POS, online storefront, or via WhatsApp, the inventory count decreases everywhere instantly.' },
  { question: 'Can I issue GST tax invoices and export GSTR reports?', answer: 'Yes! zCart handles CGST, SGST, and IGST calculations automatically, inserts HSN codes, and exports clean tax reports for your accountant or CA.' },
  { question: 'Is there any commitment or setup fee?', answer: 'None at all. The Free plan is 100% free forever with no credit card required. Upgrade to paid plans anytime as your shop grows.' },
]

export default async function LandingPage() {
  const [plans, fullPricing] = await Promise.all([
    getPlansWithFeatures(),
    getFullPricingData(),
  ])
  const teaserPlans = plans.filter((p) => p.key !== 'enterprise')

  return (
    <div data-marketing-theme="royal" className="mkt-page">
      <MarketingNav />

      {/* Hero Section */}
      <section className="mkt-section" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
        <div className="mkt-split mkt-split--hero">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: '16px' }}>
              <Sparkles size={14} color="var(--color-primary-400)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-400)' }}>
                4.9★ Rated Platform for Indian Merchants
              </span>
            </div>

            <h1 className="mkt-hero-title" style={{ fontSize: 'var(--text-4xl)', fontWeight: 900, lineHeight: 1.15, marginBottom: '16px' }}>
              Run your entire shop<br />
              <span className="gradient-text">from one place</span>
            </h1>

            <p className="mkt-hero-sub" style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              Online store, speed POS billing, live inventory ledger, and GST invoicing — all in one platform built for India&apos;s local retail & wholesale merchants.
            </p>

            <div className="mkt-cta-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <Link href="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-full)', padding: '14px 28px', gap: '8px', fontWeight: 700 }}>
                Start For Free <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn btn-secondary btn-lg" style={{ borderRadius: 'var(--radius-full)', padding: '14px 24px', gap: '8px' }}>
                <Play size={16} fill="currentColor" /> Try Live Storefront Demo
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} color="var(--color-success-500)" /> No credit card needed</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} color="var(--color-success-500)" /> Free plan available</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} color="var(--color-success-500)" /> Setup in 2 mins</span>
            </div>
          </div>

          <DashboardMockup />
        </div>
      </section>

      {/* Trust & Social Proof Metrics Band */}
      <TrustStatsBand />

      {/* Interactive Feature Showcase */}
      <InteractiveFeatureShowcase />

      {/* Tailored Category Solutions */}
      <CategorySolutions />

      {/* Persona Strip */}
      <section className="mkt-persona-band">
        <PersonaStrip />
      </section>

      {/* 3-Step Onboarding */}
      <section className="mkt-section">
        <div className="mkt-section-head" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="mkt-eyebrow" style={{ color: 'var(--color-primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simple Onboarding</span>
          <h2 className="mkt-h2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>How it works</h2>
          <p className="mkt-lead" style={{ color: 'var(--text-secondary)' }}>Live in three steps. Zero developer or design work required.</p>
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

      {/* Deep-Dive Alternating Features */}
      <section id="features" className="mkt-section mkt-deep-dives">
        {deepDives.map((d) => (
          <AlternatingFeature key={d.title} {...d} />
        ))}
      </section>

      {/* Why Shop Owners Choose Us */}
      <section className="mkt-section mkt-section--tight">
        <div className="mkt-section-head" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h2 className="mkt-h2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Why merchants choose zCart over legacy desktop apps</h2>
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

      {/* Merchant Testimonials */}
      <MerchantTestimonials />

      {/* Feature Comparison Matrix */}
      {fullPricing.plans.length > 0 && fullPricing.features.length > 0 && (
        <section className="mkt-section mkt-section--tight" style={{ background: 'var(--surface-subtle)', padding: 'var(--space-12) 0', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div className="mkt-section-head" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <span style={{ color: 'var(--color-primary-500)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>
                Feature Breakdown
              </span>
              <h2 className="mkt-h2" style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '8px 0 12px' }}>
                Compare Shopz features across plans
              </h2>
              <p className="mkt-lead" style={{ color: 'var(--text-secondary)' }}>
                Everything included with complete transparency.
              </p>
            </div>
            <FeatureComparisonTable plans={fullPricing.plans} features={fullPricing.features} matrix={fullPricing.matrix} />
          </div>
        </section>
      )}

      {/* Pricing Teaser Section */}
      <section className="mkt-section">
        <div className="mkt-section-head" style={{ textAlign: 'center' }}>
          <h2 className="mkt-h2">Transparent & predictable pricing</h2>
          <p className="mkt-lead">Start free. Upgrade as your shop grows.</p>
        </div>
        {teaserPlans.length > 0 && <PricingSection plans={teaserPlans} />}
        <div className="mkt-section-foot" style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <Link href="/pricing" className="btn btn-ghost">
            Compare all plans & features <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mkt-section mkt-section--tight">
        <div className="mkt-section-head" style={{ textAlign: 'center' }}>
          <h2 className="mkt-h2">Frequently asked questions</h2>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      {/* Final Conversion CTA Banner */}
      <section className="mkt-section">
        <div className="mkt-cta-panel" style={{ textAlign: 'center', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-12) var(--space-6)' }}>
          <div className="mkt-cta-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={20} />
            <span>Get started in under 5 minutes</span>
          </div>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, margin: '0 0 12px' }}>Ready to modernize your shop?</h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Join local shop owners already scaling their sales on zCart.
          </p>
          <Link href="/signup" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-full)', padding: '14px 32px' }}>
            Create Your Free Shop <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <MarketingFooter />

      {/* Sticky Bottom Conversion Bar */}
      <StickyFloatingCta />
    </div>
  )
}

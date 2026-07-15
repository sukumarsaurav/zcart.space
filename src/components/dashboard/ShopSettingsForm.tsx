'use client'

import { useState, useTransition, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Globe, Store, Palette, LayoutTemplate, Image as ImageIcon, Type, Square, UploadCloud, Smartphone, Monitor, RefreshCw, Receipt, FileText } from 'lucide-react'
import type { Shop, ShopLocation, ShopTheme } from '@/types/database'
import { ClassicInvoice, ModernInvoice } from '@/components/invoices/InvoiceTemplates'

const TEMPLATES = [
  { id: 'default', label: 'General Retail', description: 'Clean, versatile layout for most categories' },
  { id: 'fashion', label: 'Fashion & Apparel', description: 'Large imagery, lookbooks, elegant typography' },
  { id: 'toys', label: 'Toys & Kids', description: 'Playful, vibrant colors, grid-heavy layout' },
]

const FONTS = [
  { id: 'inter', label: 'Inter', style: 'sans-serif' },
  { id: 'roboto', label: 'Roboto', style: 'sans-serif' },
  { id: 'playfair', label: 'Playfair Display', style: 'serif' },
  { id: 'space-grotesk', label: 'Space Grotesk', style: 'sans-serif' },
  { id: 'outfit', label: 'Outfit', style: 'sans-serif' },
]

const PRIMARY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
  '#1e293b', '#0f172a', // dark palettes
]

interface Props {
  shop: Shop
  location: ShopLocation | null
}

export default function ShopSettingsForm({ shop, location }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'storefront' | 'invoice'>('general')
  const [previewView, setPreviewView] = useState<'mobile' | 'desktop'>('mobile')
  const [previewKey, setPreviewKey] = useState(Date.now())
  
  const [invoiceTemplate, setInvoiceTemplate] = useState((shop.metadata as any)?.invoice_template || 'classic')

  // General
  const [name, setName] = useState(shop.name)
  const [phone, setPhone] = useState(shop.phone ?? '')
  const [email, setEmail] = useState(shop.email ?? '')
  const [gstin, setGstin] = useState(shop.gstin ?? '')
  
  // Theme & Assets
  const [theme, setTheme] = useState<ShopTheme>(() => {
    const defaultTheme: ShopTheme = { template: 'default', primary_color: '#6366f1', font: 'inter', radius: 'rounded' }
    return { ...defaultTheme, ...((shop.theme as unknown as ShopTheme) || {}) }
  })
  const [logoUrl, setLogoUrl] = useState(shop.logo_url ?? '')
  const [bannerUrl, setBannerUrl] = useState(shop.banner_url ?? '')
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  // Location
  const [city, setCity] = useState(location?.city ?? '')
  const [state, setState] = useState(location?.state ?? '')
  const [pincode, setPincode] = useState(location?.pincode ?? '')
  const [address1, setAddress1] = useState(location?.address_line1 ?? '')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (type === 'logo') {
        setLogoFile(file)
        setLogoUrl(URL.createObjectURL(file))
      } else {
        setBannerFile(file)
        setBannerUrl(URL.createObjectURL(file))
      }
    }
  }

  const handleSave = async () => {
    setError(null)
    setSaved(false)
    const supabase = createClient()

    startTransition(async () => {
      try {
        let finalLogoUrl = logoUrl
        let finalBannerUrl = bannerUrl

        // Upload new images if selected
        if (logoFile) {
          const path = `${shop.id}/logo-${Date.now()}.${logoFile.name.split('.').pop()}`
          const { data, error: uploadErr } = await supabase.storage.from('shop-assets').upload(path, logoFile, { upsert: true })
          if (uploadErr) throw new Error('Logo upload failed: ' + uploadErr.message)
          const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(data.path)
          finalLogoUrl = publicUrl
        }

        if (bannerFile) {
          const path = `${shop.id}/banner-${Date.now()}.${bannerFile.name.split('.').pop()}`
          const { data, error: uploadErr } = await supabase.storage.from('shop-assets').upload(path, bannerFile, { upsert: true })
          if (uploadErr) throw new Error('Banner upload failed: ' + uploadErr.message)
          const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(data.path)
          finalBannerUrl = publicUrl
        }

        // Update DB
        const { error: shopErr } = await supabase.from('shops').update({
          name, 
          phone: phone || null, 
          email: email || null,
          gstin: gstin || null, 
          theme,
          metadata: { ...(shop.metadata as any), invoice_template: invoiceTemplate },
          logo_url: finalLogoUrl || null,
          banner_url: finalBannerUrl || null,
        }).eq('id', shop.id)

        if (shopErr) throw shopErr

        if (location) {
          const { error: locErr } = await supabase.from('shop_locations').update({
            address_line1: address1 || null, city: city || null,
            state: state || null, pincode: pincode || null,
          }).eq('id', location.id)
          if (locErr) throw locErr
        }

        setSaved(true)
        setPreviewKey(Date.now())
        setTimeout(() => setSaved(false), 3000)
        router.refresh()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="settings-layout">
      {/* Left side: Form */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: 720 }}>
        {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', borderBottom: '1px solid var(--surface-border)', paddingBottom: 'var(--space-2)' }}>
        {['general', 'location', 'storefront', 'invoice'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: activeTab === tab ? 'var(--surface-elevated)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontWeight: activeTab === tab ? 600 : 500,
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-tertiary)',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-danger-400)' }}>
          {error}
        </div>
      )}

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Store size={16} color="var(--color-primary-400)" />
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Shop Information</h2>
            </div>
          </div>
          <div className="card-body form-section">
            <div className="form-grid form-grid-2">
              <div className="input-wrapper">
                <label htmlFor="shop-name" className="input-label">Shop name *</label>
                <input id="shop-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Shop" />
              </div>
              <div className="input-wrapper">
                <label htmlFor="shop-slug" className="input-label">URL slug</label>
                <input id="shop-slug" className="input" value={shop.slug} disabled style={{ opacity: 0.5 }} />
                <p className="input-helper">zcart.space/{shop.slug}</p>
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="input-wrapper">
                <label htmlFor="shop-phone" className="input-label">Phone number</label>
                <input id="shop-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="input-wrapper">
                <label htmlFor="shop-email" className="input-label">Email</label>
                <input id="shop-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="shop@example.com" />
              </div>
            </div>
            <div className="input-wrapper" style={{ maxWidth: 320 }}>
              <label htmlFor="shop-gstin" className="input-label">GSTIN</label>
              <input id="shop-gstin" className="input" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
              <p className="input-helper">Required for GST invoice generation</p>
            </div>
          </div>
        </div>
      )}

      {/* LOCATION TAB */}
      {activeTab === 'location' && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Globe size={16} color="var(--color-info-400)" />
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Shop Address</h2>
            </div>
          </div>
          <div className="card-body form-section">
            <div className="input-wrapper">
              <label htmlFor="shop-addr1" className="input-label">Address</label>
              <input id="shop-addr1" className="input" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="form-grid form-grid-3">
              <div className="input-wrapper">
                <label htmlFor="shop-city" className="input-label">City</label>
                <input id="shop-city" className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="input-wrapper">
                <label htmlFor="shop-state" className="input-label">State</label>
                <input id="shop-state" className="input" value={state} onChange={(e) => setState(e.target.value)} placeholder="Maharashtra" />
              </div>
              <div className="input-wrapper">
                <label htmlFor="shop-pincode" className="input-label">Pincode</label>
                <input id="shop-pincode" className="input" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400001" maxLength={6} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOREFRONT TAB */}
      {activeTab === 'storefront' && (
        <div className="form-grid form-grid-2 animate-fade-in" style={{ alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Visual Identity */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <ImageIcon size={16} color="var(--color-primary-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Visual Identity</h2>
                </div>
              </div>
              <div className="card-body form-section">
                <div className="input-wrapper">
                  <label className="input-label">Store Logo</label>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: 'var(--surface-elevated)', border: '1px dashed var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} color="var(--text-tertiary)" />}
                    </div>
                    <div>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <UploadCloud size={14} /> Upload Logo
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} style={{ display: 'none' }} />
                      </label>
                      <p className="input-helper" style={{ marginTop: 'var(--space-1)' }}>Recommended: 512x512px PNG</p>
                    </div>
                  </div>
                </div>

                <div className="input-wrapper" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="input-label">Hero Banner</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ width: '100%', height: 120, borderRadius: 'var(--radius-md)', background: 'var(--surface-elevated)', border: '1px dashed var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {bannerUrl ? <img src={bannerUrl} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--text-tertiary)" />}
                    </div>
                    <div>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <UploadCloud size={14} /> Upload Banner
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} style={{ display: 'none' }} />
                      </label>
                      <p className="input-helper" style={{ marginTop: 'var(--space-1)' }}>Recommended: 1920x1080px JPG</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Style */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Type size={16} color="var(--color-accent-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Typography & Style</h2>
                </div>
              </div>
              <div className="card-body form-section">
                <div className="input-wrapper">
                  <label className="input-label">Typography</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setTheme({ ...theme, font: f.id })}
                        style={{
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${theme.font === f.id ? 'var(--color-primary-500)' : 'var(--surface-border)'}`,
                          background: theme.font === f.id ? 'rgba(99,102,241,0.08)' : 'var(--surface-elevated)',
                          color: 'var(--text-primary)',
                          fontFamily: f.id === 'playfair' ? 'serif' : 'sans-serif',
                          textAlign: 'left', cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-wrapper" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="input-label">Button & Card Style</label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {(['sharp', 'rounded', 'pill'] as const).map(rad => (
                      <button
                        key={rad}
                        type="button"
                        onClick={() => setTheme({ ...theme, radius: rad })}
                        style={{
                          flex: 1, padding: 'var(--space-3)',
                          borderRadius: rad === 'sharp' ? 0 : rad === 'rounded' ? '8px' : '999px',
                          border: `1px solid ${theme.radius === rad ? 'var(--color-primary-500)' : 'var(--surface-border)'}`,
                          background: theme.radius === rad ? 'rgba(99,102,241,0.08)' : 'var(--surface-elevated)',
                          color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'center'
                        }}
                      >
                        {rad.charAt(0).toUpperCase() + rad.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-wrapper" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="input-label">Brand Color</label>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {PRIMARY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setTheme({ ...theme, primary_color: color })}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: color, border: 'none', cursor: 'pointer',
                          outline: theme.primary_color === color ? `2px solid ${color}` : 'none',
                          outlineOffset: 2, transition: 'all 0.1s'
                        }}
                      />
                    ))}
                    <div style={{ width: 1, background: 'var(--surface-border)', margin: '0 var(--space-1)' }} />
                    <input
                      type="color"
                      value={theme.primary_color}
                      onChange={(e) => setTheme({ ...theme, primary_color: e.target.value })}
                      style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--surface-border)', cursor: 'pointer', padding: 0, background: 'none' }}
                      title="Custom color"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Templates */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <LayoutTemplate size={16} color="var(--color-success-400)" />
                  <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Store Template</h2>
                </div>
              </div>
              <div className="card-body form-section">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme({ ...theme, template: t.id as ShopTheme['template'] })}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-xl)',
                        border: `2px solid ${theme.template === t.id ? 'var(--color-primary-500)' : 'var(--surface-border)'}`,
                        background: theme.template === t.id ? 'rgba(99,102,241,0.05)' : 'var(--surface-elevated)',
                        cursor: 'pointer', textAlign: 'left',
                        display: 'flex', gap: 'var(--space-4)', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: 80, height: 60, borderRadius: 'var(--radius-md)', background: 'var(--bg-app)', border: '1px solid var(--surface-border)', overflow: 'hidden', position: 'relative' }}>
                        {/* Wireframe thumbnail */}
                        <div style={{ height: 10, background: 'var(--surface-border)', margin: '4px' }} />
                        <div style={{ display: 'flex', gap: 4, margin: '4px' }}>
                          <div style={{ flex: 1, height: 20, background: 'var(--surface-border)' }} />
                          <div style={{ flex: 1, height: 20, background: 'var(--surface-border)' }} />
                          <div style={{ flex: 1, height: 20, background: 'var(--surface-border)' }} />
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{t.label}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Settings */}
      {activeTab === 'invoice' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="var(--brand-primary)" /> Invoice Template
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
              Choose a template for your generated invoices. The preview will update instantly with demo data.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={() => setInvoiceTemplate('classic')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-4)',
                  background: 'var(--surface-sunken)', border: `2px solid ${invoiceTemplate === 'classic' ? 'var(--brand-primary)' : 'transparent'}`,
                  borderRadius: 'var(--radius-lg)', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Classic Retail</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>A traditional layout showing all details clearly with bold headers.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setInvoiceTemplate('modern')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', padding: 'var(--space-4)',
                  background: 'var(--surface-sunken)', border: `2px solid ${invoiceTemplate === 'modern' ? 'var(--brand-primary)' : 'transparent'}`,
                  borderRadius: 'var(--radius-lg)', textAlign: 'left', transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutTemplate size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Modern Clean</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>A sleek design with subtle backgrounds and soft typography for modern brands.</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-4)' }}>
        <button
          onClick={handleSave}
          disabled={isPending}
          className={`btn btn-primary btn-lg ${isPending ? 'btn-loading' : ''}`}
          style={{ minWidth: 160, justifyContent: 'center' }}
        >
          <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save changes
          </span>
        </button>
        {saved && (
          <span className="animate-fade-in" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-success-400)', fontWeight: 500 }}>
            Changes saved successfully!
          </span>
        )}
      </div>
      </div>

      {/* Right side: Live Preview */}
      {activeTab === 'invoice' ? (
        <div className="settings-preview-panel" style={{ 
          flex: 1,
          background: 'var(--surface-sunken)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--surface-border)',
          overflow: 'hidden', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 'var(--space-8)'
        }}>
          <div style={{ width: '100%', maxWidth: 700, transformOrigin: 'top center', transform: 'scale(0.8)' }}>
            {invoiceTemplate === 'classic' ? (
              <ClassicInvoice 
                invoice={{ invoice_number: 'INV-DEMO-001', invoice_date: new Date().toISOString(), total_amount: 1180, tax_total: 180 }}
                shop={{ ...shop, name, logo_url: logoUrl, theme, phone, gstin }}
                location={{ address_line1: address1, city, state, pincode }}
                customer={{ name: 'Demo Customer', phone: '9876543210', gstin: '27AADCB2230M1Z2' }}
                order={{ shipping_address: { address_line1: '123 Demo Street', city: city || 'Demo City', state: state || 'State', pincode: pincode || '000000' } }}
                items={[{ product_name: 'Premium Sample Product', quantity: 1, unit_price: 1000, line_total: 1000, gst_rate: '18' }]}
              />
            ) : (
              <ModernInvoice 
                invoice={{ invoice_number: 'INV-DEMO-001', invoice_date: new Date().toISOString(), total_amount: 1180, tax_total: 180 }}
                shop={{ ...shop, name, logo_url: logoUrl, theme, phone, gstin }}
                location={{ address_line1: address1, city, state, pincode }}
                customer={{ name: 'Demo Customer', phone: '9876543210', gstin: '27AADCB2230M1Z2' }}
                order={{ shipping_address: { address_line1: '123 Demo Street', city: city || 'Demo City', state: state || 'State', pincode: pincode || '000000' } }}
                items={[{ product_name: 'Premium Sample Product', quantity: 1, unit_price: 1000, line_total: 1000, gst_rate: '18' }]}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="settings-preview-panel" style={{ 
          width: previewView === 'mobile' ? 375 : '45%',
          transition: 'width 0.3s ease',
          background: '#000',
          borderRadius: '24px',
          border: '8px solid #111',
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 16px', background: '#111', borderBottom: '1px solid #333' }}>
            <button type="button" onClick={() => setPreviewView('mobile')} className={`btn btn-sm ${previewView === 'mobile' ? 'btn-secondary' : 'btn-ghost'}`} style={{ color: previewView === 'mobile' ? 'inherit' : '#888' }}><Smartphone size={14} /> Mobile</button>
            <button type="button" onClick={() => setPreviewView('desktop')} className={`btn btn-sm ${previewView === 'desktop' ? 'btn-secondary' : 'btn-ghost'}`} style={{ color: previewView === 'desktop' ? 'inherit' : '#888' }}><Monitor size={14} /> Desktop</button>
            <button type="button" onClick={() => setPreviewKey(Date.now())} className="btn btn-ghost btn-sm btn-icon" title="Refresh Preview" style={{ color: '#888', marginLeft: 'auto' }}><RefreshCw size={14} /></button>
          </div>
          <iframe key={previewKey} src={`/${shop.slug}`} style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }} />
        </div>
      )}
    </div>
  )
}

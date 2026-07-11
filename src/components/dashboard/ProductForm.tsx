'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from './ImageUploader'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import slugify from 'slugify'
import type { GstRate, ProductStatus } from '@/types/database'

interface Category { id: string; name: string; parent_id: string | null }

interface ProductFormProps {
  shopId: string
  categories: Category[]
  product?: {
    id: string
    name: string
    description: string | null
    images: string[]
    sku: string | null
    barcode: string | null
    unit: string
    mrp: number
    selling_price: number
    cost_price: number | null
    hsn_code: string | null
    gst_rate: GstRate
    tax_inclusive: boolean
    track_inventory: boolean
    category_id: string | null
    status: ProductStatus
    metadata?: any
  }
}

const GST_RATES: GstRate[] = ['0', '5', '12', '18', '28']
const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'box', 'pack', 'pair', 'set', 'dozen', 'm', 'ft']

export default function ProductForm({ shopId, categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [sku, setSku] = useState(product?.sku ?? '')
  const [barcode, setBarcode] = useState(product?.barcode ?? '')
  const [unit, setUnit] = useState(product?.unit ?? 'pcs')
  const [mrp, setMrp] = useState(String(product?.mrp ?? ''))
  const [sellingPrice, setSellingPrice] = useState(String(product?.selling_price ?? ''))
  const [costPrice, setCostPrice] = useState(String(product?.cost_price ?? ''))
  const [hsnCode, setHsnCode] = useState(product?.hsn_code ?? '')
  const [gstRate, setGstRate] = useState<GstRate>(product?.gst_rate ?? '18')
  const [taxInclusive, setTaxInclusive] = useState(product?.tax_inclusive ?? true)
  const [trackInventory, setTrackInventory] = useState(product?.track_inventory ?? true)
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? 'active')
  const [isDealOfDay, setIsDealOfDay] = useState(product?.metadata?.is_deal_of_the_day === true)
  
  // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
  const defaultDealEnd = product?.metadata?.deal_end_time 
    ? new Date(product.metadata.deal_end_time).toISOString().slice(0, 16)
    : ''
  const [dealEndTime, setDealEndTime] = useState(defaultDealEnd)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Product name is required'); return }
    if (!sellingPrice || isNaN(Number(sellingPrice))) { setError('Valid selling price is required'); return }
    if (!mrp || isNaN(Number(mrp))) { setError('Valid MRP is required'); return }

    setError(null)
    const supabase = createClient()

    startTransition(async () => {
      const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36)

      const payload = {
        shop_id: shopId,
        name: name.trim(),
        slug,
        description: description || null,
        images,
        sku: sku || null,
        barcode: barcode || null,
        unit,
        mrp: Number(mrp),
        selling_price: Number(sellingPrice),
        cost_price: costPrice ? Number(costPrice) : null,
        hsn_code: hsnCode || null,
        gst_rate: gstRate,
        tax_inclusive: taxInclusive,
        track_inventory: trackInventory,
        category_id: categoryId || null,
        status,
        metadata: {
          ...product?.metadata,
          is_deal_of_the_day: isDealOfDay,
          deal_end_time: isDealOfDay && dealEndTime ? new Date(dealEndTime).toISOString() : null
        }
      }

      let err
      if (product?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id)
        err = error
      } else {
        const { error } = await supabase.from('products').insert(payload)
        err = error
      }

      if (err) {
        setError(err.message)
        return
      }

      router.push('/products')
      router.refresh()
    })
  }

  const discount = mrp && sellingPrice && Number(mrp) > 0
    ? Math.round((1 - Number(sellingPrice) / Number(mrp)) * 100)
    : 0

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left — main fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {error && (
            <div style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-danger-400)',
            }}>
              {error}
            </div>
          )}

          {/* Basic info */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Basic Information</h2></div>
            <div className="card-body form-section">
              <div className="input-wrapper">
                <label htmlFor="product-name" className="input-label">Product name *</label>
                <input id="product-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Classic White T-Shirt" required />
              </div>
              <div className="input-wrapper">
                <label htmlFor="product-desc" className="input-label">Description</label>
                <textarea id="product-desc" className="input textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product…" rows={4} />
              </div>
              <div className="form-grid form-grid-2">
                <div className="input-wrapper">
                  <label htmlFor="product-sku" className="input-label">SKU</label>
                  <input id="product-sku" className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. TS-WHT-M" />
                </div>
                <div className="input-wrapper">
                  <label htmlFor="product-barcode" className="input-label">Barcode (EAN/QR)</label>
                  <input id="product-barcode" className="input" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="e.g. 8901234567890" />
                </div>
              </div>
              <div className="input-wrapper">
                <label htmlFor="product-unit" className="input-label">Unit</label>
                <select id="product-unit" className="input select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Product Images</h2></div>
            <div className="card-body">
              <ImageUploader shopId={shopId} value={images} onChange={setImages} />
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Pricing</h2></div>
            <div className="card-body form-section">
              <div className="form-grid form-grid-3">
                <div className="input-wrapper">
                  <label htmlFor="product-mrp" className="input-label">MRP (₹) *</label>
                  <input id="product-mrp" className="input" type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="0.00" required />
                </div>
                <div className="input-wrapper">
                  <label htmlFor="product-price" className="input-label">Selling Price (₹) *</label>
                  <input id="product-price" className="input" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" required />
                  {discount > 0 && (
                    <p className="input-helper" style={{ color: 'var(--color-success-400)' }}>{discount}% discount on MRP</p>
                  )}
                </div>
                <div className="input-wrapper">
                  <label htmlFor="product-cost" className="input-label">Cost Price (₹)</label>
                  <input id="product-cost" className="input" type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" />
                  <p className="input-helper">Used for margin reports</p>
                </div>
              </div>
            </div>
          </div>

          {/* GST */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>GST & Compliance</h2></div>
            <div className="card-body form-section">
              <div className="form-grid form-grid-2">
                <div className="input-wrapper">
                  <label htmlFor="product-hsn" className="input-label">HSN Code</label>
                  <input id="product-hsn" className="input" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="e.g. 6109" />
                  <p className="input-helper">Required for B2B GST invoices</p>
                </div>
                <div className="input-wrapper">
                  <label htmlFor="product-gst" className="input-label">GST Rate</label>
                  <select id="product-gst" className="input select" value={gstRate} onChange={(e) => setGstRate(e.target.value as GstRate)}>
                    {GST_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input type="checkbox" checked={taxInclusive} onChange={(e) => setTaxInclusive(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)', cursor: 'pointer' }} />
                <span>Selling price is GST-inclusive</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Status</h2></div>
            <div className="card-body">
              <div className="input-wrapper">
                <select id="product-status" className="input select" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)}>
                  <option value="active">Active — visible on storefront</option>
                  <option value="draft">Draft — hidden from storefront</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button
                type="submit"
                id="save-product-btn"
                disabled={isPending}
                className={`btn btn-primary ${isPending ? 'btn-loading' : ''}`}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {product ? 'Save changes' : 'Create product'}
                </span>
              </button>
              <Link href="/products" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowLeft size={14} /> Cancel
              </Link>
            </div>
          </div>

          {/* Category */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Category</h2></div>
            <div className="card-body">
              <div className="input-wrapper">
                <select id="product-category" className="input select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.parent_id ? '  └ ' : ''}{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Inventory</h2></div>
            <div className="card-body">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                <input type="checkbox" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
                <span>Track inventory for this product</span>
              </label>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                Stock can be set from the Inventory page after creating the product.
              </p>
            </div>
          </div>

          {/* Promotions */}
          <div className="card">
            <div className="card-header"><h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Promotions</h2></div>
            <div className="card-body">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', fontSize: 'var(--text-sm)', marginBottom: isDealOfDay ? 'var(--space-4)' : 0 }}>
                <input type="checkbox" checked={isDealOfDay} onChange={(e) => setIsDealOfDay(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
                <span>Set as Deal of the Day</span>
              </label>
              
              {isDealOfDay && (
                <div className="input-wrapper">
                  <label htmlFor="deal-end-time" className="input-label">Deal Ends At</label>
                  <input 
                    type="datetime-local" 
                    id="deal-end-time" 
                    className="input" 
                    value={dealEndTime} 
                    onChange={(e) => setDealEndTime(e.target.value)} 
                    required={isDealOfDay}
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                    A countdown timer will be displayed until this time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ shopSlug: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { data: shop } = await supabase.from('shops').select('name').eq('slug', shopSlug).single()
  return {
    title: `Categories | ${shop?.name ?? 'Shop'}`,
    description: `Browse all categories at ${shop?.name}.`,
  }
}

export default async function CategoriesPage({ params }: { params: Promise<{ shopSlug: string }> }) {
  const supabase = await createClient()
  const { shopSlug } = await params

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, logo_url')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .single()

  if (!shop) notFound()

  // Fetch all active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, parent_id, sort_order')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const allCategories = categories || []

  // Group by parent
  const parentCategories = allCategories.filter(c => !c.parent_id)
  const subCategoriesByParent = allCategories.reduce((acc, cat) => {
    if (cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = []
      acc[cat.parent_id].push(cat)
    }
    return acc
  }, {} as Record<string, typeof allCategories>)

  const pc = (shop.theme as any)?.primary_color ?? '#6366f1'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(9,9,11,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <Link href={`/${shopSlug}`} className="btn btn-ghost btn-icon" style={{ color: 'var(--text-primary)' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1, textAlign: 'center' }}>
            Categories
          </h1>
          <button className="btn btn-ghost btn-icon" style={{ color: 'var(--text-primary)' }}>
            <Search size={20} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        
        {parentCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            <p>No categories found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {parentCategories.map(parent => {
              const subs = subCategoriesByParent[parent.id] || []
              return (
                <div key={parent.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  
                  {/* Parent Category Card */}
                  <Link href={`/${shopSlug}/products?category=${parent.slug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <div style={{ 
                      width: '200px', 
                      height: '200px', 
                      borderRadius: '24px', 
                      overflow: 'hidden',
                      background: 'var(--surface-elevated)',
                      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                      position: 'relative',
                      border: '1px solid var(--surface-border)'
                    }}>
                      {parent.image_url ? (
                        <Image src={parent.image_url} alt={parent.name} fill sizes="200px" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' }}>
                          <span style={{ fontSize: '48px', fontWeight: 800, color: 'rgba(255,255,255,0.1)' }}>
                            {parent.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, marginTop: '16px', color: 'var(--text-primary)', textAlign: 'center' }}>
                      {parent.name}
                    </h2>
                  </Link>

                  {/* Subcategories (Chips) */}
                  {subs.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                      {subs.map(sub => (
                        <Link 
                          key={sub.id} 
                          href={`/${shopSlug}/products?category=${sub.slug}`}
                          style={{
                            padding: '8px 16px',
                            background: 'var(--surface-sunken)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {sub.image_url && (
                            <div style={{ width: 16, height: 16, borderRadius: '50%', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                              <Image src={sub.image_url} alt="" fill sizes="16px" style={{ objectFit: 'cover' }} />
                            </div>
                          )}
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

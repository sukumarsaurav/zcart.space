import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ChevronRight, ShoppingBag } from 'lucide-react'
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

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopSlug: string }>
  searchParams: Promise<{ selected?: string }>
}) {
  const supabase = await createClient()
  const { shopSlug } = await params
  const { selected } = await searchParams

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, logo_url')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .single()

  if (!shop) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, parent_id, sort_order')
    .eq('shop_id', shop.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const allCategories = categories || []
  const parentCategories = allCategories.filter((c) => !c.parent_id)
  const subCategoriesByParent = allCategories.reduce((acc, cat) => {
    if (cat.parent_id) {
      if (!acc[cat.parent_id]) acc[cat.parent_id] = []
      acc[cat.parent_id].push(cat)
    }
    return acc
  }, {} as Record<string, typeof allCategories>)

  const selectedCategory = selected ? parentCategories.find((c) => c.slug === selected) : null
  const subs = selectedCategory ? subCategoriesByParent[selectedCategory.id] ?? [] : []

  return (
    <div data-storefront-theme="dark-gold" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Header */}
      <header className="sf-header">
        <Link href={`/${shopSlug}`} className="sf-back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="sf-heading" style={{ fontSize: 'var(--text-lg)', flex: 1 }}>
          All Categories
        </h1>
      </header>

      {parentCategories.length === 0 ? (
        <div className="sf-cat-empty">No categories found.</div>
      ) : (
        <div className="sf-cat-layout">
          {/* Sidebar */}
          <nav className="sf-cat-sidebar">
            {parentCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${shopSlug}/categories?selected=${cat.slug}`}
                className={`sf-cat-sidebar-item ${selected === cat.slug ? 'active' : ''}`}
              >
                <div className="sf-cat-sidebar-icon">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <ShoppingBag size={20} color="var(--sf-text-tertiary)" />
                  )}
                </div>
                <span className="sf-cat-sidebar-label">{cat.name}</span>
              </Link>
            ))}
          </nav>

          {/* Detail panel */}
          <div className="sf-cat-detail">
            {!selectedCategory ? (
              <div className="sf-cat-empty">Select a category to view subcategories</div>
            ) : (
              <>
                <h2 className="sf-heading" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
                  {selectedCategory.name}
                </h2>

                <Link href={`/${shopSlug}/products?category=${selectedCategory.slug}`} className="sf-cat-view-all">
                  View All {selectedCategory.name}
                  <ChevronRight size={18} />
                </Link>

                {subs.length === 0 ? (
                  <div className="sf-cat-sub-empty">No subcategories available</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/${shopSlug}/products?category=${sub.slug}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                          padding: 'var(--space-3)', border: '1px solid var(--sf-border)',
                          borderRadius: 'var(--radius-md)', color: 'var(--sf-text-primary)',
                        }}
                      >
                        {sub.image_url && (
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                            <Image src={sub.image_url} alt="" fill sizes="32px" style={{ objectFit: 'cover' }} />
                          </div>
                        )}
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, flex: 1 }}>{sub.name}</span>
                        <ChevronRight size={16} color="var(--sf-text-tertiary)" />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

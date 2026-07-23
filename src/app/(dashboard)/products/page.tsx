import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, Search, Edit2, Archive, ArchiveRestore, Eye } from 'lucide-react'
import type { Metadata } from 'next'
import type { Product, ProductStatus } from '@/types/database'
import { setProductStatus } from './actions'

export const metadata: Metadata = { title: 'Products' }

const statusBadge: Record<ProductStatus, string> = {
  active:   'badge-success',
  archived: 'badge-neutral',
  draft:    'badge-warning',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: ProductStatus; category?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id, shops(slug)')
    .eq('auth_user_id', user.id)
    .single()
  if (!shopUser) redirect('/login')

  const shopSlug = (Array.isArray(shopUser.shops) ? shopUser.shops[0] : shopUser.shops)?.slug

  const params = await searchParams
  const q = params.q ?? ''
  const statusFilter = params.status
  const page = Number(params.page ?? 1)
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('id, name, slug, images, selling_price, mrp, min_selling_price, status, sku, category_id, created_at, categories(name), inventory(quantity)', { count: 'exact' })
    .eq('shop_id', shopUser.shop_id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) query = query.ilike('name', `%${q}%`)
  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{count ?? 0} total products in your catalogue</p>
        </div>
        <Link href="/products/new" className="btn btn-primary" id="add-product-btn">
          <Plus size={16} /> Add product
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <form style={{ position: 'relative', flex: '1 1 260px' }}>
          <span style={{
            position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
          }}>
            <Search size={15} />
          </span>
          <input
            id="product-search"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="input input-icon-left"
            style={{ maxWidth: 320 }}
          />
          {/* Preserve other params */}
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        </form>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['', 'active', 'draft', 'archived'] as const).map((s) => (
            <Link
              key={s || 'all'}
              href={`/products?${new URLSearchParams({ ...(q && { q }), ...(s && { status: s }) })}`}
              className={`btn btn-sm ${(s === '' && !statusFilter) || statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {!products?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={28} /></div>
          <p className="empty-state-title">No products yet</p>
          <p className="empty-state-description">
            Add your first product to start selling online and via POS.
          </p>
          <Link href="/products/new" className="btn btn-primary">
            <Plus size={16} /> Add first product
          </Link>
        </div>
      ) : (
        <>
          <div className="table-wrapper table-responsive-cards">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => {
                  const stock = product.inventory?.[0]?.quantity ?? null
                  const isLow = stock !== null && stock <= 5

                  return (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          {/* Thumbnail */}
                          <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                            background: 'var(--surface-elevated)',
                            border: '1px solid var(--surface-border)',
                            overflow: 'hidden', flexShrink: 0,
                          }}>
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{
                                width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-tertiary)',
                              }}>
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{product.name}</p>
                            {product.sku && (
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {product.categories?.name ?? '—'}
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fmtINR(product.selling_price)}</p>
                        {product.min_selling_price !== null && (
                          <p style={{ fontSize: '11px', color: 'var(--color-warning-400)', margin: 0 }}>
                            Min: {fmtINR(product.min_selling_price)}
                          </p>
                        )}
                        {product.mrp > product.selling_price && (
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                            {fmtINR(product.mrp)}
                          </p>
                        )}
                      </td>
                      <td>
                        {stock === null ? (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>—</span>
                        ) : (
                          <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                            {stock} in stock
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-dot ${statusBadge[product.status as ProductStatus]}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                          <Link
                            href={`/products/${product.id}`}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Edit product"
                            id={`edit-product-${product.id}`}
                          >
                            <Edit2 size={14} />
                          </Link>
                          {shopSlug && (
                            <Link
                              href={`/${shopSlug}/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Preview on storefront"
                              id={`preview-product-${product.id}`}
                            >
                              <Eye size={14} />
                            </Link>
                          )}
                          <form action={setProductStatus.bind(null, product.id, shopUser.shop_id, product.status === 'archived' ? 'active' : 'archived')}>
                            <button
                              type="submit"
                              className="btn btn-ghost btn-icon btn-sm"
                              title={product.status === 'archived' ? 'Restore product' : 'Archive product'}
                              id={`archive-product-${product.id}`}
                            >
                              {product.status === 'archived' ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'var(--space-2)',
              marginTop: 'var(--space-6)',
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/products?${new URLSearchParams({ ...(q && { q }), ...(statusFilter && { status: statusFilter }), page: String(p) })}`}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

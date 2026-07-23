import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Warehouse, AlertTriangle, Search } from 'lucide-react'
import type { Metadata } from 'next'
import AdjustStockButton from '@/components/dashboard/AdjustStockButton'
import BatchButton from '@/components/dashboard/BatchButton'

export const metadata: Metadata = { title: 'Inventory' }

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: 'low' | 'all' }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const params = await searchParams
  const filter = params.filter ?? 'all'

  let query = supabase
    .from('inventory')
    .select('id, product_id, location_id, variant_id, quantity, reserved, reorder_point, updated_at, products(name, sku, images, status, unit, has_batch, has_expiry)')
    .eq('shop_id', shopUser.shop_id)
    .order('quantity', { ascending: true })

  // PostgREST filters compare a column to a literal, not another column, so
  // "quantity <= reorder_point" can't be expressed as a query filter —
  // fetch everything and filter client-side below instead.
  if (params.q) query = query.ilike('products.name', `%${params.q}%`)

  const { data: allInventory } = await query
  const lowStockCount = (allInventory ?? []).filter((i) => Number(i.quantity) <= Number(i.reorder_point)).length
  const inventory = filter === 'low'
    ? (allInventory ?? []).filter((i) => Number(i.quantity) <= Number(i.reorder_point))
    : allInventory

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">{inventory?.length ?? 0} products tracked · {lowStockCount} low stock</p>
        </div>
        {lowStockCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-lg)' }}>
            <AlertTriangle size={15} color="var(--color-warning-400)" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-400)', fontWeight: 500 }}>{lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need restocking</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
        <form style={{ position: 'relative', flex: '1 1 260px' }}>
          <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
            <Search size={15} />
          </span>
          <input id="inventory-search" name="q" defaultValue={params.q} placeholder="Search products…" className="input input-icon-left" style={{ maxWidth: 320 }} />
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
        </form>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href="/inventory" className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All</Link>
          <Link href="/inventory?filter=low" className={`btn btn-sm ${filter === 'low' ? 'btn-primary' : 'btn-secondary'}`}>
            <AlertTriangle size={13} /> Low stock {lowStockCount > 0 && `(${lowStockCount})`}
          </Link>
        </div>
      </div>

      {!inventory?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Warehouse size={28} /></div>
          <p className="empty-state-title">No inventory tracked</p>
          <p className="empty-state-description">Add products with inventory tracking enabled to manage stock here.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>In Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item: any) => {
                const qty = Number(item.quantity)
                const reserved = Number(item.reserved)
                const available = qty - reserved
                const reorder = Number(item.reorder_point)
                const isCritical = qty === 0
                const isLow = qty <= reorder && qty > 0
                const pct = reorder > 0 ? Math.min(100, Math.round((qty / (reorder * 2)) * 100)) : 100

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-md)',
                          background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                          overflow: 'hidden', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)',
                        }}>
                          {item.products?.images?.[0]
                            ? <img src={item.products.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Warehouse size={14} />}
                        </div>
                        <div>
                          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{item.products?.name ?? 'Unknown'}</p>
                          {item.products?.sku && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>SKU: {item.products.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{qty} {item.products?.unit}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{reserved}</td>
                    <td style={{ fontWeight: 500, color: available === 0 ? 'var(--color-danger-400)' : 'var(--text-primary)' }}>{available}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: 60, height: 4, background: 'var(--surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: isCritical ? 'var(--color-danger-500)' : isLow ? 'var(--color-warning-500)' : 'var(--color-success-500)',
                            borderRadius: 'var(--radius-full)',
                          }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{reorder}</span>
                      </div>
                    </td>
                    <td>
                      {isCritical
                        ? <span className="badge badge-danger badge-dot">Out of stock</span>
                        : isLow
                          ? <span className="badge badge-warning badge-dot">Low stock</span>
                          : <span className="badge badge-success badge-dot">In stock</span>
                      }
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {new Date(item.updated_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BatchButton
                        shopId={shopUser.shop_id}
                        productId={item.product_id}
                        productName={item.products?.name ?? 'Product'}
                        hasExpiry={item.products?.has_expiry}
                      />
                      <AdjustStockButton
                        shopId={shopUser.shop_id}
                        productId={item.product_id}
                        locationId={item.location_id}
                        variantId={item.variant_id}
                        currentQuantity={qty}
                        unit={item.products?.unit ?? 'pcs'}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

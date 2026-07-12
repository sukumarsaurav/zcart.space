import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Search, Phone, Mail, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customers' }

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const params = await searchParams
  const page = Number(params.page ?? 1)
  const pageSize = 25
  const from = (page - 1) * pageSize

  let query = supabase
    .from('customers')
    .select('id, name, phone, email, total_orders, total_spent, outstanding_credit, created_at', { count: 'exact' })
    .eq('shop_id', shopUser.shop_id)
    .order('total_spent', { ascending: false })
    .range(from, from + pageSize - 1)

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,phone.ilike.%${params.q}%`)
  }

  const { data: customers, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{count ?? 0} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <form style={{ marginBottom: 'var(--space-5)', maxWidth: 320, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
          <Search size={15} />
        </span>
        <input name="q" defaultValue={params.q} placeholder="Search name or phone…" className="input input-icon-left" id="customer-search" />
      </form>

      {!customers?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={28} /></div>
          <p className="empty-state-title">No customers yet</p>
          <p className="empty-state-description">Customers are created automatically from online orders or POS sales with a phone number.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Credit Balance</th>
                  <th>Since</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/customers/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'inherit' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--radius-full)',
                          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 'var(--text-xs)', fontWeight: 700,
                        }}>
                          {(c.name ?? '?').slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.name}</span>
                      </Link>
                    </td>
                    <td>
                      {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}><Phone size={12} /> {c.phone}</div>}
                      {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}><Mail size={11} /> {c.email}</div>}
                    </td>
                    <td><span className="badge badge-neutral">{c.total_orders ?? 0}</span></td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fmtINR(Number(c.total_spent ?? 0))}</td>
                    <td>
                      {Number(c.outstanding_credit ?? 0) > 0 ? (
                        <span className="badge badge-warning">{fmtINR(Number(c.outstanding_credit))}</span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>₹0</span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {format(new Date(c.created_at), 'dd MMM yy')}
                    </td>
                    <td>
                      <Link href={`/customers/${c.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/customers?page=${p}${params.q ? `&q=${params.q}` : ''}`}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Download, ExternalLink, Search } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Invoices' }

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
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
    .from('invoices')
    .select('id, invoice_number, invoice_date, total_amount, tax_total, pdf_url, order_id, created_at, orders(status, customers(name))', { count: 'exact' })
    .eq('shop_id', shopUser.shop_id)
    .order('invoice_date', { ascending: false })
    .range(from, from + pageSize - 1)

  if (params.q) query = query.ilike('invoice_number', `%${params.q}%`)

  const { data: invoices, count } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{count ?? 0} invoices generated</p>
        </div>
      </div>

      {/* Search */}
      <form style={{ marginBottom: 'var(--space-5)', maxWidth: 320, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
          <Search size={15} />
        </span>
        <input name="q" defaultValue={params.q} placeholder="Search invoice number…" className="input input-icon-left" id="invoice-search" />
      </form>

      {!invoices?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={28} /></div>
          <p className="empty-state-title">No invoices yet</p>
          <p className="empty-state-description">Invoices will be auto-generated when orders are confirmed.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary-400)' }}>
                      {inv.invoice_number}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>
                      {inv.orders?.customers?.name ?? <span style={{ color: 'var(--text-tertiary)' }}>Guest</span>}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {format(new Date(inv.invoice_date), 'dd MMM yyyy')}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{fmtINR(Number(inv.tax_total))}</td>
                    <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fmtINR(Number(inv.total_amount))}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <Link href={`/orders/${inv.order_id}`} className="btn btn-ghost btn-icon btn-sm" title="View order">
                          <ExternalLink size={14} />
                        </Link>
                        {inv.pdf_url && (
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Download PDF">
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/invoices?page=${p}`} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

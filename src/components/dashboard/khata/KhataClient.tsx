'use client'

import { useState } from 'react'
import {
  CreditCard, ArrowDownRight, ArrowUpRight, Search, Plus,
  MessageSquare, DollarSign, Check, X, Building2, User
} from 'lucide-react'
import { recordPartyPayment, createVendor } from '@/app/(dashboard)/khata/actions'

interface CustomerParty {
  id: string
  name: string
  phone: string | null
  email: string | null
  outstanding_credit: number
}

interface VendorParty {
  id: string
  name: string
  company_name: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  outstanding_payable: number
}

interface LedgerItem {
  id: string
  party_type: 'customer' | 'vendor'
  amount: number
  balance_after: number
  notes: string | null
  txn_type: string
  created_at: string
  customers?: { name: string } | null
  vendors?: { name: string } | null
}

interface KhataClientProps {
  shopName: string
  customers: CustomerParty[]
  vendors: VendorParty[]
  ledgerHistory: LedgerItem[]
}

export default function KhataClient({
  shopName,
  customers,
  vendors,
  ledgerHistory,
}: KhataClientProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors' | 'history'>('customers')
  const [search, setSearch] = useState('')
  const [payModal, setPayModal] = useState<{
    open: boolean
    partyType: 'customer' | 'vendor'
    partyId: string
    partyName: string
    partyPhone?: string | null
    currentBalance: number
  } | null>(null)

  const [vendorModal, setVendorModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Calculating stats
  const totalReceivables = customers.reduce((acc, c) => acc + Number(c.outstanding_credit || 0), 0)
  const totalPayables = vendors.reduce((acc, v) => acc + Number(v.outstanding_payable || 0), 0)
  const netPosition = totalReceivables - totalPayables

  const fmtINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  )

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.phone && v.phone.includes(search)) ||
      (v.company_name && v.company_name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleRecordPaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!payModal) return
    setIsSubmitting(true)
    setModalError(null)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('partyType', payModal.partyType)
      formData.append('partyId', payModal.partyId)

      await recordPartyPayment(formData)
      setPayModal(null)
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error recording payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateVendorSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setModalError(null)

    try {
      const formData = new FormData(e.currentTarget)
      await createVendor(formData)
      setVendorModal(false)
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error creating vendor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWhatsAppReminderLink = (phone: string, name: string, balance: number) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    const msg = `Hello ${name}, this is a payment reminder from ${shopName}. Your outstanding credit balance is ${fmtINR(balance)}. Please settle it at your earliest convenience. Thank you!`
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <div>
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Receivables (You Get)
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success-500)' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-success-500)' }}>
            {fmtINR(totalReceivables)}
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            From {customers.filter(c => Number(c.outstanding_credit) > 0).length} customers
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Payables (You Give)
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-full)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger-500)' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-danger-500)' }}>
            {fmtINR(totalPayables)}
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            To {vendors.filter(v => Number(v.outstanding_payable) > 0).length} suppliers
          </span>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Net Ledger Balance
            </span>
            <div style={{ padding: 6, borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary-500)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: netPosition >= 0 ? 'var(--color-success-500)' : 'var(--color-danger-500)' }}>
            {fmtINR(netPosition)}
          </p>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            {netPosition >= 0 ? 'Net Positive Position' : 'Net Payable Position'}
          </span>
        </div>
      </div>

      {/* Main Tabs and Actions Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--surface-border)', width: '100%', maxWidth: 450 }}>
          <button
            onClick={() => setActiveTab('customers')}
            className={`btn btn-ghost ${activeTab === 'customers' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 0, borderBottom: activeTab === 'customers' ? '2px solid var(--color-primary-500)' : 'none' }}
          >
            <User size={16} /> Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`btn btn-ghost ${activeTab === 'vendors' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 0, borderBottom: activeTab === 'vendors' ? '2px solid var(--color-primary-500)' : 'none' }}
          >
            <Building2 size={16} /> Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`btn btn-ghost ${activeTab === 'history' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 0, borderBottom: activeTab === 'history' ? '2px solid var(--color-primary-500)' : 'none' }}
          >
            Ledger Log
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {activeTab !== 'history' && (
            <div style={{ position: 'relative', width: 240 }}>
              <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                <Search size={15} />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}…`}
                className="input input-icon-left"
                style={{ paddingLeft: 'var(--space-8)' }}
              />
            </div>
          )}

          {activeTab === 'vendors' && (
            <button onClick={() => setVendorModal(true)} className="btn btn-primary" style={{ gap: 'var(--space-2)' }}>
              <Plus size={16} /> Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Customers Receivables */}
      {activeTab === 'customers' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Receivable Credit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filteredCustomers.length ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    No customer credit records found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.name}</span>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      {Number(c.outstanding_credit || 0) > 0 ? (
                        <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                          {fmtINR(Number(c.outstanding_credit))}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>₹0</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={() => setPayModal({
                            open: true,
                            partyType: 'customer',
                            partyId: c.id,
                            partyName: c.name,
                            partyPhone: c.phone,
                            currentBalance: Number(c.outstanding_credit || 0)
                          })}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: 4 }}
                        >
                          <DollarSign size={14} /> Collect
                        </button>

                        {c.phone && Number(c.outstanding_credit || 0) > 0 && (
                          <a
                            href={getWhatsAppReminderLink(c.phone, c.name, Number(c.outstanding_credit))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-success-500)', gap: 4 }}
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare size={14} /> WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Vendors Payables */}
      {activeTab === 'vendors' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Vendor / Company</th>
                <th>GSTIN & Contact</th>
                <th>Payable Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!filteredVendors.length ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    No vendor suppliers found. Click "Add Vendor" to create one.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{v.name}</div>
                      {v.company_name && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{v.company_name}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--text-xs)' }}>{v.phone || '—'}</div>
                      {v.gstin && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>GST: {v.gstin}</div>}
                    </td>
                    <td>
                      {Number(v.outstanding_payable || 0) > 0 ? (
                        <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                          {fmtINR(Number(v.outstanding_payable))}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>₹0</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setPayModal({
                          open: true,
                          partyType: 'vendor',
                          partyId: v.id,
                          partyName: v.name,
                          partyPhone: v.phone,
                          currentBalance: Number(v.outstanding_payable || 0)
                        })}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: 4 }}
                      >
                        <DollarSign size={14} /> Pay Vendor
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Ledger History */}
      {activeTab === 'history' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Party</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {!ledgerHistory.length ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    No ledger transactions logged yet
                  </td>
                </tr>
              ) : (
                ledgerHistory.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {new Date(l.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                        {l.party_type === 'customer' ? l.customers?.name || 'Customer' : l.vendors?.name || 'Vendor'}
                      </span>
                      <span className="badge badge-neutral" style={{ marginLeft: 6, fontSize: 'var(--text-xs)' }}>
                        {l.party_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${l.txn_type === 'payment' ? 'badge-success' : 'badge-warning'}`}>
                        {l.txn_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmtINR(Number(l.amount))}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{fmtINR(Number(l.balance_after))}</td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{l.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {payModal?.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: 'var(--space-6)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                {payModal.partyType === 'customer' ? 'Collect Payment' : 'Pay Vendor'}
              </h3>
              <button onClick={() => setPayModal(null)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Party: <strong>{payModal.partyName}</strong><br />
              Current Balance: <strong style={{ color: payModal.partyType === 'customer' ? 'var(--color-success-500)' : 'var(--color-danger-500)' }}>
                {fmtINR(payModal.currentBalance)}
              </strong>
            </p>

            <form onSubmit={handleRecordPaymentSubmit}>
              {modalError && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  {modalError}
                </div>
              )}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Payment Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  defaultValue={payModal.currentBalance}
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 'var(--space-5)' }}>
                <label className="label">Notes / Reference</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. UPI Ref #1234, Cash received"
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="button" onClick={() => setPayModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gap: 6 }}>
                  <Check size={16} /> {isSubmitting ? 'Recording…' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Vendor Modal */}
      {vendorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480, padding: 'var(--space-6)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Add New Vendor Supplier</h3>
              <button onClick={() => setVendorModal(false)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateVendorSubmit}>
              {modalError && (
                <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                  {modalError}
                </div>
              )}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Vendor / Contact Person Name *</label>
                <input name="name" className="input" placeholder="e.g. Rajesh Trading Co." required />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Company / Firm Name</label>
                <input name="company_name" className="input" placeholder="e.g. SK Enterprises" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <label className="label">Phone Number</label>
                  <input name="phone" className="input" placeholder="9876543210" />
                </div>
                <div>
                  <label className="label">GSTIN (Optional)</label>
                  <input name="gstin" className="input" placeholder="22AAAAA0000A1Z5" />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label className="label">Email Address</label>
                <input name="email" type="email" className="input" placeholder="vendor@example.com" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="button" onClick={() => setVendorModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gap: 6 }}>
                  <Check size={16} /> {isSubmitting ? 'Saving…' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

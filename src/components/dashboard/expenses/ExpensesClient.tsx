'use client'

import { useState } from 'react'
import { Plus, Receipt, Trash2, Calendar, Tag, DollarSign, X, Check } from 'lucide-react'
import { createExpense, deleteExpense } from '@/app/(dashboard)/expenses/actions'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { formatCurrency } from '@/lib/formatters'

interface ExpenseItem {
  id: string
  category: string
  amount: number
  expense_date: string
  description: string | null
  vendor_name: string | null
  created_at: string
}

interface ExpensesClientProps {
  expenses: ExpenseItem[]
}

const CATEGORIES = [
  { key: 'rent', label: 'Rent' },
  { key: 'salaries', label: 'Salaries & Wages' },
  { key: 'utilities', label: 'Electricity / Utilities' },
  { key: 'supplies', label: 'Shop Supplies' },
  { key: 'marketing', label: 'Marketing & Ads' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'taxes', label: 'Taxes & Fees' },
  { key: 'other', label: 'Other Expenses' },
]

export default function ExpensesClient({ expenses }: ExpensesClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0)

  // Group by category
  const categoryTotals = CATEGORIES.map((cat) => {
    const sum = expenses
      .filter((e) => e.category === cat.key)
      .reduce((acc, e) => acc + Number(e.amount || 0), 0)
    return { ...cat, total: sum }
  }).filter((cat) => cat.total > 0)

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setModalError(null)
    try {
      const formData = new FormData(e.currentTarget)
      await createExpense(formData)
      setModalOpen(false)
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error logging expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      await deleteExpense(deleteTargetId)
      setDeleteTargetId(null)
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error deleting expense')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Top Banner Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Recorded Expenses
            </span>
            <Receipt size={18} color="var(--color-primary-400)" />
          </div>
          <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(totalExpenseAmount)}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {expenses.length} transaction entries
          </p>
        </div>

        {/* Top expense categories breakdown */}
        <div className="card" style={{ padding: 'var(--space-4)', gridColumn: 'span 2' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Expense Breakdown by Category
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
            {!categoryTotals.length ? (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>No categorized expenses recorded</span>
            ) : (
              categoryTotals.map((c) => (
                <div key={c.key} style={{ padding: '6px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={12} color="var(--text-tertiary)" />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{c.label}:</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-500)', fontWeight: 700 }}>{formatCurrency(c.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Expense Records</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>Log and track shop operating costs</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => { setModalError(null); setModalOpen(true); }} style={{ gap: 6 }}>
            <Plus size={14} /> Record Expense
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor / Paid To</th>
                <th>Amount</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!expenses.length ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>
                    No expenses recorded yet. Click "Record Expense" above to add your first entry.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => {
                  const catObj = CATEGORIES.find((c) => c.key === e.category)
                  return (
                    <tr key={e.id}>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        {e.expense_date}
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {catObj?.label || e.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {e.description || '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {e.vendor_name || '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--color-danger-400)' }}>
                        {formatCurrency(e.amount)}
                      </td>
                      <td>
                        <button
                          onClick={() => setDeleteTargetId(e.id)}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-danger-500)' }}
                          title="Delete expense entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460, padding: 'var(--space-6)', background: 'var(--surface-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Record Business Expense</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Category *</label>
                <select name="category" className="input select" defaultValue="other">
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Amount (₹) *</label>
                <input name="amount" type="number" step="0.01" className="input" placeholder="0.00" required autoFocus />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Expense Date</label>
                <input name="expense_date" type="date" className="input" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="label">Description / Note</label>
                <input name="description" className="input" placeholder="e.g. July Office Rent payment" />
              </div>

              <div style={{ marginBottom: 'var(--space-5)' }}>
                <label className="label">Paid To / Vendor Name</label>
                <input name="vendor_name" className="input" placeholder="e.g. Landlord Name / Supplier Co." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ gap: 6 }}>
                  <Check size={16} /> {isSubmitting ? 'Saving…' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Expense Record"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        confirmText="Delete Record"
        variant="danger"
        isPending={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpensesClient from '@/components/dashboard/expenses/ExpensesClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Expense Tracking' }

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) redirect('/login')

  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, category, amount, expense_date, description, vendor_name, created_at')
    .eq('shop_id', shopUser.shop_id)
    .order('expense_date', { ascending: false })

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">Track, categorize, and control store operating expenses</p>
        </div>
      </div>

      <ExpensesClient
        expenses={(expenses ?? []).map((e) => ({
          ...e,
          amount: Number(e.amount || 0),
        }))}
      />
    </div>
  )
}

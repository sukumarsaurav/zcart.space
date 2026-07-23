'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) throw new Error('Shop not found')

  const category = (formData.get('category') as string) || 'other'
  const amount = Number(formData.get('amount') || 0)
  const description = (formData.get('description') as string) || null
  const vendor_name = (formData.get('vendor_name') as string) || null
  const expense_date = (formData.get('expense_date') as string) || new Date().toISOString().split('T')[0]

  if (amount <= 0) {
    throw new Error('Expense amount must be greater than zero')
  }

  const { error } = await supabase.from('expenses').insert({
    shop_id: shopUser.shop_id,
    category: category as any,
    amount,
    expense_date,
    description,
    vendor_name,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/expenses')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/expenses')
  return { success: true }
}

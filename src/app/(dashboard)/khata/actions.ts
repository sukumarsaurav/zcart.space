'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordPartyPayment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) throw new Error('Shop not found')

  const partyType = formData.get('partyType') as 'customer' | 'vendor'
  const partyId = formData.get('partyId') as string
  const amount = Number(formData.get('amount') || 0)
  const notes = (formData.get('notes') as string) || ''

  if (!partyId || amount <= 0) {
    throw new Error('Invalid party or amount')
  }

  if (partyType === 'customer') {
    // 1. Fetch customer
    const { data: customer } = await supabase
      .from('customers')
      .select('outstanding_credit')
      .eq('id', partyId)
      .single()

    if (!customer) throw new Error('Customer not found')

    const newBalance = Math.max(0, Number(customer.outstanding_credit || 0) - amount)

    // 2. Insert into credit_ledger
    await supabase.from('credit_ledger').insert({
      shop_id: shopUser.shop_id,
      customer_id: partyId,
      party_type: 'customer',
      txn_type: 'payment',
      amount,
      balance_after: newBalance,
      notes: notes || 'Payment collected',
    })

    // 3. Update customer outstanding credit
    await supabase
      .from('customers')
      .update({ outstanding_credit: newBalance })
      .eq('id', partyId)

  } else {
    // Vendor payment
    const { data: vendor } = await supabase
      .from('vendors')
      .select('outstanding_payable')
      .eq('id', partyId)
      .single()

    if (!vendor) throw new Error('Vendor not found')

    const newBalance = Math.max(0, Number(vendor.outstanding_payable || 0) - amount)

    // 2. Insert into credit_ledger
    await supabase.from('credit_ledger').insert({
      shop_id: shopUser.shop_id,
      vendor_id: partyId,
      party_type: 'vendor',
      txn_type: 'payment',
      amount,
      balance_after: newBalance,
      notes: notes || 'Vendor payment',
    })

    // 3. Update vendor outstanding payable
    await supabase
      .from('vendors')
      .update({ outstanding_payable: newBalance })
      .eq('id', partyId)
  }

  revalidatePath('/khata')
  return { success: true }
}

export async function createVendor(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!shopUser) throw new Error('Shop not found')

  const name = formData.get('name') as string
  const company_name = (formData.get('company_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const gstin = (formData.get('gstin') as string) || null
  const address_line1 = (formData.get('address_line1') as string) || null

  if (!name) throw new Error('Vendor name is required')

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      shop_id: shopUser.shop_id,
      name,
      company_name,
      phone,
      email,
      gstin,
      address_line1,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/khata')
  return { success: true, data }
}

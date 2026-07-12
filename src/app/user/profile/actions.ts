'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(fullName: string, phone: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  // Upsert rather than update: a profile row may not exist yet if it wasn't
  // created during OTP login (e.g. accounts created before that logic existed).
  const { error } = await supabase
    .from('global_profiles')
    .upsert(
      {
        auth_user_id: user.id,
        full_name: fullName,
        phone,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || user.email || 'User')}&background=random`,
      },
      { onConflict: 'auth_user_id' }
    )

  if (error) return { error: error.message }
  revalidatePath('/user/profile')
  return { success: true }
}

interface AddressInput {
  id?: string
  label: string
  fullName: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export async function saveAddress(profileId: string, input: AddressInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const payload = {
    profile_id: profileId,
    label: input.label,
    full_name: input.fullName,
    phone: input.phone,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2 || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    is_default: input.isDefault,
  }

  const { error } = input.id
    ? await supabase.from('global_addresses').update(payload).eq('id', input.id)
    : await supabase.from('global_addresses').insert(payload)

  if (error) return { error: error.message }
  revalidatePath('/user/profile')
  return { success: true }
}

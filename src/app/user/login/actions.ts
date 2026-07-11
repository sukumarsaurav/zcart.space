'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // You can also pass a redirect URL if you want a magic link instead of OTP
      shouldCreateUser: true,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    throw new Error(error.message)
  }
  
  // Create a global profile if it doesn't exist
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: existingProfile } = await supabase
      .from('global_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!existingProfile) {
      await supabase.from('global_profiles').insert({
        auth_user_id: user.id,
        full_name: email.split('@')[0], // default name
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random`,
      })
    }
  }

  redirect('/user/profile')
}

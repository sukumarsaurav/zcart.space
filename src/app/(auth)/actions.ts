'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'
import slugify from 'slugify'

// ─────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  shopName: z.string().min(2, 'Shop name must be at least 2 characters').max(60, 'Shop name too long'),
  phone: z.string().optional(),
})

export type ActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

// ─────────────────────────────────────────────
// Login action
// ─────────────────────────────────────────────

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message === 'Invalid login credentials'
      ? 'Invalid email or password. Please try again.'
      : error.message
    }
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Signup action
// ─────────────────────────────────────────────

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    shopName: String(formData.get('shopName') ?? ''),
    phone: String(formData.get('phone') ?? '') || undefined,
  }

  const parsed = signupSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Could not create account. Please try again.' }
  }

  // 2. Generate unique shop slug
  const baseSlug = slugify(parsed.data.shopName, { lower: true, strict: true })
  const uniqueSuffix = Math.random().toString(36).slice(2, 6)
  const shopSlug = `${baseSlug}-${uniqueSuffix}`

  // 3. Create shop record (using service client to bypass RLS)
  const supabaseService = await createServiceClient()
  const { data: shop, error: shopError } = await supabaseService
    .from('shops')
    .insert({
      name: parsed.data.shopName,
      slug: shopSlug,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      theme: { primary_color: '#6366f1', font: 'inter', template: 'default' },
    })
    .select('id')
    .single()

  if (shopError || !shop) {
    console.error('Shop creation error:', shopError)
    return { error: 'Could not create your shop. Please try again.' }
  }

  // 4. Create primary shop location
  await supabaseService.from('shop_locations').insert({
    shop_id: shop.id,
    name: 'Main Store',
    is_primary: true,
    is_active: true,
  })

  // 5. Create shop_user record (owner role)
  const { error: userError } = await supabaseService.from('shop_users').insert({
    shop_id: shop.id,
    auth_user_id: authData.user.id,
    role: 'owner',
    display_name: parsed.data.shopName + ' Owner',
    phone: parsed.data.phone ?? null,
    is_active: true,
    joined_at: new Date().toISOString(),
  })

  if (userError) {
    return { error: 'Account created but shop setup failed. Please contact support.' }
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Logout action
// ─────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

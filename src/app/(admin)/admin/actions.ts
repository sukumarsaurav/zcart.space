'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient, getAuthUser } from '@/lib/supabase/server'
import { checkIsSuperAdmin } from '@/lib/auth/admin'
import type { ShopPlan, Plan } from '@/types/database'

async function assertSuperAdmin() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  const isSuper = await checkIsSuperAdmin(user.id)
  if (!isSuper) {
    throw new Error('Forbidden: Super Admin rights required')
  }
  return user
}

export async function updateShopPlanAction(shopId: string, plan: ShopPlan, planExpiresAt?: string | null) {
  await assertSuperAdmin()
  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('shops')
    .update({
      plan,
      plan_expires_at: planExpiresAt || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shopId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/shops')
  return { success: true }
}

export async function toggleShopStatusAction(shopId: string, isActive: boolean) {
  await assertSuperAdmin()
  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('shops')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', shopId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/shops')
  return { success: true }
}

export async function updatePlanDetailsAction(planId: string, updates: Partial<Plan>) {
  await assertSuperAdmin()
  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('plans')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/plans')
  revalidatePath('/pricing')
  return { success: true }
}

export async function toggleUserSuperAdminAction(targetAuthUserId: string, isSuperadmin: boolean) {
  await assertSuperAdmin()
  const serviceClient = await createServiceClient()

  const { error } = await serviceClient
    .from('global_profiles')
    .update({
      is_superadmin: isSuperadmin,
      updated_at: new Date().toISOString(),
    })
    .eq('auth_user_id', targetAuthUserId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

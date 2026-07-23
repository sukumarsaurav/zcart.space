'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCoupon(shopId: string, formData: FormData) {
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string)?.trim() || null
  const discountType = formData.get('discount_type') as 'flat' | 'percent'
  const discountValue = Number(formData.get('discount_value'))
  const maxDiscountVal = formData.get('max_discount')
  const maxDiscount = maxDiscountVal ? Number(maxDiscountVal) : null
  const minOrderValue = Number(formData.get('min_order_value') || 0)
  const usageLimitVal = formData.get('usage_limit')
  const usageLimit = usageLimitVal ? Number(usageLimitVal) : null
  const isActive = formData.get('is_active') === 'on'
  
  const startsAtVal = formData.get('starts_at') as string
  const startsAt = startsAtVal ? new Date(startsAtVal).toISOString() : null
  const expiresAtVal = formData.get('expires_at') as string
  const expiresAt = expiresAtVal ? new Date(expiresAtVal).toISOString() : null

  if (!code) return { error: 'Coupon code is required' }
  if (isNaN(discountValue) || discountValue <= 0) return { error: 'Valid discount value is required' }

  const supabase = await createClient()

  const { error } = await supabase.from('coupons').insert({
    shop_id: shopId,
    code,
    description,
    scope: 'order', // default order-level scope
    discount_type: discountType,
    discount_value: discountValue,
    max_discount: maxDiscount,
    min_order_value: minOrderValue,
    usage_limit: usageLimit,
    usage_count: 0,
    per_user_limit: 1,
    is_active: isActive,
    starts_at: startsAt,
    expires_at: expiresAt,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Coupon code must be unique' }
    return { error: error.message }
  }

  revalidatePath('/coupons')
  return { success: true }
}

export async function updateCoupon(shopId: string, couponId: string, formData: FormData) {
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string)?.trim() || null
  const discountType = formData.get('discount_type') as 'flat' | 'percent'
  const discountValue = Number(formData.get('discount_value'))
  const maxDiscountVal = formData.get('max_discount')
  const maxDiscount = maxDiscountVal ? Number(maxDiscountVal) : null
  const minOrderValue = Number(formData.get('min_order_value') || 0)
  const usageLimitVal = formData.get('usage_limit')
  const usageLimit = usageLimitVal ? Number(usageLimitVal) : null
  const isActive = formData.get('is_active') === 'on'
  
  const startsAtVal = formData.get('starts_at') as string
  const startsAt = startsAtVal ? new Date(startsAtVal).toISOString() : null
  const expiresAtVal = formData.get('expires_at') as string
  const expiresAt = expiresAtVal ? new Date(expiresAtVal).toISOString() : null

  if (!code) return { error: 'Coupon code is required' }
  if (isNaN(discountValue) || discountValue <= 0) return { error: 'Valid discount value is required' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('coupons')
    .update({
      code,
      description,
      discount_type: discountType,
      discount_value: discountValue,
      max_discount: maxDiscount,
      min_order_value: minOrderValue,
      usage_limit: usageLimit,
      is_active: isActive,
      starts_at: startsAt,
      expires_at: expiresAt,
    })
    .eq('id', couponId)
    .eq('shop_id', shopId)

  if (error) {
    if (error.code === '23505') return { error: 'Coupon code must be unique' }
    return { error: error.message }
  }

  revalidatePath('/coupons')
  return { success: true }
}

export async function deleteCoupon(shopId: string, couponId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId)
    .eq('shop_id', shopId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/coupons')
  return { success: true }
}

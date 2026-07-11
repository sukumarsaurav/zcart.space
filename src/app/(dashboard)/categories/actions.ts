'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCategory(shopId: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parent_id') as string
  const isActive = formData.get('is_active') === 'on'

  if (!name || !slug) return { error: 'Name and slug are required' }

  let imageUrl = null
  const coverImage = formData.get('cover_image') as File | null
  
  const supabase = await createClient()

  if (coverImage && coverImage.size > 0) {
    const ext = coverImage.name.split('.').pop()
    const path = `${shopId}/categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('shop-assets')
      .upload(path, coverImage, { cacheControl: '3600', upsert: false })
      
    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(uploadData.path)
      imageUrl = publicUrl
    }
  }

  const { error } = await supabase.from('categories').insert({
    shop_id: shopId,
    name,
    slug,
    parent_id: parentId || null,
    is_active: isActive,
    sort_order: 0,
    image_url: imageUrl,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Slug must be unique' }
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}

export async function updateCategory(shopId: string, categoryId: string, formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const parentId = formData.get('parent_id') as string
  const isActive = formData.get('is_active') === 'on'

  if (!name || !slug) return { error: 'Name and slug are required' }

  const supabase = await createClient()
  
  const updateData: any = {
    name,
    slug,
    parent_id: parentId || null,
    is_active: isActive,
  }

  const coverImage = formData.get('cover_image') as File | null
  if (coverImage && coverImage.size > 0) {
    const ext = coverImage.name.split('.').pop()
    const path = `${shopId}/categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('shop-assets')
      .upload(path, coverImage, { cacheControl: '3600', upsert: false })
      
    if (!uploadError && uploadData) {
      const { data: { publicUrl } } = supabase.storage.from('shop-assets').getPublicUrl(uploadData.path)
      updateData.image_url = publicUrl
    }
  }

  const { error } = await supabase.from('categories').update(updateData).eq('id', categoryId).eq('shop_id', shopId)

  if (error) {
    if (error.code === '23505') return { error: 'Slug must be unique' }
    return { error: error.message }
  }

  revalidatePath('/categories')
  return { success: true }
}

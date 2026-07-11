import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tag, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import CategoriesClient from '@/components/dashboard/CategoriesClient'

export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users').select('shop_id').eq('auth_user_id', user.id).single()
  if (!shopUser) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, is_active, sort_order, image_url')
    .eq('shop_id', shopUser.shop_id)
    .order('sort_order')

  const { data: productCounts } = await supabase
    .from('products')
    .select('category_id')
    .eq('shop_id', shopUser.shop_id)
    .eq('status', 'active')

  const countMap: Record<string, number> = {}
  productCounts?.forEach((p) => { if (p.category_id) countMap[p.category_id] = (countMap[p.category_id] ?? 0) + 1 })

  // Nest categories
  const roots = categories?.filter((c) => !c.parent_id) ?? []
  const children = (parentId: string) => categories?.filter((c) => c.parent_id === parentId) ?? []

  return (
    <CategoriesClient shopId={shopUser.shop_id} categories={categories || []} countMap={countMap} />
  )
}

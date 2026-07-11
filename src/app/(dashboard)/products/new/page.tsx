import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/dashboard/ProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Add Product' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()
  if (!shopUser) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, parent_id')
    .eq('shop_id', shopUser.shop_id)
    .eq('is_active', true)
    .order('name')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">Add a new product to your catalogue</p>
        </div>
      </div>
      <ProductForm shopId={shopUser.shop_id} categories={categories ?? []} />
    </div>
  )
}

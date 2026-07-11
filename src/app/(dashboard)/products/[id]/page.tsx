import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ProductForm from '@/components/dashboard/ProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shopUser } = await supabase
    .from('shop_users')
    .select('shop_id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (!shopUser) redirect('/login')

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('shop_id', shopUser.shop_id)
    .single()

  if (!product) notFound()

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
          <h1 className="page-title">Edit Product</h1>
          <p className="page-subtitle">Update product information and metadata</p>
        </div>
      </div>
      <ProductForm shopId={shopUser.shop_id} categories={categories ?? []} product={product} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import UserLoginClient from './UserLoginClient'

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams

  // The login page lives outside /[shopSlug]/, so it has no shop context by
  // default. If we got here from a shop's storefront (wishlist/review "log in
  // first" flow), the redirect target tells us which shop to brand this as.
  const shopSlug = redirect?.match(/^\/([^/?]+)/)?.[1]
  let shop: { name: string; logo_url: string | null } | null = null

  if (shopSlug && shopSlug !== 'user') {
    const supabase = await createClient()
    const { data } = await supabase
      .from('shops')
      .select('name, logo_url')
      .eq('slug', shopSlug)
      .eq('is_active', true)
      .single()
    shop = data
  }

  return <UserLoginClient shop={shop} redirectTo={redirect} />
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile | zCart',
}

export default async function UserProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/user/login')
  }

  // Fetch global profile
  let { data: profile } = await supabase
    .from('global_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  // Lazily create the profile row if it wasn't created during OTP login (e.g.
  // accounts created before that logic existed) — addresses need a real profile_id.
  if (!profile) {
    const { data: created } = await supabase
      .from('global_profiles')
      .insert({
        auth_user_id: user.id,
        full_name: user.email?.split('@')[0] || 'User',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'User')}&background=random`,
      })
      .select('*')
      .single()
    profile = created
  }

  const safeProfile = profile || {
    id: 'temp-id',
    full_name: user.email?.split('@')[0] || 'User',
    email: user.email,
    phone: '',
    avatar_url: `https://ui-avatars.com/api/?name=${user.email}&background=random`
  }

  // Fetch addresses
  let addresses = []
  if (profile) {
    const { data: addr } = await supabase
      .from('global_addresses')
      .select('*')
      .eq('profile_id', profile.id)
      .order('is_default', { ascending: false })
    if (addr) addresses = addr
  }

  // Fetch order history across all shops
  // Using email match if customers table doesn't have auth_user_id linked yet,
  // or fetch orders via auth_user_id on customers.
  // We'll join orders -> customers where customers.email = user.email for now.
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, created_at, total_amount, status,
      shop:shops(name, slug),
      customer:customers!inner(email)
    `)
    .eq('customers.email', user.email)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-sunken)', color: 'var(--text-primary)' }}>
      {/* Simple Global Header */}
      <header style={{ 
        height: 64, background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)',
        display: 'flex', alignItems: 'center', padding: '0 var(--space-6)'
      }}>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--brand-primary)' }}>
          zCart
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user.email}</span>
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/user/login')
          }}>
            <button type="submit" className="btn btn-ghost btn-sm">Sign Out</button>
          </form>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>My Profile</h1>
        <ProfileClient initialProfile={safeProfile} initialAddresses={addresses} initialOrders={orders || []} email={user.email!} />
      </main>
    </div>
  )
}

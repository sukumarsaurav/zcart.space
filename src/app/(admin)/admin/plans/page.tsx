import { createServiceClient } from '@/lib/supabase/server'
import PlansManagerClient from '@/components/admin/PlansManagerClient'
import type { Plan } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription Plans Manager',
}

export const revalidate = 0

export default async function AdminPlansPage() {
  const serviceClient = await createServiceClient()

  const { data: plans } = await serviceClient
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Subscription Plans & Feature Limits</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure monthly & annual plan prices, maximum products, staff limits, and active status for merchant tiers.
        </p>
      </div>

      <PlansManagerClient plans={(plans as Plan[]) ?? []} />
    </div>
  )
}

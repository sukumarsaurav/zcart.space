import { createClient as createPublicClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import type { Plan, FeatureCatalogEntry, PlanFeature } from '@/types/database'
import type { PlanWithFeatures } from '@/components/marketing/PricingSection'

/** Fetches all active plans with their included-feature labels, for pricing cards. (Cached 1 hr) */
export const getPlansWithFeatures = unstable_cache(
  async (): Promise<PlanWithFeatures[]> => {
    const supabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (!plans?.length) return []

    const { data: matrix } = await supabase
      .from('plan_features')
      .select('plan_id, feature_id, is_included, note, feature_catalog(label, sort_order)')
      .in('plan_id', plans.map((p) => p.id))
      .eq('is_included', true)

    return plans.map((plan) => {
      const rows = (matrix ?? [])
        .filter((m: any) => m.plan_id === plan.id)
        .sort((a: any, b: any) => (a.feature_catalog?.sort_order ?? 0) - (b.feature_catalog?.sort_order ?? 0))
      return {
        ...plan,
        featureLabels: rows.map((m: any) =>
          m.note ? `${m.feature_catalog?.label} (${m.note})` : m.feature_catalog?.label
        ).filter(Boolean),
      }
    })
  },
  ['plans-with-features'],
  { revalidate: 3600 }
)


/** Fetches raw plans + full feature catalog + inclusion matrix, for the comparison table. */
export async function getFullPricingData(): Promise<{
  plans: Plan[]
  features: FeatureCatalogEntry[]
  matrix: PlanFeature[]
}> {
  const supabase = await createClient()

  const [{ data: plans }, { data: features }, { data: matrix }] = await Promise.all([
    supabase.from('plans').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('feature_catalog').select('*').order('sort_order'),
    supabase.from('plan_features').select('*'),
  ])

  return { plans: plans ?? [], features: features ?? [], matrix: matrix ?? [] }
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Shop, ShopTheme } from '@/types/database'
import BottomNav from '@/components/storefront/BottomNav'

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ shopSlug: string }>
}) {
  const supabase = await createClient()
  const { shopSlug } = await params

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, slug, theme, logo_url, banner_url, phone, email, is_active')
    .eq('slug', shopSlug)
    .eq('is_active', true)
    .single()

  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const primaryColor = theme.primary_color ?? '#6366f1'
  const fontFam = theme.font === 'playfair' ? '"Playfair Display", serif' 
    : theme.font === 'roboto' ? '"Roboto", sans-serif' 
    : theme.font === 'space-grotesk' ? '"Space Grotesk", sans-serif' 
    : theme.font === 'outfit' ? '"Outfit", sans-serif' 
    : '"Inter", sans-serif'

  const radBase = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '9999px' : '8px'
  const radSm = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '16px' : '4px'
  const radLg = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '24px' : '12px'

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --shop-primary: ${primaryColor};
          --shop-primary-light: ${primaryColor}22;
          --shop-primary-border: ${primaryColor}44;
          --shop-font: ${fontFam};
          --shop-radius: ${radBase};
          --shop-radius-sm: ${radSm};
          --shop-radius-lg: ${radLg};
        }
        
        /* Apply dynamic font and radius to basic elements */
        body { font-family: var(--shop-font); }
        .btn, button { border-radius: var(--shop-radius) !important; font-family: var(--shop-font); }
        .card { border-radius: var(--shop-radius-lg) !important; }
        .input { border-radius: var(--shop-radius) !important; }
        img { border-radius: var(--shop-radius) !important; }
      `}</style>
      <div data-shop-slug={shopSlug} data-shop-id={shop.id} data-template={theme.template} data-storefront-theme="dark-gold" style={{ paddingBottom: '70px' }}>
        {children}
        <BottomNav shopSlug={shopSlug} />
      </div>
    </>
  )
}

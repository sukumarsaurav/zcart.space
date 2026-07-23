import { notFound } from 'next/navigation'
import type { ShopTheme } from '@/types/database'
import BottomNav from '@/components/storefront/BottomNav'
import { getShopBySlug } from '@/lib/storefront/shop'
import { Inter, Outfit, Playfair_Display, Roboto, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const outfit = Outfit({ subsets: ['latin'], display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap' })
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], display: 'swap' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' })

const fontMap = {
  inter,
  outfit,
  playfair,
  roboto,
  'space-grotesk': spaceGrotesk,
}

export const revalidate = 60

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ shopSlug: string }>
}) {
  const { shopSlug } = await params
  const shop = await getShopBySlug(shopSlug)

  if (!shop) notFound()

  const theme = shop.theme as ShopTheme
  const primaryColor = theme.primary_color ?? '#6366f1'
  const selectedFont = fontMap[theme.font as keyof typeof fontMap] ?? inter
  const fontFam = selectedFont.style.fontFamily

  const radBase = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '9999px' : '8px'
  const radSm = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '16px' : '4px'
  const radLg = theme.radius === 'sharp' ? '0px' : theme.radius === 'pill' ? '24px' : '12px'

  return (
    <div className={selectedFont.className}>
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
    </div>
  )
}


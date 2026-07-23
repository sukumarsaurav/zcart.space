import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const url = request.nextUrl.clone()

  // Detect subdomain for multi-tenant storefront routing
  const hostHeader = request.headers.get('host') || ''
  const hostname = hostHeader.split(':')[0] // Strip port for accurate hostname comparisons
  let appHost = hostname // fallback: if unset/unparsable, never treat any host as a subdomain
  try {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      appHost = new URL(process.env.NEXT_PUBLIC_APP_URL).hostname // e.g. zcart.space or localhost
    }
  } catch {
    // malformed NEXT_PUBLIC_APP_URL — fall through with appHost === hostname (isSubdomain stays false)
  }

  // Check if this is a genuine subdomain of the configured app host (e.g.
  // myshop.zcart.space). Anything that isn't literally a `*.appHost` label —
  // including unrelated hosts like a Vercel preview/production URL — must
  // NOT be treated as a subdomain, or the root site 404s trying to resolve
  // that hostname as a shop slug.
  const isSubdomain =
    hostname !== appHost &&
    hostname !== `www.${appHost}` &&
    hostname.endsWith(`.${appHost}`) &&
    !hostname.startsWith('localhost')

  // Protect dashboard routes — redirect to login if unauthenticated
  const isDashboardRoute =
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/products') ||
    url.pathname.startsWith('/categories') ||
    url.pathname.startsWith('/orders') ||
    url.pathname.startsWith('/inventory') ||
    url.pathname.startsWith('/invoices') ||
    url.pathname.startsWith('/pos') ||
    url.pathname.startsWith('/settings')

  const isAuthRoute = url.pathname === '/login' || url.pathname === '/signup'

  // Check if there is a Supabase session cookie present
  const cookies = request.cookies.getAll()
  const hasSessionCookie = cookies.some((cookie) => cookie.name.startsWith('sb-'))

  if (!hasSessionCookie) {
    // If no session cookie exists and they try to hit the dashboard, redirect immediately
    if (isDashboardRoute) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // If it's a subdomain, rewrite to storefront and skip auth check
    if (isSubdomain) {
      const shopSlug = hostname.split('.')[0]
      url.pathname = `/${shopSlug}${url.pathname}`
      return NextResponse.rewrite(url)
    }

    // For other public routes, continue without calling Supabase auth
    return supabaseResponse
  }

  if (isSubdomain) {
    const shopSlug = hostname.split('.')[0]
    url.pathname = `/${shopSlug}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Only refresh/verify session via Supabase network call if accessing protected dashboard or auth routes
  if (isDashboardRoute || isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isDashboardRoute && !user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}


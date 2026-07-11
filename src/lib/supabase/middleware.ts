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
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL!)
  const appHost = appUrl.hostname // e.g. zcart.space or localhost

  // Check if this is a subdomain request (e.g. myshop.zcart.space)
  const isSubdomain =
    hostname !== appHost &&
    hostname !== `www.${appHost}` &&
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

  // Refresh session — do NOT remove, needed to keep server session alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isSubdomain) {
    const shopSlug = hostname.split('.')[0]
    // Rewrite to storefront routes
    url.pathname = `/${shopSlug}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  if (isDashboardRoute && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Supported locales for redirect building
const LOCALES = ['en', 'th', 'cn', 'ru'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase Env Vars missing in Middleware!');
    return response;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookies for downstream middleware
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Set cookie on response - use Supabase's options exactly as provided
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Refresh session - this is critical for keeping the session alive
  // getSession() will automatically refresh the token if it's expiring
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  // Get current locale from path or cookie
  const pathname = request.nextUrl.pathname;
  const pathLocale = LOCALES.find(loc => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`);
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const locale = pathLocale || (cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : 'en');

  // Protect /agent routes (with or without locale prefix)
  const isAgentRoute = pathname.startsWith('/agent') || 
    LOCALES.some(loc => pathname.startsWith(`/${loc}/agent`));
  
  if (isAgentRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    // Preserve the intended destination for post-login redirect
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response
}

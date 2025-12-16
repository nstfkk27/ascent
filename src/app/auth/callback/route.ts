import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  // Get the "next" param for post-auth redirect, default to /agent
  const next = searchParams.get('next') ?? '/agent';
  
  // Get locale from cookie or default to 'en'
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = localeCookie && ['en', 'th', 'cn', 'ru'].includes(localeCookie) ? localeCookie : 'en';
  
  // Build locale-aware redirect path
  const buildRedirectUrl = (path: string) => {
    // If path already starts with a locale, use as-is
    if (/^\/(en|th|cn|ru)(\/|$)/.test(path)) {
      return `${origin}${path}`;
    }
    // Otherwise prepend locale
    return `${origin}/${locale}${path.startsWith('/') ? path : '/' + path}`;
  };

  const supabase = createClient();

  // Handle PKCE code exchange (OAuth and email confirmation)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(buildRedirectUrl(next));
    }
    console.error('Auth callback error (code exchange):', error.message);
  }

  // Handle token hash (magic link, password recovery)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'recovery' | 'invite' | 'magiclink',
    });
    if (!error) {
      // For recovery, redirect to update-password page
      if (type === 'recovery') {
        return NextResponse.redirect(buildRedirectUrl('/login/update-password'));
      }
      return NextResponse.redirect(buildRedirectUrl(next));
    }
    console.error('Auth callback error (token verification):', error.message);
  }

  // Return the user to login page with error
  return NextResponse.redirect(buildRedirectUrl('/login?error=Could not authenticate user'));
}

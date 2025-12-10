import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'th', 'cn', 'ru'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  // 1. Run Supabase middleware to handle session (cookies)
  const response = await updateSession(request);
  
  // 2. Run intl middleware
  const intlResponse = intlMiddleware(request);

  // If intlMiddleware returns a redirect/rewrite, we should likely respect it.
  // We need to copy any cookies set by Supabase to the intlResponse.
  if (response.headers.has('set-cookie')) {
     const cookies = response.headers.get('set-cookie');
     if (cookies) {
       intlResponse.headers.set('set-cookie', cookies);
     }
  }

  return intlResponse;
}
 
export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

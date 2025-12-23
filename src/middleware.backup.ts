import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
import { logger } from '@/lib/logger';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'th', 'cn', 'ru'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;

  try {
    const response = await updateSession(request);
    
    logger.debug('Request', {
      method: request.method,
      path,
      ip: request.headers.get('x-forwarded-for') || request.ip,
    });

    const intlResponse = intlMiddleware(request);

    if (response.headers.has('set-cookie')) {
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        intlResponse.headers.set('set-cookie', cookies);
      }
    }

    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      logger.warn('Slow middleware', {
        path,
        duration: `${duration}ms`,
      });
    }

    return intlResponse;
  } catch (error) {
    logger.error('Middleware error', {
      path,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return intlMiddleware(request);
  }
}
 
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};

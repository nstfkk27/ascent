import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase Env Vars missing!');
    return null as any; // Prevent crash, but functionality will break safely
  }

  return createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        const cookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
      },
      set(name: string, value: string, options: any) {
        let cookie = `${name}=${encodeURIComponent(value)}`;
        
        // Always set path to root to ensure cookies are available across all routes
        cookie += `; path=${options?.path || '/'}`;
        
        if (options?.maxAge) {
          cookie += `; max-age=${options.maxAge}`;
        }
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        if (options?.sameSite) {
          cookie += `; samesite=${options.sameSite}`;
        } else {
          // Default to lax for better compatibility
          cookie += '; samesite=lax';
        }
        if (options?.secure || window.location.protocol === 'https:') {
          cookie += '; secure';
        }
        
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        // Must match the path used when setting the cookie
        let cookie = `${name}=; max-age=0; path=${options?.path || '/'}`;
        if (options?.domain) {
          cookie += `; domain=${options.domain}`;
        }
        document.cookie = cookie;
      },
    },
  });
}

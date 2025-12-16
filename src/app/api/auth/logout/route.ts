import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createClient();
  
  // Sign out from Supabase (clears server-side session)
  await supabase.auth.signOut();
  
  // Get locale for redirect
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = localeCookie && ['en', 'th', 'cn', 'ru'].includes(localeCookie) ? localeCookie : 'en';
  
  // Return success with redirect URL
  return NextResponse.json({ 
    success: true, 
    redirectTo: `/${locale}` 
  });
}

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({
        authenticated: false,
        error: error.message,
        details: error
      });
    }

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: 'No session found'
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      expiresAt: session.expires_at,
      expiresIn: session.expires_at ? Math.floor((session.expires_at * 1000 - Date.now()) / 1000) : null,
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check session',
      details: String(error)
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    hasUrl: !!url,
    hasKey: !!key,
    urlPrefix: url ? url.substring(0, 20) + '...' : 'missing',
    keyPrefix: key ? key.substring(0, 20) + '...' : 'missing',
    nodeEnv: process.env.NODE_ENV,
  });
}

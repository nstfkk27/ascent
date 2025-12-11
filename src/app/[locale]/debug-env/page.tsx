import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  const envStatus = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'MISSING',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'MISSING',
    dbUrl: process.env.DATABASE_URL ? 'Present' : 'MISSING',
  };

  let dbStatus = 'Unknown';
  let dbError = '';

  try {
    const count = await prisma.property.count();
    dbStatus = `Connected! Properties count: ${count}`;
  } catch (e: any) {
    dbStatus = 'Failed';
    dbError = e.message;
  }

  return (
    <div className="p-8 font-mono text-sm max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Environment Debugger</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">Environment Variables</h2>
          <pre>{JSON.stringify(envStatus, null, 2)}</pre>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">Database Connection</h2>
          <p className={dbStatus === 'Failed' ? 'text-red-600' : 'text-green-600'}>
            Status: {dbStatus}
          </p>
          {dbError && (
            <p className="text-red-600 mt-2 whitespace-pre-wrap">
              Error: {dbError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Find agent profile by email (case-insensitive)
    let agent = await prisma.agentProfile.findFirst({
      where: { 
        email: {
          equals: user.email,
          mode: 'insensitive'
        }
      }
    });

    if (!agent) {
       // Auto-create profile for new users with default AGENT role
       try {
         // Extract name from various possible sources
         const userName = 
           user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.user_metadata?.user_name ||
           user.email?.split('@')[0] || 
           'Agent';

         // Create new profile
         agent = await prisma.agentProfile.create({
           data: {
             email: user.email,
             name: userName,
             role: 'AGENT', // Default role for new signups
             imageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
             phone: null,
             whatsapp: null,
             lineId: null,
             languages: [],
           }
         });

         return NextResponse.json({
           authenticated: true,
           id: agent.id,
           role: agent.role,
           name: agent.name,
           email: agent.email,
           imageUrl: agent.imageUrl,
           debug: {
             message: 'Profile auto-created on first login',
             createdAt: new Date().toISOString()
           }
         });
       } catch (createError) {
         console.error('Error creating agent profile:', createError);
         console.error('User metadata:', JSON.stringify(user.user_metadata, null, 2));
         console.error('User email:', user.email);
         
         // Return a temporary response so user can still access the system
         return NextResponse.json({
           authenticated: true,
           role: 'AGENT',
           name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Agent',
           email: user.email,
           error: 'Failed to create profile in database',
           debug: {
             message: 'Profile creation failed',
             error: createError instanceof Error ? createError.message : 'Unknown error'
           }
         }, { status: 500 });
       }
    }

    return NextResponse.json({
      authenticated: true,
      id: agent.id,
      role: agent.role, // SUPER_ADMIN, PLATFORM_AGENT, AGENT
      name: agent.name,
      email: agent.email,
      companyName: agent.companyName,
      imageUrl: agent.imageUrl,
      debug: {
        message: 'Profile found',
        roleInDb: agent.role
      }
    });

  } catch (error) {
    console.error('Error fetching agent profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

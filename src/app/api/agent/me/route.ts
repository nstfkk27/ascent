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

    // Find agent profile by email
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    // If no profile exists yet, return default role (e.g., AGENT) or create one?
    // For now, we'll return a basic structure. In a real app, we might auto-create or require admin approval.
    // Let's assume manual creation for now, or default to AGENT if not found but authenticated.
    
    if (!agent) {
       // Fallback for new users who haven't been assigned a profile yet
       return NextResponse.json({ 
         authenticated: true, 
         role: 'AGENT', 
         name: user.user_metadata?.full_name || user.email.split('@')[0],
         email: user.email 
       });
    }

    return NextResponse.json({
      authenticated: true,
      id: agent.id,
      role: agent.role, // SUPER_ADMIN, PLATFORM_AGENT, AGENT
      name: agent.name,
      email: agent.email,
      imageUrl: agent.imageUrl
    });

  } catch (error) {
    console.error('Error fetching agent profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

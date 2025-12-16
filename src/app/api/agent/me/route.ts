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
    const agent = await prisma.agentProfile.findFirst({
      where: { 
        email: {
          equals: user.email,
          mode: 'insensitive'
        }
      }
    });

    if (!agent) {
       // Auto-create profile for new users with default AGENT role
       const newAgent = await prisma.agentProfile.create({
         data: {
           email: user.email,
           name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
           role: 'AGENT', // Default role for new signups
           imageUrl: user.user_metadata?.avatar_url || null,
           companyName: null,
           phone: null,
           whatsapp: null,
           lineId: null,
           languages: [],
         }
       });

       return NextResponse.json({
         authenticated: true,
         id: newAgent.id,
         role: newAgent.role,
         name: newAgent.name,
         email: newAgent.email,
         imageUrl: newAgent.imageUrl,
         debug: {
           message: 'Profile auto-created on first login',
           createdAt: new Date().toISOString()
         }
       });
    }

    return NextResponse.json({
      authenticated: true,
      id: agent.id,
      role: agent.role, // SUPER_ADMIN, PLATFORM_AGENT, AGENT
      name: agent.name,
      email: agent.email,
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

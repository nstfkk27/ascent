import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get agent profile and role
    let userRole = 'AGENT';
    let agentId: string | null = null;
    
    if (user.email) {
      const agent = await prisma.agentProfile.findFirst({
        where: { email: user.email }
      });
      if (agent) {
        userRole = agent.role;
        agentId = agent.id;
      }
    }

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // Build where clause based on role
    const propertyWhere: any = { status: 'AVAILABLE' };
    
    // AGENT and PLATFORM_AGENT only see their own listings
    if ((userRole === 'AGENT' || userRole === 'PLATFORM_AGENT') && agentId) {
      propertyWhere.agentId = agentId;
    }
    // SUPER_ADMIN sees all listings (no filter)

    const [
      activeListings,
      pendingSubmissions,
      freshListings,
      needsCheckListings
    ] = await prisma.$transaction([
      prisma.property.count({ where: propertyWhere }),
      prisma.propertySubmission.count({ where: { status: 'PENDING' } }),
      // Fresh: verified >= 14 days ago (meaning more recent than 14 days ago)
      prisma.property.count({ 
        where: { 
          ...propertyWhere,
          lastVerifiedAt: { gte: fourteenDaysAgo }
        } 
      }),
      // Needs Check: verified < 14 days ago
      prisma.property.count({ 
        where: { 
          ...propertyWhere,
          lastVerifiedAt: { lt: fourteenDaysAgo }
        } 
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activeListings,
        pendingSubmissions,
        freshListings,
        needsCheckListings
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}

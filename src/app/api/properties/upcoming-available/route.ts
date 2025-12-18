import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agent profile to check role
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { email: user.email! },
      select: { role: true }
    });

    // Only platform agents can see this data
    if (!agentProfile || (agentProfile.role !== 'SUPER_ADMIN' && agentProfile.role !== 'PLATFORM_AGENT')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get properties that are rented but becoming available in next 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const upcomingProperties = await prisma.property.findMany({
      where: {
        status: 'RENTED',
        availableFrom: {
          lte: ninetyDaysFromNow,
          gte: new Date() // Only future dates
        }
      },
      select: {
        id: true,
        title: true,
        area: true,
        rentedUntil: true,
        availableFrom: true,
      },
      orderBy: {
        availableFrom: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      properties: upcomingProperties
    });
  } catch (error) {
    console.error('Error fetching upcoming properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming properties' },
      { status: 500 }
    );
  }
}

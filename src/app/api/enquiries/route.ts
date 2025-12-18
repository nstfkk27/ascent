import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// GET - Fetch enquiries (for agent dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};
    
    // Super admin sees all, others see only their enquiries
    if (agent.role !== 'SUPER_ADMIN') {
      where.agentId = agent.id;
    }
    
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { agent: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: enquiries 
    });
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

// POST - Create new enquiry (from property page contact buttons)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, channel, name, phone, email, message, agentId } = body;

    if (!propertyId || !channel) {
      return NextResponse.json({ error: 'propertyId and channel are required' }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId,
        channel,
        name,
        phone,
        email,
        message,
        agentId,
      },
    });

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Failed to create enquiry:', error);
    return NextResponse.json({ error: 'Failed to create enquiry' }, { status: 500 });
  }
}

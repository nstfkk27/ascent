import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MAX_COMPARISON_ITEMS = 4; // Limit comparison to 4 properties

// GET - Fetch user's comparison list
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const userId = user?.id || request.cookies.get('guest_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ comparison: [] });
    }

    const comparisonItems = await prisma.comparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: MAX_COMPARISON_ITEMS
    });

    // Fetch full property details with project info
    const propertyIds = comparisonItems.map(item => item.propertyId);
    const properties = await prisma.property.findMany({
      where: { 
        id: { in: propertyIds }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            type: true,
            developer: true,
            completionYear: true,
            totalUnits: true,
            totalFloors: true,
            totalBuildings: true,
            description: true,
            facilities: true,
            imageUrl: true
          }
        }
      }
    });

    // Serialize Decimal fields
    const serializedProperties = properties.map(prop => ({
      ...prop,
      price: prop.price?.toString(),
      rentPrice: prop.rentPrice?.toString(),
      latitude: prop.latitude?.toString(),
      longitude: prop.longitude?.toString(),
      commissionRate: prop.commissionRate?.toString(),
      agentCommissionRate: prop.agentCommissionRate?.toString(),
      commissionAmount: prop.commissionAmount?.toString(),
      coAgentCommissionRate: prop.coAgentCommissionRate?.toString(),
      monthlyRevenue: prop.monthlyRevenue?.toString(),
    }));

    return NextResponse.json({ comparison: serializedProperties });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 });
  }
}

// POST - Add to comparison
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    // Get or create guest ID
    let userId = user?.id;
    if (!userId) {
      userId = request.cookies.get('guest_id')?.value;
      if (!userId) {
        userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    }

    // Check current count
    const currentCount = await prisma.comparison.count({
      where: { userId }
    });

    if (currentCount >= MAX_COMPARISON_ITEMS) {
      return NextResponse.json({ 
        error: `Maximum ${MAX_COMPARISON_ITEMS} properties can be compared at once` 
      }, { status: 400 });
    }

    // Add to comparison
    await prisma.comparison.upsert({
      where: {
        userId_propertyId: {
          userId,
          propertyId
        }
      },
      create: {
        userId,
        propertyId
      },
      update: {}
    });

    const response = NextResponse.json({ success: true, message: 'Added to comparison' });
    
    // Set guest cookie if not authenticated
    if (!user) {
      response.cookies.set('guest_id', userId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Error adding to comparison:', error);
    return NextResponse.json({ error: 'Failed to add to comparison' }, { status: 500 });
  }
}

// DELETE - Remove from comparison
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
    }

    const userId = user?.id || request.cookies.get('guest_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    await prisma.comparison.deleteMany({
      where: {
        userId,
        propertyId
      }
    });

    return NextResponse.json({ success: true, message: 'Removed from comparison' });
  } catch (error) {
    console.error('Error removing from comparison:', error);
    return NextResponse.json({ error: 'Failed to remove from comparison' }, { status: 500 });
  }
}

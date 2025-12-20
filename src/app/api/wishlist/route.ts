import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Support both authenticated and guest users
    const userId = user?.id || request.cookies.get('guest_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch full property details
    const propertyIds = wishlistItems.map(item => item.propertyId);
    const properties = await prisma.property.findMany({
      where: { 
        id: { in: propertyIds },
        status: 'AVAILABLE'
      },
      include: {
        project: {
          select: {
            name: true,
            type: true,
            developer: true,
            facilities: true
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

    return NextResponse.json({ wishlist: serializedProperties });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add to wishlist
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

    // Add to wishlist (upsert to handle duplicates)
    await prisma.wishlist.upsert({
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

    const response = NextResponse.json({ success: true, message: 'Added to wishlist' });
    
    // Set guest cookie if not authenticated
    if (!user) {
      response.cookies.set('guest_id', userId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
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

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        propertyId
      }
    });

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}

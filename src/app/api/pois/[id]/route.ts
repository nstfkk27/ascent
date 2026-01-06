import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { recalculateDistancesForPOI } from '@/lib/poi-distance';

// GET - Get single POI
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const poi = await prisma.pointOfInterest.findUnique({
      where: { id }
    });

    if (!poi) {
      return NextResponse.json({ error: 'POI not found' }, { status: 404 });
    }

    return NextResponse.json(poi);
  } catch (error) {
    console.error('Error fetching POI:', error);
    return NextResponse.json({ error: 'Failed to fetch POI' }, { status: 500 });
  }
}

// PUT - Update POI (SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent || agent.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only SUPER_ADMIN can manage POIs' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameTh, type, tier, latitude, longitude, city, area, metadata, isActive } = body;

    const poi = await prisma.pointOfInterest.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nameTh !== undefined && { nameTh }),
        ...(type && { type }),
        ...(tier && { tier }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(city && { city }),
        ...(area !== undefined && { area }),
        ...(metadata !== undefined && { metadata }),
        ...(isActive !== undefined && { isActive })
      }
    });

    // Recalculate distances if coordinates changed (async, don't wait)
    if (latitude || longitude) {
      recalculateDistancesForPOI(poi.id).catch(err => {
        console.error('Failed to recalculate distances for POI:', err);
      });
    }

    return NextResponse.json(poi);
  } catch (error) {
    console.error('Error updating POI:', error);
    return NextResponse.json({ error: 'Failed to update POI' }, { status: 500 });
  }
}

// DELETE - Delete POI (SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent || agent.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only SUPER_ADMIN can manage POIs' }, { status: 403 });
    }

    // Soft delete - just mark as inactive
    await prisma.pointOfInterest.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting POI:', error);
    return NextResponse.json({ error: 'Failed to delete POI' }, { status: 500 });
  }
}

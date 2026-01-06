import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { recalculateDistancesForPOI } from '@/lib/poi-distance';

// GET - List all POIs with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const tier = searchParams.get('tier');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (type) where.type = type;
    if (city) where.city = city;
    if (tier) where.tier = tier;
    if (isActive !== null) where.isActive = isActive === 'true';

    const pois = await prisma.pointOfInterest.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(pois);
  } catch (error) {
    console.error('Error fetching POIs:', error);
    return NextResponse.json({ error: 'Failed to fetch POIs' }, { status: 500 });
  }
}

// POST - Create a new POI (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
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
    const { name, nameTh, type, tier, latitude, longitude, city, area, metadata } = body;

    // Validation
    if (!name || !type || !latitude || !longitude || !city) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, type, latitude, longitude, city' 
      }, { status: 400 });
    }

    const poi = await prisma.pointOfInterest.create({
      data: {
        name,
        nameTh,
        type,
        tier: tier || 'PRIMARY',
        latitude,
        longitude,
        city,
        area,
        metadata,
        isActive: true
      }
    });

    // Calculate distances for all properties to this new POI (async, don't wait)
    recalculateDistancesForPOI(poi.id).catch(err => {
      console.error('Failed to calculate distances for new POI:', err);
    });

    return NextResponse.json(poi, { status: 201 });
  } catch (error) {
    console.error('Error creating POI:', error);
    return NextResponse.json({ error: 'Failed to create POI' }, { status: 500 });
  }
}

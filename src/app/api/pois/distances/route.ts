import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { 
  updatePropertyPOIDistances, 
  recalculateAllPropertyDistances,
  getNearbyPOIs 
} from '@/lib/poi-distance';

// GET - Get nearby POIs for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const maxDistance = searchParams.get('maxDistance');
    const types = searchParams.get('types');
    const tier = searchParams.get('tier');
    const limit = searchParams.get('limit');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const nearbyPOIs = await getNearbyPOIs(propertyId, {
      maxDistanceKm: maxDistance ? parseFloat(maxDistance) : undefined,
      types: types ? types.split(',') : undefined,
      tier: tier as 'PRIMARY' | 'SECONDARY' | undefined,
      limit: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json(nearbyPOIs);
  } catch (error) {
    console.error('Error fetching nearby POIs:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby POIs' }, { status: 500 });
  }
}

// POST - Calculate/recalculate distances
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - only SUPER_ADMIN and PLATFORM_AGENT can trigger calculations
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent || !['SUPER_ADMIN', 'PLATFORM_AGENT'].includes(agent.role)) {
      return NextResponse.json({ 
        error: 'Only SUPER_ADMIN and PLATFORM_AGENT can trigger distance calculations' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { action, propertyId } = body;

    // Action: calculate for single property
    if (action === 'calculate' && propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { id: true, latitude: true, longitude: true, referenceId: true }
      });

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      if (!property.latitude || !property.longitude) {
        return NextResponse.json({ 
          error: 'Property does not have coordinates' 
        }, { status: 400 });
      }

      const result = await updatePropertyPOIDistances(
        property.id,
        Number(property.latitude),
        Number(property.longitude)
      );

      return NextResponse.json({
        success: true,
        propertyId: property.id,
        referenceId: property.referenceId,
        ...result
      });
    }

    // Action: recalculate all properties
    if (action === 'recalculate-all') {
      // Only SUPER_ADMIN can trigger bulk recalculation
      if (agent.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ 
          error: 'Only SUPER_ADMIN can trigger bulk recalculation' 
        }, { status: 403 });
      }

      const result = await recalculateAllPropertyDistances({
        batchSize: 50
      });

      return NextResponse.json({
        success: true,
        action: 'recalculate-all',
        ...result
      });
    }

    return NextResponse.json({ 
      error: 'Invalid action. Use "calculate" with propertyId or "recalculate-all"' 
    }, { status: 400 });

  } catch (error) {
    console.error('Error calculating distances:', error);
    return NextResponse.json({ error: 'Failed to calculate distances' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { 
  updatePropertyScores, 
  updatePropertyIntelligence, 
  updateAllPropertyIntelligence,
  recalculateAllPropertyScores 
} from '@/lib/property-scoring';

/**
 * GET /api/properties/scores?propertyId=xxx
 * Get scores for a specific property
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    return NextResponse.json(
      { success: false, error: 'propertyId is required' },
      { status: 400 }
    );
  }

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        locationScore: true,
        valueScore: true,
        investmentScore: true,
        overallScore: true,
        dealQuality: true,
        keyFeatures: true,
        targetBuyer: true,
        priceDeviation: true,
        estimatedRentalYield: true,
        fairValueEstimate: true,
        priceVsAreaAvg: true,
        priceVsProjectAvg: true,
        lastIntelligenceUpdate: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        priceDeviation: property.priceDeviation ? Number(property.priceDeviation) : null,
        estimatedRentalYield: property.estimatedRentalYield ? Number(property.estimatedRentalYield) : null,
        fairValueEstimate: property.fairValueEstimate ? Number(property.fairValueEstimate) : null,
        priceVsAreaAvg: property.priceVsAreaAvg ? Number(property.priceVsAreaAvg) : null,
        priceVsProjectAvg: property.priceVsProjectAvg ? Number(property.priceVsProjectAvg) : null,
        lastIntelligenceUpdate: property.lastIntelligenceUpdate?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error fetching property scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property scores' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties/scores
 * Recalculate scores for a property or all properties
 * 
 * Body:
 * - propertyId: string (optional) - Calculate for specific property
 * - recalculateAll: boolean (optional) - Recalculate all properties
 * - fullIntelligence: boolean (optional) - Include market comparison update
 */
export async function POST(request: NextRequest) {
  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user is admin
  const agent = await prisma.agentProfile.findFirst({
    where: { email: user.email! },
    select: { role: true },
  });

  if (!agent || !['SUPER_ADMIN', 'PLATFORM_AGENT'].includes(agent.role)) {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { propertyId, recalculateAll, fullIntelligence } = body;

    // Recalculate all properties
    if (recalculateAll) {
      const result = fullIntelligence 
        ? await updateAllPropertyIntelligence()
        : await recalculateAllPropertyScores();
      
      return NextResponse.json({
        success: true,
        message: `Updated ${result.updated} properties, ${result.errors} errors`,
        data: result,
      });
    }

    // Recalculate single property
    if (propertyId) {
      const scores = fullIntelligence
        ? await updatePropertyIntelligence(propertyId)
        : await updatePropertyScores(propertyId);

      if (!scores) {
        return NextResponse.json(
          { success: false, error: 'Property not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: scores,
      });
    }

    return NextResponse.json(
      { success: false, error: 'propertyId or recalculateAll is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error calculating property scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate property scores' },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { 
  withErrorHandler, 
  successResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { serializeDecimal } from '@/lib/utils/serialization';

export const dynamic = 'force-dynamic';

const MAX_COMPARISON_ITEMS = 4;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const userId = user?.id || req.cookies.get('guest_id')?.value;
  
  if (!userId) {
    return successResponse({ comparison: [] });
  }

  logger.debug('Fetching comparison', { userId: user?.id || 'guest' });

  const comparisonItems = await prisma.comparison.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: MAX_COMPARISON_ITEMS
  });

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

  const serializedProperties = properties.map(prop => ({
    ...prop,
    price: prop.price ? serializeDecimal(prop.price) : null,
    rentPrice: prop.rentPrice ? serializeDecimal(prop.rentPrice) : null,
    latitude: prop.latitude ? serializeDecimal(prop.latitude) : null,
    longitude: prop.longitude ? serializeDecimal(prop.longitude) : null,
    commissionRate: prop.commissionRate ? serializeDecimal(prop.commissionRate) : null,
    agentCommissionRate: prop.agentCommissionRate ? serializeDecimal(prop.agentCommissionRate) : null,
    commissionAmount: prop.commissionAmount ? serializeDecimal(prop.commissionAmount) : null,
    coAgentCommissionRate: prop.coAgentCommissionRate ? serializeDecimal(prop.coAgentCommissionRate) : null,
    monthlyRevenue: prop.monthlyRevenue ? serializeDecimal(prop.monthlyRevenue) : null,
  }));

  logger.info('Comparison fetched', { userId: user?.id || 'guest', count: properties.length });

  return successResponse({ comparison: serializedProperties });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { propertyId } = await req.json();

  if (!propertyId) {
    throw new ValidationError('Property ID required');
  }

  let userId = user?.id;
  if (!userId) {
    userId = req.cookies.get('guest_id')?.value;
    if (!userId) {
      userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  logger.debug('Adding to comparison', { userId: user?.id || 'guest', propertyId });

  const currentCount = await prisma.comparison.count({
    where: { userId }
  });

  if (currentCount >= MAX_COMPARISON_ITEMS) {
    throw new ValidationError(`Maximum ${MAX_COMPARISON_ITEMS} properties can be compared at once`);
  }

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

  logger.info('Added to comparison', { userId: user?.id || 'guest', propertyId });

  const response = NextResponse.json(
    successResponse({ message: 'Added to comparison' }),
    { status: 200 }
  );
  
  if (!user) {
    response.cookies.set('guest_id', userId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  return response;
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');

  if (!propertyId) {
    throw new ValidationError('Property ID required');
  }

  const userId = user?.id || req.cookies.get('guest_id')?.value;
  
  if (!userId) {
    throw new ValidationError('User not found');
  }

  logger.debug('Removing from comparison', { userId: user?.id || 'guest', propertyId });

  await prisma.comparison.deleteMany({
    where: {
      userId,
      propertyId
    }
  });

  logger.info('Removed from comparison', { userId: user?.id || 'guest', propertyId });

  return successResponse({ message: 'Removed from comparison' });
});

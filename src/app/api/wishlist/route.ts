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

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const userId = user?.id || req.cookies.get('guest_id')?.value;
  
  if (!userId) {
    return successResponse({ wishlist: [] });
  }

  logger.debug('Fetching wishlist', { userId: user?.id || 'guest' });

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

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

  logger.info('Wishlist fetched', { userId: user?.id || 'guest', count: properties.length });

  return successResponse({ wishlist: serializedProperties });
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

  logger.debug('Adding to wishlist', { userId: user?.id || 'guest', propertyId });

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

  logger.info('Added to wishlist', { userId: user?.id || 'guest', propertyId });

  const response = NextResponse.json(
    successResponse({ message: 'Added to wishlist' }),
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

  logger.debug('Removing from wishlist', { userId: user?.id || 'guest', propertyId });

  await prisma.wishlist.deleteMany({
    where: {
      userId,
      propertyId
    }
  });

  logger.info('Removed from wishlist', { userId: user?.id || 'guest', propertyId });

  return successResponse({ message: 'Removed from wishlist' });
});

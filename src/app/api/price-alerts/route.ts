import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { hasFeatureAccess } from '@/lib/premiumFeatures';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError,
  NotFoundError,
  ForbiddenError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { serializeDecimal } from '@/lib/utils/serialization';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const priceAlertSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  alertType: z.enum(['PRICE_DROP', 'PRICE_INCREASE', 'ANY_CHANGE']),
  targetPrice: z.number().positive().optional(),
  percentageChange: z.number().min(1).max(100).optional(),
});

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent, user }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    if (!hasFeatureAccess(agent.role, 'PRICE_ALERTS')) {
      throw new ForbiddenError('Price alerts are available for SUPER_ADMIN and PLATFORM_AGENT accounts only');
    }

    logger.debug('Fetching price alerts', { userId: user.id, agentId: agent.id });

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    const propertyIds = alerts.map(alert => alert.propertyId);
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: {
        id: true,
        title: true,
        price: true,
        rentPrice: true,
        images: true,
        city: true,
        listingType: true
      }
    });

    const alertsWithProperties = alerts.map(alert => {
      const property = properties.find(p => p.id === alert.propertyId);
      return {
        ...alert,
        targetPrice: alert.targetPrice ? serializeDecimal(alert.targetPrice) : null,
        lastCheckedPrice: alert.lastCheckedPrice ? serializeDecimal(alert.lastCheckedPrice) : null,
        property: property ? {
          ...property,
          price: property.price ? serializeDecimal(property.price) : null,
          rentPrice: property.rentPrice ? serializeDecimal(property.rentPrice) : null
        } : null
      };
    });

    logger.info('Price alerts fetched', { userId: user.id, count: alerts.length });

    return successResponse({ alerts: alertsWithProperties });
  })
);

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent, user }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    if (!hasFeatureAccess(agent.role, 'PRICE_ALERTS')) {
      throw new ForbiddenError('Price alerts are available for SUPER_ADMIN and PLATFORM_AGENT accounts only');
    }

    const body = await req.json();
    const validated = priceAlertSchema.parse(body);

    logger.debug('Creating price alert', { userId: user.id, propertyId: validated.propertyId });

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      select: { price: true, rentPrice: true }
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const currentPrice = property.price || property.rentPrice;

    const alert = await prisma.priceAlert.upsert({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId: validated.propertyId
        }
      },
      create: {
        userId: user.id,
        propertyId: validated.propertyId,
        alertType: validated.alertType,
        targetPrice: validated.targetPrice,
        percentageChange: validated.percentageChange,
        lastCheckedPrice: currentPrice,
        isActive: true
      },
      update: {
        alertType: validated.alertType,
        targetPrice: validated.targetPrice,
        percentageChange: validated.percentageChange,
        lastCheckedPrice: currentPrice,
        isActive: true
      }
    });

    logger.info('Price alert created', { userId: user.id, alertId: alert.id });

    return successResponse({ 
      message: 'Price alert created',
      alert: {
        ...alert,
        targetPrice: alert.targetPrice ? serializeDecimal(alert.targetPrice) : null,
        lastCheckedPrice: alert.lastCheckedPrice ? serializeDecimal(alert.lastCheckedPrice) : null
      }
    });
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, context, { user }) => {
    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      throw new ValidationError('Alert ID required');
    }

    logger.debug('Deleting price alert', { userId: user.id, alertId });

    await prisma.priceAlert.delete({
      where: {
        id: alertId,
        userId: user.id
      }
    });

    logger.info('Price alert deleted', { userId: user.id, alertId });

    return successResponse({ message: 'Price alert deleted' });
  })
);

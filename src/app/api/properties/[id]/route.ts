import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  withAuth, 
  withRateLimit,
  successResponse,
  NotFoundError,
  ForbiddenError,
  isInternalAgent,
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { sanitizePropertyData } from '@/lib/property-utils';
import { generateUniqueSlug } from '@/utils/propertyHelpers';
import { updatePropertyPOIDistances } from '@/lib/poi-distance';
import { updatePropertyIntelligence } from '@/lib/property-scoring';

export const GET = withErrorHandler(
  async (req: NextRequest, { params }) => {
    let property = await prisma.property.findUnique({
      where: { id: params.id },
    });
    
    // If not found and looks like a UUID fragment (8-12 alphanumeric chars), try startsWith search
    if (!property && params.id.length >= 8 && params.id.length <= 12 && /^[a-z0-9]+$/i.test(params.id)) {
      const properties = await prisma.property.findMany({
        where: {
          id: { startsWith: params.id },
        },
        take: 1,
      });
      property = properties[0] || null;
    }
    
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Check if user is authenticated (optional)
    const supabase = (await import('@/utils/supabase/server')).createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let agent = null;
    if (user?.email) {
      agent = await prisma.agentProfile.findFirst({
        where: {
          email: {
            equals: user.email,
            mode: 'insensitive',
          },
        },
      });
    }

    const isInternal = agent ? isInternalAgent(agent.role) : false;
    const isAgent = agent?.role === 'AGENT';

    // Hide sensitive commission data from non-authenticated or non-authorized users
    if (!isInternal) {
      (property as any).commissionRate = null;
      (property as any).commissionAmount = null;
      
      if (!isAgent) {
        (property as any).agentCommissionRate = null;
      }
    }

    logger.debug('Property fetched', {
      propertyId: property.id,
      agentId: agent?.id,
      role: agent?.role,
      authenticated: !!user,
    });
    
    return successResponse(property);
  }
);

export const PUT = withErrorHandler(
  withAuth(async (req: NextRequest, { params }, { agent }) => {
    await withRateLimit(req);

    const body = await req.json();

    if (body?.unitFeatures && !body?.amenities) {
      body.amenities = body.unitFeatures;
    }

    const currentProperty = await prisma.property.findUnique({
      where: { id: params.id },
      select: { price: true, rentPrice: true, agentId: true }
    });

    if (!currentProperty) {
      throw new NotFoundError('Property not found');
    }

    if (!agent) {
      throw new ForbiddenError('Agent not found');
    }

    const isInternal = isInternalAgent(agent.role);

    if ((agent.role === 'AGENT' || agent.role === 'PLATFORM_AGENT') && currentProperty.agentId !== agent.id) {
      throw new ForbiddenError('You can only edit your own listings');
    }

    let updateData = { ...body };

    if (!isInternal) {
      delete updateData.commissionAmount;
    }

    delete updateData.subtype;
    delete updateData.selectedAmenities;
    delete (updateData as any).condition;
    delete (updateData as any).unitFeatures;

    if (body.title) {
      updateData.slug = await generateUniqueSlug(body.title, params.id);
    }

    if (body.category) {
      updateData = sanitizePropertyData(updateData);
    }

    logger.info('Updating property', {
      propertyId: params.id,
      agentId: agent.id,
      changes: Object.keys(updateData),
    });

    const property = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
    });

    if (currentProperty) {
      const oldPrice = currentProperty.price ? Number(currentProperty.price) : null;
      const newPrice = body.price ? Number(body.price) : null;
      const oldRent = currentProperty.rentPrice ? Number(currentProperty.rentPrice) : null;
      const newRent = body.rentPrice ? Number(body.rentPrice) : null;

      const priceChanged = oldPrice !== newPrice;
      const rentChanged = oldRent !== newRent;

      if (priceChanged || rentChanged) {
        let changeType = 'CORRECTION';
        if (newPrice !== null && oldPrice !== null) {
          changeType = newPrice > oldPrice ? 'INCREASE' : 'DECREASE';
        } else if (newRent !== null && oldRent !== null) {
          changeType = newRent > oldRent ? 'INCREASE' : 'DECREASE';
        }

        try {
          await prisma.priceHistory.create({
            data: {
              propertyId: params.id,
              price: newPrice,
              rentPrice: newRent,
              changeType: changeType as any,
              changedBy: agent.id,
            },
          });

          logger.info('Price history recorded', {
            propertyId: params.id,
            changeType,
            oldPrice,
            newPrice,
          });
        } catch (e) {
          logger.warn('Price history tracking failed', { error: e });
        }
      }
    }

    logger.info('Property updated', {
      propertyId: params.id,
      agentId: agent.id,
    });

    // Recalculate POI distances if coordinates were updated
    if (body.latitude !== undefined || body.longitude !== undefined) {
      if (property.latitude && property.longitude) {
        try {
          await updatePropertyPOIDistances(
            property.id,
            Number(property.latitude),
            Number(property.longitude)
          );
          logger.info('POI distances recalculated', { propertyId: property.id });
        } catch (error) {
          logger.warn('Failed to recalculate POI distances', { propertyId: property.id, error });
        }
      }
    }

    // Recalculate scores if price, size, rent, or location changed
    const scoreRelevantFields = ['price', 'rentPrice', 'size', 'latitude', 'longitude', 'area', 'projectId'];
    const shouldRecalculateScores = scoreRelevantFields.some(field => body[field] !== undefined);
    
    if (shouldRecalculateScores) {
      try {
        await updatePropertyIntelligence(property.id);
        logger.info('Property scores recalculated', { propertyId: property.id });
      } catch (error) {
        logger.warn('Failed to recalculate property scores', { propertyId: property.id, error });
      }
    }
    
    return successResponse(property);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, { params }, { agent }) => {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (!agent) {
      throw new ForbiddenError('Agent not found');
    }

    const isSuperAdmin = agent.role === 'SUPER_ADMIN';
    const isOwner = property.agentId === agent.id;

    if (!isSuperAdmin && !isOwner) {
      throw new ForbiddenError('You can only delete your own listings');
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    logger.info('Property deleted', {
      propertyId: params.id,
      agentId: agent.id,
      role: agent.role,
    });
    
    return successResponse({ message: 'Property deleted successfully' });
  })
);

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
import { propertyUpdateSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { sanitizePropertyData } from '@/lib/property-utils';
import { generateUniqueSlug } from '@/utils/propertyHelpers';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, { params }, { agent }) => {
    let property = await prisma.property.findUnique({
      where: { id: params.id },
    });
    
    if (!property && params.id.length === 8 && /^[a-z0-9]+$/i.test(params.id)) {
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

    const isInternal = agent ? isInternalAgent(agent.role) : false;
    const isAgent = agent?.role === 'AGENT';

    if (!isInternal) {
      (property as any).commissionRate = null;
      (property as any).commissionAmount = null;
      
      if (!isAgent) {
        (property as any).coAgentCommissionRate = null;
        (property as any).agentCommissionRate = null;
      }
    }

    logger.debug('Property fetched', {
      propertyId: property.id,
      agentId: agent?.id,
      role: agent?.role,
    });
    
    return successResponse(property);
  }, { requireAgent: false })
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
      select: { price: true, rentPrice: true, agentId: true, category: true, houseType: true, investmentType: true }
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
      delete updateData.commissionRate;
      delete updateData.commissionAmount;
    }

    delete updateData.subtype;
    delete updateData.selectedAmenities;
    delete (updateData as any).condition;
    delete (updateData as any).unitFeatures;

    if (body.title) {
      // Generate slug with property type for better SEO
      let slugTitle = body.title;
      const category = body.category || currentProperty.category;
      const houseType = body.houseType || currentProperty.houseType;
      const investmentType = body.investmentType || currentProperty.investmentType;
      
      if (category === 'HOUSE' && houseType) {
        const houseTypeLabel = houseType.toLowerCase().replace('_', '-');
        slugTitle = `${houseTypeLabel}-${body.title}`;
      } else if (category === 'INVESTMENT' && investmentType) {
        const investmentTypeLabel = investmentType.toLowerCase().replace('_', '-');
        slugTitle = `${investmentTypeLabel}-${body.title}`;
      } else if (category === 'CONDO') {
        slugTitle = `condo-${body.title}`;
      } else if (category === 'LAND') {
        slugTitle = `land-${body.title}`;
      }
      
      updateData.slug = await generateUniqueSlug(slugTitle, params.id);
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

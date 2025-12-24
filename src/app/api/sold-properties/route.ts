import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError,
  NotFoundError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { serializeDecimal } from '@/lib/utils/serialization';
import { z } from 'zod';

const soldPropertySchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  soldType: z.enum(['SOLD', 'RENTED', 'WITHDRAWN']),
  finalPrice: z.number().positive().optional(),
  notes: z.string().optional(),
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const area = searchParams.get('area');
  const category = searchParams.get('category');
  const projectId = searchParams.get('projectId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  logger.debug('Fetching sold properties', { city, area, category, limit });

  const where: any = {};
  if (city) where.city = city;
  if (area) where.area = area;
  if (category) where.category = category;
  if (projectId) where.projectId = projectId;

  const soldProperties = await prisma.soldProperty.findMany({
    where,
    orderBy: { soldAt: 'desc' },
    take: limit,
  });

  const serialized = soldProperties.map(p => ({
    ...p,
    listingPrice: p.listingPrice ? serializeDecimal(p.listingPrice) : null,
    listingRentPrice: p.listingRentPrice ? serializeDecimal(p.listingRentPrice) : null,
    finalPrice: p.finalPrice ? serializeDecimal(p.finalPrice) : null,
    commissionEarned: p.commissionEarned ? serializeDecimal(p.commissionEarned) : null,
    latitude: p.latitude ? serializeDecimal(p.latitude) : null,
    longitude: p.longitude ? serializeDecimal(p.longitude) : null,
  }));

  logger.info('Sold properties fetched', { count: soldProperties.length });

  return successResponse({ soldProperties: serialized });
});

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = soldPropertySchema.parse(body);

    logger.debug('Archiving property as sold', { 
      propertyId: validated.propertyId, 
      agentId: agent.id 
    });

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const daysOnMarket = Math.floor(
      (new Date().getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const soldProperty = await prisma.soldProperty.create({
      data: {
        originalId: property.id,
        title: property.title,
        description: property.description,
        category: property.category,
        houseType: property.houseType,
        investmentType: property.investmentType,
        address: property.address,
        city: property.city,
        area: property.area,
        projectName: property.projectName,
        projectId: property.projectId,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        floor: property.floor,
        latitude: property.latitude,
        longitude: property.longitude,
        images: property.images,
        listingPrice: property.price,
        listingRentPrice: property.rentPrice,
        listingType: property.listingType,
        soldType: validated.soldType,
        finalPrice: validated.finalPrice,
        daysOnMarket,
        agentId: property.agentId || agent.id,
        commissionEarned: property.commissionAmount,
        listedAt: property.createdAt,
        notes: validated.notes,
      },
    });

    logger.info('Property archived as sold', { 
      soldPropertyId: soldProperty.id,
      originalPropertyId: property.id 
    });

    return successResponse({ 
      soldProperty: {
        ...soldProperty,
        listingPrice: soldProperty.listingPrice ? serializeDecimal(soldProperty.listingPrice) : null,
        finalPrice: soldProperty.finalPrice ? serializeDecimal(soldProperty.finalPrice) : null,
        commissionEarned: soldProperty.commissionEarned ? serializeDecimal(soldProperty.commissionEarned) : null,
      }
    }, undefined, 201);
  })
);

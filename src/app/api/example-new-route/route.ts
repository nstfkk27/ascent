import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  withAuth, 
  withRateLimit,
  successResponse,
  paginatedResponse,
  NotFoundError,
  ValidationError,
  requireRole,
} from '@/lib/api';
import { propertyQuerySchema, validatePagination } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    await withRateLimit(req);

    const searchParams = req.nextUrl.searchParams;
    const { page, limit } = validatePagination(searchParams);

    logger.info('Fetching properties', {
      agentId: agent?.id,
      page,
      limit,
    });

    const where: any = { status: 'AVAILABLE' };

    if (agent?.role === 'AGENT' || agent?.role === 'PLATFORM_AGENT') {
      where.agentId = agent.id;
    }

    const [total, properties] = await prisma.$transaction([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return paginatedResponse(properties, page, limit, total);
  }, { roles: ['SUPER_ADMIN', 'PLATFORM_AGENT', 'AGENT'] })
);

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    await withRateLimit(req);

    const body = await req.json();
    
    logger.info('Creating property', { agentId: agent?.id });

    const property = await prisma.property.create({
      data: {
        ...body,
        agentId: agent?.id,
      },
    });

    logger.info('Property created', { 
      propertyId: property.id,
      agentId: agent?.id,
    });

    return successResponse(property, undefined, 201);
  }, requireRole('SUPER_ADMIN', 'PLATFORM_AGENT'))
);

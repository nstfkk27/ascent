import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth,
  successResponse,
  paginatedResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const dealCreateSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
  stage: z.enum(['NEW_LEAD', 'VIEWING', 'OFFER', 'CONTRACT', 'CLOSED']).optional(),
  amount: z.number().positive().optional(),
  propertyId: z.string().uuid(),
  dealType: z.enum(['SALE', 'RENT']).optional(),
});


export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;
    const stage = searchParams.get('stage');
    const dealType = searchParams.get('dealType');

    const where: any = {};
    if (stage) where.stage = stage;
    if (dealType) where.dealType = dealType;

    logger.debug('Fetching deals', { agentId: agent?.id, filters: where, page, limit });

    const [total, deals] = await prisma.$transaction([
      prisma.deal.count({ where }),
      prisma.deal.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              address: true,
              slug: true,
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    const serializedDeals = deals.map(deal => ({
      ...deal,
      amount: deal.amount ? deal.amount.toNumber() : null,
      monthlyRent: (deal as any).monthlyRent ? (deal as any).monthlyRent.toNumber() : null,
      depositAmount: (deal as any).depositAmount ? (deal as any).depositAmount.toNumber() : null,
      property: deal.property ? {
        ...deal.property,
        price: deal.property.price ? deal.property.price.toNumber() : null
      } : null
    }));

    logger.info('Deals fetched', { count: deals.length, total, page });
    
    return paginatedResponse(serializedDeals, page, limit, total);
  })
);

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    const body = await req.json();
    const validated = dealCreateSchema.parse(body);

    logger.debug('Creating deal', { agentId: agent?.id, propertyId: validated.propertyId });

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      select: { id: true, title: true }
    });

    if (!property) {
      throw new ValidationError('Property not found');
    }

    const deal = await prisma.deal.create({
      data: {
        clientName: validated.clientName,
        clientPhone: validated.clientPhone,
        notes: validated.notes,
        stage: validated.stage || 'NEW_LEAD',
        amount: validated.amount,
        propertyId: validated.propertyId,
        dealType: validated.dealType,
      }
    });

    const serializedDeal = {
      ...deal,
      amount: deal.amount ? deal.amount.toNumber() : null,
    };

    logger.info('Deal created', { dealId: deal.id, propertyId: property.id, agentId: agent?.id });
    
    return successResponse({ deal: serializedDeal }, undefined, 201);
  })
);

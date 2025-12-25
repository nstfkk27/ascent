import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError,
  NotFoundError,
  isInternalAgent
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { dealUpdateSchema } from '@/lib/validation/schemas';
import { serializeDecimal } from '@/lib/utils/serialization';


export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Fetching deal by ID', { dealId: params.id, requestedBy: agent.id });

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        property: true,
      },
    });

    if (!deal) {
      throw new NotFoundError('Deal not found');
    }

    if (!isInternalAgent(agent.role) && deal.property.agentId !== agent.id) {
      throw new ValidationError('You do not have permission to view this deal');
    }

    logger.info('Deal fetched', { dealId: params.id, requestedBy: agent.id });

    const serializedDeal = {
      ...deal,
      amount: deal.amount ? serializeDecimal(deal.amount) : null,
      monthlyRent: deal.monthlyRent ? serializeDecimal(deal.monthlyRent) : null,
      depositAmount: deal.depositAmount ? serializeDecimal(deal.depositAmount) : null,
      property: {
        ...deal.property,
        price: deal.property.price ? serializeDecimal(deal.property.price) : null,
        rentPrice: deal.property.rentPrice ? serializeDecimal(deal.property.rentPrice) : null,
        agentCommissionRate: deal.property.agentCommissionRate ? serializeDecimal(deal.property.agentCommissionRate) : null,
        commissionAmount: deal.property.commissionAmount ? serializeDecimal(deal.property.commissionAmount) : null,
      },
    };

    return successResponse({ deal: serializedDeal });
  })
);

export const PATCH = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = dealUpdateSchema.parse(body);

    logger.debug('Updating deal', { 
      dealId: params.id, 
      updatedBy: agent.id,
      updates: Object.keys(validated)
    });

    const existingDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    });

    if (!existingDeal) {
      throw new NotFoundError('Deal not found');
    }

    const property = await prisma.property.findUnique({
      where: { id: existingDeal.propertyId },
      select: { agentId: true },
    });

    if (!property) {
      throw new NotFoundError('Associated property not found');
    }

    if (!isInternalAgent(agent.role) && property.agentId !== agent.id) {
      throw new ValidationError('You do not have permission to update this deal');
    }

    const updateData: any = { ...validated };
    if (validated.leaseStartDate) {
      updateData.leaseStartDate = new Date(validated.leaseStartDate);
    }
    if (validated.leaseEndDate) {
      updateData.leaseEndDate = new Date(validated.leaseEndDate);
    }
    if (validated.nextPaymentDue) {
      updateData.nextPaymentDue = new Date(validated.nextPaymentDue);
    }

    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (validated.stage && validated.stage !== existingDeal.stage) {
      await prisma.property.update({
        where: { id: updatedDeal.propertyId },
        data: {
          lastVerifiedAt: new Date(),
          verificationSource: 'SYSTEM',
        },
      });
      
      logger.info('Updated property freshness due to deal stage change', { 
        propertyId: updatedDeal.propertyId,
        oldStage: existingDeal.stage,
        newStage: validated.stage
      });
    }

    logger.info('Deal updated successfully', { 
      dealId: params.id, 
      updatedBy: agent.id 
    });

    const serializedDeal = {
      ...updatedDeal,
      amount: updatedDeal.amount ? serializeDecimal(updatedDeal.amount) : null,
      monthlyRent: updatedDeal.monthlyRent ? serializeDecimal(updatedDeal.monthlyRent) : null,
      depositAmount: updatedDeal.depositAmount ? serializeDecimal(updatedDeal.depositAmount) : null,
    };

    return successResponse({ deal: serializedDeal });
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Deleting deal', { dealId: params.id, deletedBy: agent.id });

    const existingDeal = await prisma.deal.findUnique({
      where: { id: params.id },
    });

    if (!existingDeal) {
      throw new NotFoundError('Deal not found');
    }

    const property = await prisma.property.findUnique({
      where: { id: existingDeal.propertyId },
      select: { agentId: true },
    });

    if (!property) {
      throw new NotFoundError('Associated property not found');
    }

    if (!isInternalAgent(agent.role) && property.agentId !== agent.id) {
      throw new ValidationError('You do not have permission to delete this deal');
    }

    await prisma.deal.delete({
      where: { id: params.id },
    });

    logger.info('Deal deleted successfully', { 
      dealId: params.id, 
      deletedBy: agent.id 
    });

    return successResponse({ 
      message: 'Deal deleted successfully'
    });
  })
);

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  requireRole,
  ValidationError,
  NotFoundError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { agentUpdateSchema } from '@/lib/validation/schemas';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Fetching agent by ID', { agentId: params.id, requestedBy: agent.id });

    const targetAgent = await prisma.agentProfile.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        lineId: true,
        whatsapp: true,
        imageUrl: true,
        languages: true,
        role: true,
        companyName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!targetAgent) {
      throw new NotFoundError('Agent not found');
    }

    logger.info('Agent fetched', { agentId: params.id, requestedBy: agent.id });

    return successResponse({ agent: targetAgent });
  })
);

export const PUT = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = agentUpdateSchema.parse(body);

    logger.debug('Updating agent', { 
      agentId: params.id, 
      updatedBy: agent.id,
      updates: Object.keys(validated)
    });

    // Check if agent exists
    const existingAgent = await prisma.agentProfile.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent) {
      throw new NotFoundError('Agent not found');
    }

    // If updating email, check for duplicates
    if (validated.email && validated.email !== existingAgent.email) {
      const duplicateEmail = await prisma.agentProfile.findFirst({
        where: { 
          email: validated.email,
          id: { not: params.id }
        },
      });

      if (duplicateEmail) {
        throw new ValidationError('An agent with this email already exists');
      }
    }

    const updatedAgent = await prisma.agentProfile.update({
      where: { id: params.id },
      data: validated,
    });

    logger.info('Agent updated successfully', { 
      agentId: params.id, 
      updatedBy: agent.id 
    });

    return successResponse({ agent: updatedAgent });
  }, requireRole('SUPER_ADMIN', 'PLATFORM_AGENT'))
);

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { id: string } }, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Deleting agent', { agentId: params.id, deletedBy: agent.id });

    // Check if agent exists
    const existingAgent = await prisma.agentProfile.findUnique({
      where: { id: params.id },
    });

    if (!existingAgent) {
      throw new NotFoundError('Agent not found');
    }

    // Soft delete by setting isActive to false instead of hard delete
    // This preserves data integrity for properties and deals
    const deletedAgent = await prisma.agentProfile.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    logger.info('Agent deactivated', { 
      agentId: params.id, 
      deletedBy: agent.id 
    });

    return successResponse({ 
      message: 'Agent deactivated successfully',
      agent: deletedAgent 
    });
  }, requireRole('SUPER_ADMIN'))
);

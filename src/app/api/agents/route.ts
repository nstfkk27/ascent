import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  requireRole,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { agentProfileSchema } from '@/lib/validation/schemas';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Fetching agents', { requestedBy: agent.id });

    const { searchParams } = req.nextUrl;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const agents = await prisma.agentProfile.findMany({
      where,
      orderBy: { createdAt: 'asc' },
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

    logger.info('Agents fetched', { count: agents.length, requestedBy: agent.id });

    return successResponse({ agents });
  })
);

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = agentProfileSchema.parse(body);

    logger.debug('Creating new agent', { 
      createdBy: agent.id, 
      newAgentEmail: validated.email,
      newAgentRole: validated.role 
    });

    // Check if agent with same email already exists
    if (validated.email) {
      const existingAgent = await prisma.agentProfile.findFirst({
        where: { email: validated.email },
      });

      if (existingAgent) {
        throw new ValidationError('An agent with this email already exists');
      }
    }

    const newAgent = await prisma.agentProfile.create({
      data: {
        name: validated.name,
        role: validated.role,
        email: validated.email,
        phone: validated.phone,
        lineId: validated.lineId,
        whatsapp: validated.whatsapp,
        imageUrl: validated.imageUrl,
        languages: validated.languages,
        companyName: validated.companyName,
        isActive: validated.isActive,
      },
    });

    logger.info('Agent created successfully', { 
      agentId: newAgent.id, 
      createdBy: agent.id,
      role: newAgent.role 
    });

    return successResponse({ agent: newAgent });
  }, requireRole('SUPER_ADMIN'))
);

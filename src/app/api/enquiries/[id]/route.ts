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
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']).optional(),
});

export const PATCH = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const { id } = await context.params;
    const body = await req.json();
    const validated = updateSchema.parse(body);

    // Find enquiry
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      throw new NotFoundError('Enquiry not found');
    }

    // Check permissions - agents can only update their own enquiries
    if (!isInternalAgent(agent.role) && enquiry.agentId !== agent.id) {
      throw new ValidationError('You can only update your own enquiries');
    }

    // Update enquiry
    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        ...validated,
        ...(validated.status === 'CONTACTED' && !enquiry.respondedAt && {
          respondedAt: new Date(),
        }),
      },
    });

    logger.info('Enquiry updated', { 
      enquiryId: id, 
      agentId: agent.id,
      status: validated.status 
    });

    return successResponse(updated);
  })
);

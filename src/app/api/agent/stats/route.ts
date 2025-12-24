import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Fetching dashboard stats', { agentId: agent.id, role: agent.role });

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const propertyWhere: any = { status: 'AVAILABLE' };
    
    if (agent.role === 'AGENT' || agent.role === 'PLATFORM_AGENT') {
      propertyWhere.agentId = agent.id;
    }

    const [
      activeListings,
      pendingSubmissions,
      freshListings,
      needsCheckListings
    ] = await prisma.$transaction([
      prisma.property.count({ where: propertyWhere }),
      prisma.propertySubmission.count({ where: { status: 'PENDING' } }),
      prisma.property.count({ 
        where: { 
          ...propertyWhere,
          lastVerifiedAt: { gte: fourteenDaysAgo }
        } 
      }),
      prisma.property.count({ 
        where: { 
          ...propertyWhere,
          lastVerifiedAt: { lt: fourteenDaysAgo }
        } 
      })
    ]);

    logger.info('Dashboard stats fetched', { 
      agentId: agent.id,
      activeListings,
      pendingSubmissions 
    });

    return successResponse({
      activeListings,
      pendingSubmissions,
      freshListings,
      needsCheckListings
    });
  })
);

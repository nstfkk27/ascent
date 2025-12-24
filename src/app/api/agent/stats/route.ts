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

    // Build enquiry where clause
    const enquiryWhere: any = {};
    if (agent.role === 'AGENT' || agent.role === 'PLATFORM_AGENT') {
      enquiryWhere.agentId = agent.id;
    }

    const [
      activeListings,
      pendingSubmissions,
      freshListings,
      needsCheckListings,
      totalEnquiries,
      newEnquiries,
      recentEnquiries
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
      }),
      // Total enquiries
      prisma.enquiry.count({ where: enquiryWhere }),
      // New enquiries (last 7 days)
      prisma.enquiry.count({ 
        where: { 
          ...enquiryWhere,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        } 
      }),
      // Recent enquiries for display
      prisma.enquiry.findMany({
        where: enquiryWhere,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          agent: {
            select: { name: true }
          }
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
      needsCheckListings,
      totalEnquiries,
      newEnquiries,
      recentEnquiries: recentEnquiries.map(e => ({
        id: e.id,
        propertyId: e.propertyId,
        name: e.name,
        channel: e.channel,
        message: e.message,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      }))
    });
  })
);

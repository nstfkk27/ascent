import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  withRateLimit,
  successResponse,
  ValidationError,
  isInternalAgent
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { sendPropertyEnquiryEmail } from '@/lib/email';
import { z } from 'zod';

const enquirySchema = z.object({
  propertyId: z.string().uuid(),
  channel: z.enum(['PHONE', 'EMAIL', 'LINE', 'WHATSAPP', 'WEBSITE_FORM']),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  agentId: z.string().uuid().optional(),
});

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const { searchParams } = req.nextUrl;
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (!isInternalAgent(agent.role)) {
      where.agentId = agent.id;
    }
    
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    logger.debug('Fetching enquiries', { agentId: agent.id, filters: where });

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    });

    logger.info('Enquiries fetched', { count: enquiries.length, agentId: agent.id });

    return successResponse({ enquiries });
  })
);

export const POST = withErrorHandler(async (req: NextRequest) => {
  await withRateLimit(req, { limit: 5, window: '1h' });
  
  const body = await req.json();
  const validated = enquirySchema.parse(body);

    logger.debug('Creating enquiry', { propertyId: validated.propertyId, channel: validated.channel });

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      select: {
        id: true,
        title: true,
        slug: true,
        agentId: true,
      }
    });

    if (!property) {
      throw new ValidationError('Property not found');
    }

    const targetAgentId = validated.agentId || property.agentId;
    
    if (!targetAgentId) {
      throw new ValidationError('No agent assigned to this property');
    }

    const targetAgent = await prisma.agentProfile.findUnique({ 
      where: { id: targetAgentId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!targetAgent) {
      throw new ValidationError('Agent not found');
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId: validated.propertyId,
        channel: validated.channel,
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        message: validated.message,
        agentId: targetAgentId,
      },
    });

    const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://estateascent.com'}/property/${property.slug || property.id}`;

    try {
      await sendPropertyEnquiryEmail({
        propertyTitle: property.title,
        propertyUrl,
        enquirerName: validated.name,
        enquirerEmail: validated.email,
        enquirerPhone: validated.phone,
        message: validated.message,
        agentEmail: targetAgent.email || '',
        agentName: targetAgent.name || 'Agent',
      });

      logger.info('Enquiry created and email sent', { 
        enquiryId: enquiry.id, 
        propertyId: property.id,
        agentEmail: targetAgent.email 
      });
    } catch (emailError) {
      logger.error('Failed to send enquiry email', { 
        error: emailError, 
        enquiryId: enquiry.id 
      });
    }

  return successResponse({ enquiry }, undefined, 201);
});

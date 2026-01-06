import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const submissionSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  listingType: z.enum(['SALE', 'RENT', 'BOTH']),
  category: z.enum(['HOUSE', 'CONDO', 'INVESTMENT', 'LAND']),
  contactName: z.string().min(2, 'Contact name is required'),
  contactLine: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  commission: z.string().optional(),
  images: z.array(z.string().url()).default([]),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validated = submissionSchema.parse(body);

  logger.debug('Creating property submission', { title: validated.title });

  const submission = await prisma.propertySubmission.create({
    data: {
      title: validated.title,
      description: validated.description,
      price: validated.price,
      listingType: validated.listingType,
      category: validated.category,
      contactName: validated.contactName,
      contactLine: validated.contactLine,
      contactPhone: validated.contactPhone,
      address: validated.address,
      city: validated.city,
      state: validated.state,
      commission: validated.commission,
      images: validated.images,
      status: 'PENDING'
    },
  });

  logger.info('Property submission created', { submissionId: submission.id });

  return successResponse({ submission }, undefined, 201);
});

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Fetching property submissions', { agentId: agent.id });

    const submissions = await prisma.propertySubmission.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const serializedSubmissions = submissions.map(sub => ({
      ...sub,
      price: sub.price.toNumber()
    }));
    
    logger.info('Property submissions fetched', { count: submissions.length });

    return successResponse({ submissions: serializedSubmissions });
  })
);

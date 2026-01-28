import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  paginatedResponse,
  requireRole,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  excerpt: z.string().optional().transform(val => val || undefined),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.enum(['LOCAL_NEWS', 'LEGAL', 'VISA']),
  coverImage: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
  published: z.boolean().default(false),
  authorName: z.string().optional().transform(val => val || undefined),
});

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = postSchema.parse(body);

    logger.debug('Creating post', { agentId: agent.id, title: validated.title });

    // Generate unique slug
    let slug = generateSlug(validated.title);
    const existingSlug = await prisma.post.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title: validated.title,
        excerpt: validated.excerpt,
        content: validated.content,
        category: validated.category,
        coverImage: validated.coverImage,
        published: validated.published,
        authorId: agent.id,
        authorName: validated.authorName || agent.name,
      },
    });

    logger.info('Post created', { postId: post.id, agentId: agent.id });

    return successResponse({ post }, undefined, 201);
  }, requireRole('SUPER_ADMIN', 'PLATFORM_AGENT'))
);

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const publishedOnly = searchParams.get('published') !== 'false';
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const skip = (page - 1) * limit;
  
  logger.debug('Fetching posts', { category, publishedOnly, page, limit });
  
  const where: any = {};
  if (category) where.category = category;
  if (publishedOnly) where.published = true;

  const [total, posts] = await prisma.$transaction([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })
  ]);

  logger.info('Posts fetched', { count: posts.length, total });

  return paginatedResponse(posts, page, limit, total);
});

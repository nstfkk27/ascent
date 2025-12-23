import { NextRequest } from 'next/server';
import { withErrorHandler, successResponse } from '@/lib/api';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return successResponse({ projects: [] });
  }

  logger.debug('Searching projects', { query });

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          nameTh: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      nameTh: true,
      lat: true,
      lng: true,
      address: true,
      city: true
    },
    take: 10,
  });

  const serializedProjects = projects.map(p => ({
    ...p,
    lat: p.lat.toNumber(),
    lng: p.lng.toNumber(),
  }));

  logger.info('Projects found', { count: serializedProjects.length, query });

  return successResponse({ projects: serializedProjects });
});

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Require at least 2 characters
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const q = query.toLowerCase();

    // Run searches in parallel for speed
    const [projects, cities, referenceIdMatches] = await Promise.all([
      // 1. Search Projects (limit 4)
      prisma.project.findMany({
        where: {
          name: {
            contains: q,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          nameTh: true,
          city: true,
          type: true,
          totalUnits: true,
          _count: {
            select: {
              units: {
                where: { status: 'AVAILABLE' }
              }
            }
          }
        },
        take: 4,
        orderBy: {
          name: 'asc'
        }
      }),

      // 2. Search Cities (limit 2)
      prisma.property.groupBy({
        by: ['city'],
        where: {
          city: {
            contains: q,
            mode: 'insensitive'
          },
          status: 'AVAILABLE'
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 2
      }),

      // 3. Search Reference IDs (limit 2)
      prisma.property.findMany({
        where: {
          referenceId: {
            contains: q,
            mode: 'insensitive'
          },
          status: 'AVAILABLE'
        },
        select: {
          id: true,
          referenceId: true,
          slug: true,
          title: true,
          category: true,
          projectName: true
        },
        take: 2,
        orderBy: {
          referenceId: 'asc'
        }
      })
    ]);

    // Format suggestions
    const suggestions = [];

    // Add projects
    projects.forEach(project => {
      suggestions.push({
        type: 'project',
        id: project.id,
        name: project.name,
        nameTh: project.nameTh,
        subtitle: `${project.city} • ${project._count.units} available units`,
        category: project.type,
        icon: 'building'
      });
    });

    // Add cities
    cities.forEach(city => {
      suggestions.push({
        type: 'city',
        name: city.city,
        subtitle: `${city._count.id} properties`,
        icon: 'map-pin'
      });
    });

    // Add reference IDs
    referenceIdMatches.forEach(property => {
      suggestions.push({
        type: 'reference',
        id: property.id,
        slug: property.slug,
        name: property.referenceId,
        subtitle: property.projectName || property.title,
        category: property.category,
        icon: 'hash'
      });
    });

    return NextResponse.json({ 
      suggestions,
      query 
    });

  } catch (error) {
    console.error('Autocomplete search error:', error);
    return NextResponse.json(
      { suggestions: [], error: 'Search failed' },
      { status: 500 }
    );
  }
}

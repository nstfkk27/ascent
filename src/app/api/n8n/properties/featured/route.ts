/**
 * n8n API: Featured Properties
 * Get featured properties for marketing automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateN8nApiKey } from '@/lib/n8n/auth';
import { PropertyCategory } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') as PropertyCategory | null;
    const type = searchParams.get('type') || 'all'; // all, new, price_drop, super_deal

    const where: any = {
      status: 'AVAILABLE',
    };

    if (category) {
      where.category = category;
    }

    // Filter by type
    if (type === 'new') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (type === 'super_deal') {
      where.dealQuality = 'SUPER_DEAL';
    } else if (type === 'featured') {
      where.featured = true;
    }

    const properties = await prisma.property.findMany({
      where,
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { dealQuality: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        referenceId: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        category: true,
        listingType: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        area: true,
        city: true,
        images: true,
        highlights: true,
        keyFeatures: true,
        dealQuality: true,
        featured: true,
        createdAt: true,
      }
    });

    const formattedProperties = properties.map(p => ({
      id: p.id,
      listingCode: p.referenceId,
      slug: p.slug,
      title: p.title,
      description: p.description,
      price: p.price?.toNumber() || 0,
      category: p.category,
      listingType: p.listingType,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      size: p.size?.toNumber() || 0,
      area: p.area,
      city: p.city,
      images: p.images,
      highlights: p.highlights,
      keyFeatures: p.keyFeatures,
      dealQuality: p.dealQuality,
      featured: p.featured,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://estateascent.com'}/properties/${p.slug}`,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: formattedProperties.length,
      properties: formattedProperties,
    });

  } catch (error) {
    console.error('n8n featured properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured properties' },
      { status: 500 }
    );
  }
}

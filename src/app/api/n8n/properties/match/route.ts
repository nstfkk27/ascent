/**
 * n8n API: Property Matching
 * Match properties based on lead criteria
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateN8nApiKey } from '@/lib/n8n/auth';
import { PropertyCategory, ListingType } from '@prisma/client';

export async function GET(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const category = searchParams.get('category') as PropertyCategory | null;
    const bedrooms = searchParams.get('bedrooms');
    const area = searchParams.get('area');
    const city = searchParams.get('city') || 'Pattaya';
    const listingType = searchParams.get('listingType') as ListingType | null;
    const limit = parseInt(searchParams.get('limit') || '5');

    // Build where clause
    const where: any = {
      status: 'AVAILABLE',
    };

    if (category) {
      where.category = category;
    }

    if (listingType) {
      where.listingType = { in: [listingType, 'BOTH'] };
    }

    if (city) {
      where.city = city;
    }

    if (area) {
      where.area = area;
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    // Price filtering
    if (minBudget || maxBudget) {
      const priceCondition: any = {};
      if (minBudget) priceCondition.gte = parseFloat(minBudget);
      if (maxBudget) priceCondition.lte = parseFloat(maxBudget);
      where.price = priceCondition;
    }

    // Fetch matching properties
    const properties = await prisma.property.findMany({
      where,
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        referenceId: true,
        slug: true,
        title: true,
        price: true,
        category: true,
        listingType: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        area: true,
        city: true,
        address: true,
        images: true,
        highlights: true,
        agentCommissionRate: true,
        commissionAmount: true,
        agentId: true,
      }
    });

    // Format response
    const formattedProperties = properties.map(p => ({
      id: p.id,
      listingCode: p.referenceId,
      slug: p.slug,
      title: p.title,
      price: p.price?.toNumber() || 0,
      category: p.category,
      listingType: p.listingType,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      size: p.size?.toNumber() || 0,
      area: p.area,
      city: p.city,
      address: p.address,
      images: p.images,
      highlights: p.highlights,
      commission: {
        rate: p.agentCommissionRate?.toNumber() || null,
        amount: p.commissionAmount?.toNumber() || null,
      },
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://estateascent.com'}/properties/${p.slug}`,
    }));

    return NextResponse.json({
      success: true,
      count: formattedProperties.length,
      properties: formattedProperties,
    });

  } catch (error) {
    console.error('n8n property match error:', error);
    return NextResponse.json(
      { error: 'Failed to match properties' },
      { status: 500 }
    );
  }
}

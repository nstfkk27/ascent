import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// GET - Fetch sold properties (for analytics/comps)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const area = searchParams.get('area');
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (city) where.city = city;
    if (area) where.area = area;
    if (category) where.category = category;
    if (projectId) where.projectId = projectId;

    const soldProperties = await prisma.soldProperty.findMany({
      where,
      orderBy: { soldAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ 
      success: true, 
      data: soldProperties.map(p => ({
        ...p,
        listingPrice: p.listingPrice ? Number(p.listingPrice) : null,
        listingRentPrice: p.listingRentPrice ? Number(p.listingRentPrice) : null,
        finalPrice: p.finalPrice ? Number(p.finalPrice) : null,
        commissionEarned: p.commissionEarned ? Number(p.commissionEarned) : null,
        latitude: p.latitude ? Number(p.latitude) : null,
        longitude: p.longitude ? Number(p.longitude) : null,
      }))
    });
  } catch (error) {
    console.error('Failed to fetch sold properties:', error);
    return NextResponse.json({ error: 'Failed to fetch sold properties' }, { status: 500 });
  }
}

// POST - Archive a property as sold (called when deleting/marking as sold)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const body = await request.json();
    const { propertyId, soldType, finalPrice, notes } = body;

    if (!propertyId || !soldType) {
      return NextResponse.json({ error: 'propertyId and soldType are required' }, { status: 400 });
    }

    // Fetch the original property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate days on market
    const daysOnMarket = Math.floor(
      (new Date().getTime() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create sold property record
    const soldProperty = await prisma.soldProperty.create({
      data: {
        originalId: property.id,
        title: property.title,
        description: property.description,
        category: property.category,
        houseType: property.houseType,
        investmentType: property.investmentType,
        address: property.address,
        city: property.city,
        area: property.area,
        projectName: property.projectName,
        projectId: property.projectId,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size,
        floor: property.floor,
        latitude: property.latitude,
        longitude: property.longitude,
        images: property.images,
        listingPrice: property.price,
        listingRentPrice: property.rentPrice,
        listingType: property.listingType,
        soldType,
        finalPrice: finalPrice ? parseFloat(finalPrice) : null,
        daysOnMarket,
        agentId: property.agentId || agent.id,
        commissionEarned: property.commissionAmount,
        listedAt: property.createdAt,
        notes,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...soldProperty,
        listingPrice: soldProperty.listingPrice ? Number(soldProperty.listingPrice) : null,
        finalPrice: soldProperty.finalPrice ? Number(soldProperty.finalPrice) : null,
      }
    });
  } catch (error) {
    console.error('Failed to archive sold property:', error);
    return NextResponse.json({ error: 'Failed to archive sold property' }, { status: 500 });
  }
}

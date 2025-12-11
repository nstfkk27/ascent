import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/properties - Get all properties with optional filters
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Build filter object
    const where: any = {};
    
    const category = searchParams.get('category');
    if (category) {
      where.category = category;
    }
    
    const houseType = searchParams.get('houseType');
    if (houseType) {
      where.houseType = houseType;
    }
    
    const investmentType = searchParams.get('investmentType');
    if (investmentType) {
      where.investmentType = investmentType;
    }
    
    const listingType = searchParams.get('listingType');
    if (listingType) {
      if (listingType === 'SALE' || listingType === 'RENT') {
        // If searching for SALE or RENT, also include BOTH
        where.listingType = { in: [listingType, 'BOTH'] };
      } else {
        // If searching for BOTH or anything else, match exactly
        where.listingType = listingType;
      }
    }
    
    const city = searchParams.get('city');
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    const area = searchParams.get('area');
    if (area) {
      where.area = area;
    }
    
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }
    
    const featured = searchParams.get('featured');
    if (featured === 'true') {
      where.featured = true;
    }
    
    const status = searchParams.get('status') || 'AVAILABLE';
    where.status = status;

    // Dynamic Feature filters
    const knownParams = [
      'category', 'houseType', 'investmentType', 'listingType', 
      'city', 'area', 'minPrice', 'maxPrice', 'bedrooms', 'featured', 'status',
      'page', 'limit', 'query', 'openForYearsRange', 'staffRange', 'equipmentIncluded'
    ];
    
    const booleanColumns = ['petFriendly', 'furnished', 'pool', 'garden', 'conferenceRoom'];
    
    // Initialize AND array if not exists
    if (!where.AND) where.AND = [];

    // Handle Investment Ranges
    const openForYearsRange = searchParams.get('openForYearsRange');
    if (openForYearsRange) {
      if (openForYearsRange === '10+') {
        where.openForYears = { gte: 10 };
      } else {
        const [min, max] = openForYearsRange.split('-').map(Number);
        where.openForYears = { gte: min, lte: max };
      }
    }

    const staffRange = searchParams.get('staffRange');
    if (staffRange) {
      if (staffRange === '20+') {
        where.numberOfStaff = { gte: 20 };
      } else {
        const [min, max] = staffRange.split('-').map(Number);
        where.numberOfStaff = { gte: min, lte: max };
      }
    }

    const equipmentIncluded = searchParams.get('equipmentIncluded');
    if (equipmentIncluded) {
      where.equipmentIncluded = equipmentIncluded;
    }

    searchParams.forEach((value, key) => {
      if (knownParams.includes(key)) return;
      
      if (booleanColumns.includes(key)) {
        if (value === 'true') {
          // For pool and garden, check both boolean column AND amenities JSON
          // This handles cases where Investment properties store these in JSON
          if (key === 'pool') {
            where.AND.push({
              OR: [
                { pool: true },
                { amenities: { path: ['pool'], equals: true } },
                { amenities: { path: ['swimmingPool'], equals: true } }
              ]
            });
          } else if (key === 'garden') {
            where.AND.push({
              OR: [
                { garden: true },
                { amenities: { path: ['garden'], equals: true } }
              ]
            });
          } else {
            where[key] = true;
          }
        }
        return;
      }
      
      // Assume it's an amenity in the JSON
      if (value === 'true') {
        where.AND.push({
          amenities: {
            path: [key],
            equals: true
          }
        });
      }
    });
    
    // Get properties
    const properties = await prisma.property.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'address', 'city', 'state', 'zipCode', 'category', 'size'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Dynamic Price Validation
    if (body.listingType === 'SALE' || body.listingType === 'BOTH') {
      if (!body.price) {
        return NextResponse.json({ success: false, error: 'Missing required field: Sale Price' }, { status: 400 });
      }
    }
    if (body.listingType === 'RENT' || body.listingType === 'BOTH') {
      if (!body.rentPrice) {
        return NextResponse.json({ success: false, error: 'Missing required field: Rental Price' }, { status: 400 });
      }
    }
    
    // Create property
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price || null,
        rentPrice: body.rentPrice || null,
        address: body.address,
        city: body.city,
        area: body.area || null,
        state: body.state,
        zipCode: body.zipCode,
        category: body.category,
        
        // House-specific
        houseType: body.houseType || null,
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        size: body.size,
        petFriendly: body.petFriendly || null,
        parking: body.parking || null,
        furnished: body.furnished || null,
        garden: body.garden || null,
        pool: body.pool || null,
        floors: body.floors || null,
        
        // Condo-specific
        projectName: body.projectName || null,
        floor: body.floor || null,
        amenities: body.amenities || null,
        
        // Investment-specific
        investmentType: body.investmentType || null,
        openForYears: body.openForYears || null,
        equipmentIncluded: body.equipmentIncluded || null,
        numberOfStaff: body.numberOfStaff || null,
        monthlyRevenue: body.monthlyRevenue || null,
        license: body.license || null,
        conferenceRoom: body.conferenceRoom || null,
        
        status: body.status || 'AVAILABLE',
        listingType: body.listingType || 'SALE',
        images: body.images || [],
        featured: body.featured || false,
        
        latitude: body.latitude || null,
        longitude: body.longitude || null,
      },
    });
    
    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}

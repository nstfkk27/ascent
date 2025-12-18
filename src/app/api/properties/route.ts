import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizePropertyData } from '@/lib/property-utils';
import { createClient } from '@/utils/supabase/server';

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

    // Generic subtype parameter - maps to houseType or investmentType based on category
    const subtype = searchParams.get('subtype');
    if (subtype) {
      // Investment subtypes
      const investmentSubtypes = ['HOTEL', 'CLUB_BAR', 'MASSAGE', 'RESTAURANT', 'WELLNESS', 'GUESTHOUSE', 'RESORT', 'HOSTEL', 'SERVICED_APARTMENT'];
      // House subtypes
      const houseSubtypes = ['POOL_VILLA', 'TOWNHOUSE', 'SINGLE_HOUSE', 'TWIN_HOUSE', 'COMMERCIAL_BUILDING'];
      
      if (investmentSubtypes.includes(subtype)) {
        where.investmentType = subtype;
      } else if (houseSubtypes.includes(subtype)) {
        where.houseType = subtype;
      }
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

    // New Project filter (built within last 2 years)
    const newProject = searchParams.get('newProject');
    if (newProject === 'true') {
      const currentYear = new Date().getFullYear();
      where.AND = where.AND || [];
      where.AND.push({
        project: {
          is: {
            completionYear: {
              gte: currentYear - 2,
            },
          },
        },
      });
    }

    const tag = searchParams.get('tag');
    if (tag) {
      const currentYear = new Date().getFullYear();
      const isNewProject = {
        project: {
          is: {
            completionYear: {
              gte: currentYear - 1,
            },
          },
        },
      };

      if (tag === 'new') {
        // Only listings that belong to a project completed within the last 1 year
        where.AND = where.AND || [];
        where.AND.push(isNewProject);
      }

      if (tag === 'renovation') {
        // Exclude new projects: treat standalone listings as "old" by default
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { projectId: null },
            {
              project: {
                is: {
                  OR: [
                    { completionYear: null },
                    { completionYear: { lt: currentYear - 1 } },
                  ],
                },
              },
            },
          ],
        });
      }
    }

    // Dynamic Feature filters
    const knownParams = [
      'category', 'houseType', 'investmentType', 'listingType', 
      'city', 'area', 'minPrice', 'maxPrice', 'bedrooms', 'featured', 'status',
      'page', 'limit', 'query', 'openForYearsRange', 'staffRange', 'equipmentIncluded',
      'landZoneColor', 'tag'
    ];
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const booleanColumns = ['petFriendly', 'furnished', 'pool', 'garden', 'conferenceRoom'];
    
    // Initialize AND array if not exists
    if (!where.AND) where.AND = [];

    // Handle Land Zone Color
    const landZoneColor = searchParams.get('landZoneColor');
    if (landZoneColor) {
      where.landZoneColor = landZoneColor;
    }

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
          // For pool and garden, check both boolean column AND unitFeatures JSON
          // This handles cases where Investment properties store these in JSON
          if (key === 'pool') {
            where.AND.push({
              OR: [
                { pool: true },
                { unitFeatures: { path: ['pool'], equals: true } },
                { unitFeatures: { path: ['swimmingPool'], equals: true } },
                { unitFeatures: { path: ['privatePool'], equals: true } }
              ]
            });
          } else if (key === 'garden') {
            where.AND.push({
              OR: [
                { garden: true },
                { unitFeatures: { path: ['garden'], equals: true } },
                { unitFeatures: { path: ['privateGarden'], equals: true } }
              ]
            });
          } else {
            where[key] = true;
          }
        }
        return;
      }
      
      // Assume it's a unit feature in the JSON
      if (value === 'true') {
        where.AND.push({
          unitFeatures: {
            path: [key],
            equals: true
          }
        });
      }
    });
    
    // Get properties
    const [total, properties] = await prisma.$transaction([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      })
    ]);

    const serializedProperties = properties.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lastVerifiedAt: p.lastVerifiedAt.toISOString(),
      price: p.price ? p.price.toNumber() : null,
      rentPrice: p.rentPrice ? p.rentPrice.toNumber() : null,
      monthlyRevenue: p.monthlyRevenue ? p.monthlyRevenue.toNumber() : null,
      latitude: p.latitude ? p.latitude.toNumber() : null,
      longitude: p.longitude ? p.longitude.toNumber() : null,
      commissionRate: p.commissionRate ? p.commissionRate.toNumber() : null,
      commissionAmount: p.commissionAmount ? p.commissionAmount.toNumber() : null,
      agentCommissionRate: p.agentCommissionRate ? p.agentCommissionRate.toNumber() : null,
      coAgentCommissionRate: p.coAgentCommissionRate ? p.coAgentCommissionRate.toNumber() : null,
    }));
    
    return NextResponse.json({
      success: true,
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: serializedProperties,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
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

    // Backwards compatibility: older clients may send unitFeatures instead of amenities
    if (body?.unitFeatures && !body?.amenities) {
      body.amenities = body.unitFeatures;
    }
    
    // Check User Role for Permissions
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let userRole = 'AGENT';
    if (user && user.email) {
      const agent = await prisma.agentProfile.findFirst({
        where: { email: user.email }
      });
      if (agent) {
        userRole = agent.role;
      }
    }
    
    const isInternal = userRole === 'SUPER_ADMIN' || userRole === 'PLATFORM_AGENT';
    
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
    const rawData = {
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
        
        // Common features (House & Condo)
        bedrooms: body.bedrooms || null,
        bathrooms: body.bathrooms || null,
        size: body.size,
        petFriendly: body.petFriendly || null,
        parking: body.parking || null,
        furnished: body.furnished || null,
        garden: body.garden || null,
        pool: body.pool || null,
        floors: body.floors || null,
        amenities: body.amenities || null,
        
        // Project/Village Name
        projectName: body.projectName || null,
        projectId: body.projectId || null,
        
        // Commission (Restricted)
        commissionRate: isInternal ? (body.commissionRate || null) : null,
        commissionAmount: isInternal ? (body.commissionAmount || null) : null,
        agentCommissionRate: body.agentCommissionRate || null, // All agents can set this
        coAgentCommissionRate: body.coAgentCommissionRate || null, // All agents can set this
        
        // Condo-specific
        floor: body.floor || null,
        
        // Investment-specific
        investmentType: body.investmentType || null,
        openForYears: body.openForYears || null,
        equipmentIncluded: body.equipmentIncluded || null,
        numberOfStaff: body.numberOfStaff || null,
        monthlyRevenue: body.monthlyRevenue || null,
        license: body.license || null,
        conferenceRoom: body.conferenceRoom || null,
        
        // Land-specific
        landZoneColor: body.landZoneColor || null,
        
        status: body.status || 'AVAILABLE',
        listingType: body.listingType || 'SALE',
        images: body.images || [],
        featured: body.featured || false,
        
        latitude: body.latitude || null,
        longitude: body.longitude || null,
    };

    const cleanData = sanitizePropertyData(rawData);

    const property = await prisma.property.create({
      data: cleanData,
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

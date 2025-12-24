import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  withAuth, 
  withRateLimit,
  successResponse,
  paginatedResponse,
  isInternalAgent,
} from '@/lib/api';
import { validatePagination } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { sanitizePropertyData } from '@/lib/property-utils';
import { generateReferenceId, generateUniqueSlug } from '@/utils/propertyHelpers';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    const searchParams = req.nextUrl.searchParams;
    const { page, limit } = validatePagination(searchParams);

    const where: any = {};

    if (agent) {
      if (agent.role === 'AGENT' || agent.role === 'PLATFORM_AGENT') {
        where.agentId = agent.id;
      }
    }
    
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
    
    const minSize = searchParams.get('minSize');
    const maxSize = searchParams.get('maxSize');
    if (minSize || maxSize) {
      where.size = {};
      if (minSize) where.size.gte = parseFloat(minSize.replace(/,/g, ''));
      if (maxSize) where.size.lte = parseFloat(maxSize.replace(/,/g, ''));
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
      'page', 'limit', 'query', 'staffRange', 'equipmentIncluded',
      'landZoneColor', 'tag', 'minSize', 'maxSize'
    ];
    
    const skip = (page - 1) * limit;

    logger.info('Fetching properties', {
      agentId: agent?.id,
      role: agent?.role,
      filters: { category: searchParams.get('category'), city: searchParams.get('city'), status: searchParams.get('status') },
      page,
      limit,
    });

    const booleanColumns = ['petFriendly', 'furnished', 'pool', 'garden', 'conferenceRoom'];
    
    // Initialize AND array if not exists
    if (!where.AND) where.AND = [];

    // Handle Land Zone Color
    const landZoneColor = searchParams.get('landZoneColor');
    if (landZoneColor) {
      where.landZoneColor = landZoneColor;
    }

    // Handle Investment Ranges (openForYears removed from schema)

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
    
    return paginatedResponse(serializedProperties, page, limit, total);
  }, { requireAgent: false })
);

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    await withRateLimit(req);

    const body = await req.json();

    if (body?.unitFeatures && !body?.amenities) {
      body.amenities = body.unitFeatures;
    }

    const isInternal = agent ? isInternalAgent(agent.role) : false;

    const requiredFields = ['title', 'description', 'address', 'city', 'state', 'zipCode', 'category', 'size'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate category-specific fields
    if (body.category === 'LAND') {
      const invalidFields = ['bedrooms', 'bathrooms', 'petFriendly', 'furnished', 'floors'];
      for (const field of invalidFields) {
        if (body[field]) {
          throw new Error(`${field} is not applicable to LAND category`);
        }
      }
    }
    
    if (body.category === 'INVESTMENT') {
      const invalidFields = ['petFriendly', 'furnished'];
      for (const field of invalidFields) {
        if (body[field]) {
          throw new Error(`${field} is not applicable to INVESTMENT category`);
        }
      }
    }

    if (body.listingType === 'SALE' || body.listingType === 'BOTH') {
      if (!body.price) {
        throw new Error('Missing required field: Sale Price');
      }
    }
    if (body.listingType === 'RENT' || body.listingType === 'BOTH') {
      if (!body.rentPrice) {
        throw new Error('Missing required field: Rental Price');
      }
    }
    
    const referenceId = await generateReferenceId();
    const slug = await generateUniqueSlug(body.title);

    logger.info('Creating property', {
      agentId: agent?.id,
      category: body.category,
      city: body.city,
    });

    const rawData = {
        referenceId,
        slug,
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
        floors: body.floors || null,
        amenities: body.amenities || null,
        
        // Project/Village Name
        projectName: body.projectName || null,
        ...(body.projectId && {
          project: {
            connect: { id: body.projectId }
          }
        }),
        
        // Commission (Restricted)
        commissionRate: isInternal ? (body.commissionRate || null) : null,
        commissionAmount: isInternal ? (body.commissionAmount || null) : null,
        agentCommissionRate: body.agentCommissionRate || null, // All agents can set this
        coAgentCommissionRate: body.coAgentCommissionRate || null, // All agents can set this
        
        // Condo-specific
        floor: body.floor || null,
        
        // Investment-specific
        investmentType: body.investmentType || null,
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
        
        agentId: agent?.id,
    };

    const cleanData = sanitizePropertyData(rawData);

    const property = await prisma.property.create({
      data: cleanData,
    });

    logger.info('Property created', {
      propertyId: property.id,
      agentId: agent?.id,
      referenceId: property.referenceId,
    });

    return successResponse(property, undefined, 201);
  })
);

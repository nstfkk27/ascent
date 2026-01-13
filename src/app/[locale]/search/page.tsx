import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import { PropertyCategory, ListingType, PropertyStatus, HouseType, InvestmentType } from '@prisma/client';
import { Metadata } from 'next';
import { generateSearchMetadata } from '@/utils/seo/generateMetadata';

export const dynamic = 'force-dynamic'; // Ensure fresh data

export const metadata: Metadata = generateSearchMetadata();

interface HomeProps {
  searchParams: {
    query?: string;
    category?: string;
    subtype?: string;
    listingType?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  }
}


export default async function Home({ searchParams }: HomeProps) {
  try {
    const { 
      query, 
      category, 
      subtype, 
      listingType, 
      minPrice, 
      maxPrice, 
      bedrooms 
    } = searchParams;

    // --- Helper: Build Unit Filter Condition ---
    // This is used for both:
    // 1. Filtering units INSIDE a Project (so we don't show irrelevant units)
    // 2. Finding projects that HAVE at least one matching unit (where: { units: { some: ... } })
    // 3. Filtering Standalone Properties directly
    
    // Safety check for array params
    const safeMinPrice = Array.isArray(minPrice) ? minPrice[0] : minPrice;
    const safeMaxPrice = Array.isArray(maxPrice) ? maxPrice[0] : maxPrice;
    const safeBedrooms = Array.isArray(bedrooms) ? bedrooms[0] : bedrooms;
    
    const minPriceNum = safeMinPrice ? Number(safeMinPrice.replace(/,/g, '')) : undefined;
    const maxPriceNum = safeMaxPrice ? Number(safeMaxPrice.replace(/,/g, '')) : undefined;
    const bedroomsNum = safeBedrooms ? Number(safeBedrooms) : undefined;

    const unitFilter: any = {
      status: 'AVAILABLE'
    };

    if (listingType) {
      const type = Array.isArray(listingType) ? listingType[0] : listingType;
      if (type === 'SALE') {
        unitFilter.listingType = { in: ['SALE', 'BOTH'] };
      } else if (type === 'RENT') {
        unitFilter.listingType = { in: ['RENT', 'BOTH'] };
      }
    }

    if (minPriceNum !== undefined || maxPriceNum !== undefined) {
      const priceCondition: any = {};
      if (minPriceNum !== undefined) priceCondition.gte = minPriceNum;
      if (maxPriceNum !== undefined) priceCondition.lte = maxPriceNum;

      const type = Array.isArray(listingType) ? listingType[0] : listingType;
      if (type === 'RENT') {
        unitFilter.rentPrice = priceCondition;
      } else if (type === 'SALE') {
        unitFilter.price = priceCondition;
      } else {
        // If type not specified, check either
        unitFilter.OR = [
          { price: priceCondition },
          { rentPrice: priceCondition }
        ];
      }
    }

    if (bedroomsNum !== undefined) {
      unitFilter.bedrooms = { gte: bedroomsNum };
    }

    if (subtype) {
      const typeStr = Array.isArray(subtype) ? subtype[0] : subtype;
      // Handle specific property subtypes
      if (typeStr && typeStr !== 'CONDO' && typeStr !== 'LAND') {
         // Check if subtype is a valid HouseType
         if (Object.values(HouseType).includes(typeStr as HouseType)) {
           unitFilter.houseType = typeStr as HouseType;
         } 
         // Check if subtype is a valid InvestmentType
         else if (Object.values(InvestmentType).includes(typeStr as InvestmentType)) {
           unitFilter.investmentType = typeStr as InvestmentType;
         }
      }
    }

    // --- 1. Fetch Projects ---
    
    const projectWhere: any = {};

    // Text Search
    if (query) {
      const q = Array.isArray(query) ? query[0] : query;
      projectWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Category
    if (category) {
      const cat = Array.isArray(category) ? category[0] : category;
      projectWhere.type = cat as PropertyCategory;
    }

    // Unit-level filters applied to Project
    // We only want projects that have AT LEAST ONE matching unit
    if (Object.keys(unitFilter).length > 1) { // >1 because status: AVAILABLE is always there
      projectWhere.units = {
        some: unitFilter
      };
    }

    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        modelAsset: true,
        units: {
          where: unitFilter // Also filter the returned units so we don't send extra data
        },
        facilities: true,
      },
    });

    // --- 2. Fetch Standalone Properties ---
    
    const standaloneWhere: any = {
      projectId: null,
      status: 'AVAILABLE',
      latitude: { not: null },
      longitude: { not: null },
      ...unitFilter // Spread unit filters directly since Property IS a unit
    };

    // Text Search (Standalone)
    if (query) {
      const q = Array.isArray(query) ? query[0] : query;
      // Wrap existing where in AND if needed, or just add OR
      // But since ...unitFilter might have ORs, we need to be careful.
      // Simplest is to add a top-level AND for the query
      standaloneWhere.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { projectName: { contains: q, mode: 'insensitive' } }
          ]
        }
      ];
    }

    // Category (Standalone)
    if (category) {
      const cat = Array.isArray(category) ? category[0] : category;
      standaloneWhere.category = cat as PropertyCategory;
    }
    
    // Exclude unitFilter.OR from standaloneWhere if we overwrote it, but spreading handles simple keys.
    // Complex logic like "Price OR RentPrice" needs care.
    // The Spread above puts `OR` from unitFilter into standaloneWhere.
    // If we also have Query `OR`, we can't have two `OR` keys.
    // Prisma `AND` allows array of conditions.

    // Let's rebuild standaloneWhere cleanly using AND array to be safe
    const safeStandaloneWhere: any = {
      AND: [
        { projectId: null },
        { status: 'AVAILABLE' },
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    };

    // Add unit filters
    if (unitFilter.listingType) safeStandaloneWhere.AND.push({ listingType: unitFilter.listingType });
    if (unitFilter.bedrooms) safeStandaloneWhere.AND.push({ bedrooms: unitFilter.bedrooms });
    if (unitFilter.rentPrice) safeStandaloneWhere.AND.push({ rentPrice: unitFilter.rentPrice });
    if (unitFilter.price) safeStandaloneWhere.AND.push({ price: unitFilter.price });
    if (unitFilter.houseType) safeStandaloneWhere.AND.push({ houseType: unitFilter.houseType });
    if (unitFilter.investmentType) safeStandaloneWhere.AND.push({ investmentType: unitFilter.investmentType });
    
    // Handle complex ORs from unitFilter (Price or Rent Price)
    if (unitFilter.OR) {
      safeStandaloneWhere.AND.push({ OR: unitFilter.OR });
    }

    // Query
    if (query) {
      const q = Array.isArray(query) ? query[0] : query;
      safeStandaloneWhere.AND.push({
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
            { projectName: { contains: q, mode: 'insensitive' } }
          ]
      });
    }

    // Category
    if (category) {
      const cat = Array.isArray(category) ? category[0] : category;
      safeStandaloneWhere.AND.push({ category: cat as PropertyCategory });
    }

    const standaloneProperties = await prisma.property.findMany({
      where: safeStandaloneWhere,
      select: {
        id: true,
        slug: true,
        referenceId: true,
        title: true,
        description: true,
        price: true,
        rentPrice: true,
        address: true,
        city: true,
        state: true,
        category: true,
        listingType: true,
        status: true,
        images: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        floor: true,
        houseType: true,
        investmentType: true,
        projectName: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        lastVerifiedAt: true,
        monthlyRevenue: true,
        commissionAmount: true,
        agentCommissionRate: true,
        landZoneColor: true,
      }
    });

    // --- 3. Serialize Projects ---
    const serializedProjects = projects.map(project => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      lat: project.lat.toNumber(),
      lng: project.lng.toNumber(),
      imageUrl: project.imageUrl || null, 
      units: project.units.map(unit => ({
        ...unit,
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
        lastVerifiedAt: unit.lastVerifiedAt.toISOString(),
        price: unit.price ? unit.price.toNumber() : null,
        rentPrice: unit.rentPrice ? unit.rentPrice.toNumber() : null,
        monthlyRevenue: unit.monthlyRevenue ? unit.monthlyRevenue.toNumber() : null,
        latitude: unit.latitude ? unit.latitude.toNumber() : null,
        longitude: unit.longitude ? unit.longitude.toNumber() : null,
      }))
    }));

    // --- 4. Serialize Standalone ---
    const serializedStandalone = standaloneProperties.map(prop => ({
      id: prop.id,
      isStandalone: true,
      name: prop.projectName || prop.title, 
      type: prop.category,
      lat: prop.latitude ? prop.latitude.toNumber() : 0,
      lng: prop.longitude ? prop.longitude.toNumber() : 0,
      address: prop.address,
      city: prop.city,
      developer: null,
      completionYear: null,
      description: prop.description,
      modelAsset: null, 
      imageUrl: prop.images && prop.images.length > 0 ? prop.images[0] : null,
      facilities: [],   
      units: [{
        ...prop,
        createdAt: prop.createdAt.toISOString(),
        updatedAt: prop.updatedAt.toISOString(),
        lastVerifiedAt: prop.lastVerifiedAt.toISOString(),
        price: prop.price && prop.price.toNumber() > 0 ? prop.price.toNumber() : null,
        rentPrice: prop.rentPrice && prop.rentPrice.toNumber() > 0 ? prop.rentPrice.toNumber() : null,
        monthlyRevenue: prop.monthlyRevenue ? prop.monthlyRevenue.toNumber() : null,
        latitude: prop.latitude ? prop.latitude.toNumber() : null,
        longitude: prop.longitude ? prop.longitude.toNumber() : null,
      }]
    }));

    // --- 5. Combine ---
    const allProjects = [...serializedProjects, ...serializedStandalone];
    
    return <HomeClient projects={allProjects} />;
  } catch (error) {
    console.error('Search page error:', error);
    // Return empty list or error state to avoid full page crash if possible, 
    // or let it bubble up to error.tsx but now we have logs.
    // Better to return empty list so the page renders at least.
    return <HomeClient projects={[]} />;
  }
}

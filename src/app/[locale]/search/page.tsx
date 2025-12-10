import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';
import { PropertyCategory, ListingType, PropertyStatus, HouseType, InvestmentType } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Ensure fresh data

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
  
  const minPriceNum = minPrice ? Number(minPrice.replace(/,/g, '')) : undefined;
  const maxPriceNum = maxPrice ? Number(maxPrice.replace(/,/g, '')) : undefined;
  const bedroomsNum = bedrooms ? Number(bedrooms) : undefined;

  const unitFilter: any = {
    status: 'AVAILABLE'
  };

  if (listingType) {
    if (listingType === 'SALE') {
      unitFilter.listingType = { in: ['SALE', 'BOTH'] };
    } else if (listingType === 'RENT') {
      unitFilter.listingType = { in: ['RENT', 'BOTH'] };
    }
  }

  if (minPriceNum !== undefined || maxPriceNum !== undefined) {
    const priceCondition: any = {};
    if (minPriceNum !== undefined) priceCondition.gte = minPriceNum;
    if (maxPriceNum !== undefined) priceCondition.lte = maxPriceNum;

    if (listingType === 'RENT') {
      unitFilter.rentPrice = priceCondition;
    } else if (listingType === 'SALE') {
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
    // Handle specific property subtypes
    if (subtype !== 'CONDO' && subtype !== 'LAND') {
       unitFilter.OR = [
         { houseType: subtype as HouseType },
         { investmentType: subtype as InvestmentType }
       ];
    }
  }

  // --- 1. Fetch Projects ---
  
  const projectWhere: any = {};

  // Text Search
  if (query) {
    projectWhere.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { city: { contains: query, mode: 'insensitive' } }
    ];
  }

  // Category
  if (category) {
    projectWhere.type = category as PropertyCategory;
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
    // Wrap existing where in AND if needed, or just add OR
    // But since ...unitFilter might have ORs, we need to be careful.
    // Simplest is to add a top-level AND for the query
    standaloneWhere.AND = [
      {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { projectName: { contains: query, mode: 'insensitive' } }
        ]
      }
    ];
  }

  // Category (Standalone)
  if (category) {
    standaloneWhere.category = category as PropertyCategory;
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
  
  // Handle complex ORs from unitFilter (Price or Rent Price, Subtype)
  if (unitFilter.OR) {
    safeStandaloneWhere.AND.push({ OR: unitFilter.OR });
  }

  // Query
  if (query) {
    safeStandaloneWhere.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { projectName: { contains: query, mode: 'insensitive' } }
        ]
    });
  }

  // Category
  if (category) {
    safeStandaloneWhere.AND.push({ category: category as PropertyCategory });
  }

  const standaloneProperties = await prisma.property.findMany({
    where: safeStandaloneWhere
  });

  // --- 3. Serialize Projects ---
  const serializedProjects = projects.map(project => ({
    ...project,
    lat: project.lat.toNumber(),
    lng: project.lng.toNumber(),
    imageUrl: project.imageUrl || null, 
    units: project.units.map(unit => ({
      ...unit,
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
      price: prop.price ? prop.price.toNumber() : null,
      rentPrice: prop.rentPrice ? prop.rentPrice.toNumber() : null,
      monthlyRevenue: prop.monthlyRevenue ? prop.monthlyRevenue.toNumber() : null,
      latitude: prop.latitude ? prop.latitude.toNumber() : null,
      longitude: prop.longitude ? prop.longitude.toNumber() : null,
    }]
  }));

  // --- 5. Combine ---
  const allProjects = [...serializedProjects, ...serializedStandalone];
  
  return <HomeClient projects={allProjects} />;
}

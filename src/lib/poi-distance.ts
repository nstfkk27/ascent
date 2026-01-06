import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * Haversine formula for calculating distance between two coordinates
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Estimate walking time based on distance (average walking speed: 5 km/h)
 */
export function estimateWalkingMins(distanceKm: number): number {
  return Math.round((distanceKm / 5) * 60);
}

/**
 * Estimate driving time based on distance (average city speed: 30 km/h)
 */
export function estimateDrivingMins(distanceKm: number): number {
  return Math.round((distanceKm / 30) * 60);
}

// POI type to Property field mapping
const POI_TYPE_TO_FIELD: Record<string, { distanceField: string; nameField: string }> = {
  BEACH: { distanceField: 'nearestBeachKm', nameField: 'nearestBeachName' },
  SHOPPING_MALL: { distanceField: 'nearestMallKm', nameField: 'nearestMallName' },
  HOSPITAL: { distanceField: 'nearestHospitalKm', nameField: 'nearestHospitalName' },
  INTERNATIONAL_SCHOOL: { distanceField: 'nearestSchoolKm', nameField: 'nearestSchoolName' },
  BTS_STATION: { distanceField: 'nearestBtsKm', nameField: 'nearestBtsName' },
  MRT_STATION: { distanceField: 'nearestBtsKm', nameField: 'nearestBtsName' }, // Share with BTS
  AIRPORT: { distanceField: 'nearestAirportKm', nameField: 'nearestAirportName' },
};

interface DistanceResult {
  poiId: string;
  poiType: string;
  poiName: string;
  distanceKm: number;
  walkingMins: number;
  drivingMins: number;
}

/**
 * Calculate distances from a property to all active POIs
 */
export async function calculatePropertyPOIDistances(
  propertyLat: number,
  propertyLng: number
): Promise<DistanceResult[]> {
  const pois = await prisma.pointOfInterest.findMany({
    where: { isActive: true }
  });

  return pois.map(poi => {
    const distanceKm = calculateDistanceKm(
      { lat: propertyLat, lng: propertyLng },
      { lat: Number(poi.latitude), lng: Number(poi.longitude) }
    );

    return {
      poiId: poi.id,
      poiType: poi.type,
      poiName: poi.name,
      distanceKm: Math.round(distanceKm * 1000) / 1000, // Round to 3 decimal places
      walkingMins: estimateWalkingMins(distanceKm),
      drivingMins: estimateDrivingMins(distanceKm)
    };
  });
}

/**
 * Update PropertyPOIDistance records and Property convenience fields
 * Call this when a property is created or updated with new coordinates
 */
export async function updatePropertyPOIDistances(
  propertyId: string,
  propertyLat: number,
  propertyLng: number
): Promise<{ distancesUpdated: number; propertyUpdated: boolean }> {
  // Calculate all distances
  const distances = await calculatePropertyPOIDistances(propertyLat, propertyLng);

  if (distances.length === 0) {
    return { distancesUpdated: 0, propertyUpdated: false };
  }

  // Upsert all PropertyPOIDistance records in a transaction
  await prisma.$transaction(
    distances.map(d =>
      prisma.propertyPOIDistance.upsert({
        where: {
          propertyId_poiId: {
            propertyId,
            poiId: d.poiId
          }
        },
        create: {
          propertyId,
          poiId: d.poiId,
          poiType: d.poiType as any,
          distanceKm: d.distanceKm,
          walkingMins: d.walkingMins,
          drivingMins: d.drivingMins
        },
        update: {
          distanceKm: d.distanceKm,
          walkingMins: d.walkingMins,
          drivingMins: d.drivingMins
        }
      })
    )
  );

  // Calculate nearest POI for each type (for Property convenience fields)
  const nearestByType: Record<string, DistanceResult> = {};
  
  for (const d of distances) {
    if (!nearestByType[d.poiType] || d.distanceKm < nearestByType[d.poiType].distanceKm) {
      nearestByType[d.poiType] = d;
    }
  }

  // Build update data for Property convenience fields
  const propertyUpdateData: Record<string, any> = {};

  for (const [poiType, mapping] of Object.entries(POI_TYPE_TO_FIELD)) {
    const nearest = nearestByType[poiType];
    if (nearest) {
      // Only update if this is closer than existing (for shared fields like BTS/MRT)
      const existingDistance = propertyUpdateData[mapping.distanceField];
      if (existingDistance === undefined || nearest.distanceKm < existingDistance) {
        propertyUpdateData[mapping.distanceField] = nearest.distanceKm;
        propertyUpdateData[mapping.nameField] = nearest.poiName;
      }
    }
  }

  // Update Property with nearest POI distances
  if (Object.keys(propertyUpdateData).length > 0) {
    await prisma.property.update({
      where: { id: propertyId },
      data: propertyUpdateData
    });
  }

  return {
    distancesUpdated: distances.length,
    propertyUpdated: Object.keys(propertyUpdateData).length > 0
  };
}

/**
 * Recalculate distances for all properties (batch operation)
 * Use this when POIs are added/updated or for initial data population
 */
export async function recalculateAllPropertyDistances(
  options?: { 
    batchSize?: number;
    onProgress?: (processed: number, total: number) => void;
  }
): Promise<{ processed: number; errors: string[] }> {
  const batchSize = options?.batchSize || 50;
  const errors: string[] = [];

  // Get all properties with coordinates
  const properties = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null }
    },
    select: {
      id: true,
      referenceId: true,
      latitude: true,
      longitude: true
    }
  });

  let processed = 0;

  for (let i = 0; i < properties.length; i += batchSize) {
    const batch = properties.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (property) => {
        try {
          await updatePropertyPOIDistances(
            property.id,
            Number(property.latitude),
            Number(property.longitude)
          );
        } catch (error) {
          errors.push(`Property ${property.referenceId}: ${error}`);
        }
      })
    );

    processed += batch.length;
    options?.onProgress?.(processed, properties.length);
  }

  return { processed, errors };
}

/**
 * Recalculate distances for all properties when a POI is added/updated
 */
export async function recalculateDistancesForPOI(poiId: string): Promise<{ updated: number }> {
  const poi = await prisma.pointOfInterest.findUnique({
    where: { id: poiId }
  });

  if (!poi || !poi.isActive) {
    return { updated: 0 };
  }

  // Get all properties with coordinates
  const properties = await prisma.property.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null }
    },
    select: {
      id: true,
      latitude: true,
      longitude: true
    }
  });

  // Calculate and upsert distances for this POI
  const updates = properties.map(property => {
    const distanceKm = calculateDistanceKm(
      { lat: Number(property.latitude), lng: Number(property.longitude) },
      { lat: Number(poi.latitude), lng: Number(poi.longitude) }
    );

    return prisma.propertyPOIDistance.upsert({
      where: {
        propertyId_poiId: {
          propertyId: property.id,
          poiId: poi.id
        }
      },
      create: {
        propertyId: property.id,
        poiId: poi.id,
        poiType: poi.type as any,
        distanceKm: Math.round(distanceKm * 1000) / 1000,
        walkingMins: estimateWalkingMins(distanceKm),
        drivingMins: estimateDrivingMins(distanceKm)
      },
      update: {
        distanceKm: Math.round(distanceKm * 1000) / 1000,
        walkingMins: estimateWalkingMins(distanceKm),
        drivingMins: estimateDrivingMins(distanceKm)
      }
    });
  });

  await prisma.$transaction(updates);

  return { updated: properties.length };
}

/**
 * Get nearby POIs for a property
 */
export async function getNearbyPOIs(
  propertyId: string,
  options?: {
    maxDistanceKm?: number;
    types?: string[];
    tier?: 'PRIMARY' | 'SECONDARY';
    limit?: number;
  }
): Promise<Array<{
  poi: { id: string; name: string; nameTh: string | null; type: string; tier: string };
  distanceKm: number;
  walkingMins: number | null;
  drivingMins: number | null;
}>> {
  const where: any = {
    propertyId
  };

  if (options?.maxDistanceKm) {
    where.distanceKm = { lte: options.maxDistanceKm };
  }

  if (options?.types && options.types.length > 0) {
    where.poiType = { in: options.types };
  }

  const distances = await prisma.propertyPOIDistance.findMany({
    where,
    include: {
      poi: {
        select: {
          id: true,
          name: true,
          nameTh: true,
          type: true,
          tier: true
        }
      }
    },
    orderBy: { distanceKm: 'asc' },
    take: options?.limit || 20
  });

  // Filter by tier if specified (need to filter after query since tier is on POI)
  let results = distances.map(d => ({
    poi: d.poi,
    distanceKm: Number(d.distanceKm),
    walkingMins: d.walkingMins,
    drivingMins: d.drivingMins
  }));

  if (options?.tier) {
    results = results.filter(r => r.poi.tier === options.tier);
  }

  return results;
}

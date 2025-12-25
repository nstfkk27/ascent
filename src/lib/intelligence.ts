import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from './prisma';

export type DealQuality = 'SUPER_DEAL' | 'GOOD_VALUE' | 'FAIR' | 'OVERPRICED' | 'HIGH_YIELD';

interface PropertyIntelligence {
  pricePerSqm: number | null;
  estimatedRentalYield: number | null;
  fairValueEstimate: number | null;
  priceDeviation: number | null;
  dealQuality: DealQuality | null;
  leadScore: number | null;
}

interface PropertyData {
  price: Decimal | number | null;
  rentPrice: Decimal | number | null;
  size: number;
  category: string;
  city: string;
  area: string | null;
  bedrooms: number | null;
  viewCount?: number;
  enquiryCount?: number;
  createdAt?: Date;
}

export async function calculatePropertyIntelligence(
  property: PropertyData
): Promise<PropertyIntelligence> {
  const price = property.price ? (typeof property.price === 'number' ? property.price : property.price.toNumber()) : null;
  const rentPrice = property.rentPrice ? (typeof property.rentPrice === 'number' ? property.rentPrice : property.rentPrice.toNumber()) : null;

  const pricePerSqm = calculatePricePerSqm(price, property.size);
  const estimatedRentalYield = calculateRentalYield(price, rentPrice);
  
  const fairValueEstimate = await calculateFairValue(property);
  const priceDeviation = calculatePriceDeviation(price, fairValueEstimate);
  const dealQuality = calculateDealQuality(priceDeviation, estimatedRentalYield);
  
  const leadScore = calculateLeadScore({
    viewCount: property.viewCount || 0,
    enquiryCount: property.enquiryCount || 0,
    createdAt: property.createdAt || new Date(),
    dealQuality,
  });

  return {
    pricePerSqm,
    estimatedRentalYield,
    fairValueEstimate,
    priceDeviation,
    dealQuality,
    leadScore,
  };
}

export function calculatePricePerSqm(price: number | null, size: number): number | null {
  if (!price || !size || size === 0) return null;
  return Math.round(price / size);
}

export function calculateRentalYield(price: number | null, rentPrice: number | null): number | null {
  if (!price || !rentPrice || price === 0) return null;
  const annualRent = rentPrice * 12;
  const yield_ = (annualRent / price) * 100;
  return Math.round(yield_ * 100) / 100;
}

export async function calculateFairValue(property: PropertyData): Promise<number | null> {
  try {
    const areaStats = await prisma.areaStats.findFirst({
      where: {
        city: property.city,
        area: property.area || undefined,
        category: property.category as any,
      },
    });

    if (!areaStats || !areaStats.avgPricePerSqm) {
      return null;
    }

    const avgPricePerSqm = areaStats.avgPricePerSqm.toNumber();
    const fairValue = avgPricePerSqm * property.size;

    return Math.round(fairValue);
  } catch (error) {
    console.error('Error calculating fair value:', error);
    return null;
  }
}

export function calculatePriceDeviation(
  price: number | null,
  fairValue: number | null
): number | null {
  if (!price || !fairValue || fairValue === 0) return null;
  
  const deviation = ((price - fairValue) / fairValue) * 100;
  return Math.round(deviation * 100) / 100;
}

export function calculateDealQuality(
  priceDeviation: number | null,
  rentalYield: number | null
): DealQuality | null {
  if (rentalYield && rentalYield > 6) {
    return 'HIGH_YIELD';
  }

  if (priceDeviation === null) return null;

  if (priceDeviation < -15) return 'SUPER_DEAL';
  if (priceDeviation < -5) return 'GOOD_VALUE';
  if (priceDeviation > 5) return 'OVERPRICED';
  return 'FAIR';
}

export function calculateLeadScore(params: {
  viewCount: number;
  enquiryCount: number;
  createdAt: Date;
  dealQuality: DealQuality | null;
}): number {
  let score = 0;

  score += Math.min(params.viewCount * 2, 30);
  score += Math.min(params.enquiryCount * 10, 40);

  const daysOnMarket = Math.floor(
    (Date.now() - params.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysOnMarket < 7) {
    score += 15;
  } else if (daysOnMarket < 30) {
    score += 10;
  } else if (daysOnMarket > 90) {
    score -= 10;
  }

  if (params.dealQuality === 'SUPER_DEAL') {
    score += 15;
  } else if (params.dealQuality === 'GOOD_VALUE' || params.dealQuality === 'HIGH_YIELD') {
    score += 10;
  } else if (params.dealQuality === 'OVERPRICED') {
    score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

export async function updatePropertyIntelligence(propertyId: string): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      price: true,
      rentPrice: true,
      size: true,
      category: true,
      city: true,
      area: true,
      bedrooms: true,
      viewCount: true,
      enquiryCount: true,
      createdAt: true,
    },
  });

  if (!property) {
    throw new Error(`Property ${propertyId} not found`);
  }

  const intelligence = await calculatePropertyIntelligence(property);

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      pricePerSqm: intelligence.pricePerSqm,
      estimatedRentalYield: intelligence.estimatedRentalYield,
      fairValueEstimate: intelligence.fairValueEstimate,
      priceDeviation: intelligence.priceDeviation,
      dealQuality: intelligence.dealQuality,
      leadScore: intelligence.leadScore,
      lastIntelligenceUpdate: new Date(),
    },
  });
}

export async function batchUpdateIntelligence(limit: number = 100): Promise<number> {
  const properties = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { lastIntelligenceUpdate: null },
        {
          lastIntelligenceUpdate: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    take: limit,
    select: {
      id: true,
    },
  });

  let updated = 0;
  for (const property of properties) {
    try {
      await updatePropertyIntelligence(property.id);
      updated++;
    } catch (error) {
      console.error(`Failed to update intelligence for property ${property.id}:`, error);
    }
  }

  return updated;
}

/**
 * Property Scoring Service
 * 
 * Calculates various scores for properties to enable AI-powered search and recommendations.
 * 
 * Scores (0-100):
 * - locationScore: Based on proximity to POIs (beach, mall, hospital, school)
 * - valueScore: Based on price vs market average (FAFV model)
 * - investmentScore: Based on rental yield and ROI potential
 * - overallScore: Weighted combination of all scores
 */

import { prisma } from './prisma';

// Score weights for overall calculation
const SCORE_WEIGHTS = {
  location: 0.30,
  value: 0.35,
  investment: 0.35,
};

// POI distance thresholds for location scoring (in km)
const LOCATION_THRESHOLDS = {
  beach: { excellent: 0.5, good: 1, fair: 2, max: 5 },
  mall: { excellent: 1, good: 2, fair: 5, max: 10 },
  hospital: { excellent: 2, good: 5, fair: 10, max: 20 },
  school: { excellent: 1, good: 2, fair: 5, max: 10 },
};

// Value score thresholds (% below market)
const VALUE_THRESHOLDS = {
  superDeal: -15,  // 15% below market = 100 score
  goodValue: -5,   // 5% below market = 75 score
  fairValue: 0,    // At market = 50 score
  overpriced: 10,  // 10% above market = 25 score
};

// Investment score thresholds (rental yield %)
const INVESTMENT_THRESHOLDS = {
  excellent: 8,    // 8%+ yield = 100 score
  good: 6,         // 6%+ yield = 75 score
  fair: 4,         // 4%+ yield = 50 score
  poor: 2,         // 2%+ yield = 25 score
};

interface PropertyData {
  id: string;
  category: string;
  price: number | null;
  rentPrice: number | null;
  size: number;
  floor?: number | null;
  nearestBeachKm: number | null;
  nearestMallKm: number | null;
  nearestHospitalKm: number | null;
  nearestSchoolKm: number | null;
  pricePerSqm: number | null;
  projectAvgPricePerSqm: number | null;
  areaAvgPricePerSqm: number | null;
  priceDeviation: number | null;
  estimatedRentalYield: number | null;
}

interface ScoreResult {
  locationScore: number;
  valueScore: number;
  investmentScore: number;
  overallScore: number;
  keyFeatures: string[];
  targetBuyer: string[];
  dealQuality: 'SUPER_DEAL' | 'GOOD_VALUE' | 'FAIR' | 'OVERPRICED' | 'HIGH_YIELD' | null;
}

/**
 * Calculate distance-based score (0-100)
 * Closer = higher score
 */
function calculateDistanceScore(
  distance: number | null,
  thresholds: { excellent: number; good: number; fair: number; max: number }
): number {
  if (distance === null || distance === undefined) return 0;
  
  if (distance <= thresholds.excellent) return 100;
  if (distance <= thresholds.good) {
    // Linear interpolation between excellent (100) and good (75)
    const ratio = (distance - thresholds.excellent) / (thresholds.good - thresholds.excellent);
    return Math.round(100 - (ratio * 25));
  }
  if (distance <= thresholds.fair) {
    // Linear interpolation between good (75) and fair (50)
    const ratio = (distance - thresholds.good) / (thresholds.fair - thresholds.good);
    return Math.round(75 - (ratio * 25));
  }
  if (distance <= thresholds.max) {
    // Linear interpolation between fair (50) and max (25)
    const ratio = (distance - thresholds.fair) / (thresholds.max - thresholds.fair);
    return Math.round(50 - (ratio * 25));
  }
  
  // Beyond max distance
  return Math.max(0, Math.round(25 - ((distance - thresholds.max) * 5)));
}

/**
 * Calculate Location Score (0-100)
 * Based on proximity to key POIs
 */
function calculateLocationScore(property: PropertyData): number {
  const scores: number[] = [];
  
  // Beach score (weighted higher for residential)
  const beachScore = calculateDistanceScore(property.nearestBeachKm, LOCATION_THRESHOLDS.beach);
  if (beachScore > 0) scores.push(beachScore * 1.2); // Beach is premium
  
  // Mall score
  const mallScore = calculateDistanceScore(property.nearestMallKm, LOCATION_THRESHOLDS.mall);
  if (mallScore > 0) scores.push(mallScore);
  
  // Hospital score
  const hospitalScore = calculateDistanceScore(property.nearestHospitalKm, LOCATION_THRESHOLDS.hospital);
  if (hospitalScore > 0) scores.push(hospitalScore * 0.8); // Slightly less weight
  
  // School score
  const schoolScore = calculateDistanceScore(property.nearestSchoolKm, LOCATION_THRESHOLDS.school);
  if (schoolScore > 0) scores.push(schoolScore * 0.9);
  
  if (scores.length === 0) return 50; // Default if no POI data
  
  // Average of available scores, capped at 100
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(100, Math.round(avgScore));
}

/**
 * Calculate Value Score (0-100)
 * Based on price vs market average using FAFV model
 */
function calculateValueScore(property: PropertyData): number {
  // Use price deviation if available (from FAFV calculation)
  if (property.priceDeviation !== null) {
    const deviation = property.priceDeviation;
    
    if (deviation <= VALUE_THRESHOLDS.superDeal) return 100;
    if (deviation <= VALUE_THRESHOLDS.goodValue) {
      const ratio = (deviation - VALUE_THRESHOLDS.superDeal) / (VALUE_THRESHOLDS.goodValue - VALUE_THRESHOLDS.superDeal);
      return Math.round(100 - (ratio * 25));
    }
    if (deviation <= VALUE_THRESHOLDS.fairValue) {
      const ratio = (deviation - VALUE_THRESHOLDS.goodValue) / (VALUE_THRESHOLDS.fairValue - VALUE_THRESHOLDS.goodValue);
      return Math.round(75 - (ratio * 25));
    }
    if (deviation <= VALUE_THRESHOLDS.overpriced) {
      const ratio = (deviation - VALUE_THRESHOLDS.fairValue) / (VALUE_THRESHOLDS.overpriced - VALUE_THRESHOLDS.fairValue);
      return Math.round(50 - (ratio * 25));
    }
    
    // More than 10% overpriced
    return Math.max(0, Math.round(25 - ((deviation - VALUE_THRESHOLDS.overpriced) * 2)));
  }
  
  // Fallback: Compare price per sqm to area average
  if (property.pricePerSqm && property.areaAvgPricePerSqm) {
    const deviation = ((property.pricePerSqm - property.areaAvgPricePerSqm) / property.areaAvgPricePerSqm) * 100;
    
    if (deviation <= -15) return 100;
    if (deviation <= -5) return 75;
    if (deviation <= 5) return 50;
    if (deviation <= 15) return 25;
    return 10;
  }
  
  return 50; // Default if no comparison data
}

/**
 * Calculate Investment Score (0-100)
 * Based on rental yield and ROI potential
 */
function calculateInvestmentScore(property: PropertyData): number {
  // Use estimated rental yield if available
  if (property.estimatedRentalYield !== null) {
    const yield_ = property.estimatedRentalYield;
    
    if (yield_ >= INVESTMENT_THRESHOLDS.excellent) return 100;
    if (yield_ >= INVESTMENT_THRESHOLDS.good) {
      const ratio = (yield_ - INVESTMENT_THRESHOLDS.good) / (INVESTMENT_THRESHOLDS.excellent - INVESTMENT_THRESHOLDS.good);
      return Math.round(75 + (ratio * 25));
    }
    if (yield_ >= INVESTMENT_THRESHOLDS.fair) {
      const ratio = (yield_ - INVESTMENT_THRESHOLDS.fair) / (INVESTMENT_THRESHOLDS.good - INVESTMENT_THRESHOLDS.fair);
      return Math.round(50 + (ratio * 25));
    }
    if (yield_ >= INVESTMENT_THRESHOLDS.poor) {
      const ratio = (yield_ - INVESTMENT_THRESHOLDS.poor) / (INVESTMENT_THRESHOLDS.fair - INVESTMENT_THRESHOLDS.poor);
      return Math.round(25 + (ratio * 25));
    }
    
    return Math.max(0, Math.round(yield_ * 12.5)); // Below 2% yield
  }
  
  // Calculate yield from rent price if available
  if (property.rentPrice && property.price && property.price > 0) {
    const annualRent = property.rentPrice * 12;
    const yield_ = (annualRent / property.price) * 100;
    
    if (yield_ >= 8) return 100;
    if (yield_ >= 6) return 75;
    if (yield_ >= 4) return 50;
    if (yield_ >= 2) return 25;
    return 10;
  }
  
  // For properties without rental data, use value score as proxy
  return 50; // Default
}

/**
 * Determine deal quality based on value score
 */
function determineDealQuality(valueScore: number, investmentScore: number): ScoreResult['dealQuality'] {
  const combinedScore = (valueScore * 0.6) + (investmentScore * 0.4);
  
  if (combinedScore >= 85) return 'SUPER_DEAL';
  if (combinedScore >= 70) return 'GOOD_VALUE';
  if (combinedScore >= 40) return 'FAIR';
  return 'OVERPRICED';
}

/**
 * Generate key features based on scores and data
 */
function generateKeyFeatures(property: PropertyData, scores: { location: number; value: number; investment: number }): string[] {
  const features: string[] = [];
  
  // Location features
  if (property.nearestBeachKm && property.nearestBeachKm <= 0.5) {
    features.push('Beachfront');
  } else if (property.nearestBeachKm && property.nearestBeachKm <= 1) {
    features.push('Near Beach');
  }
  
  if (property.nearestMallKm && property.nearestMallKm <= 1) {
    features.push('Near Shopping');
  }
  
  // Value features
  if (scores.value >= 85) {
    features.push('Below Market');
  } else if (scores.value >= 70) {
    features.push('Good Value');
  }
  
  // Investment features
  if (scores.investment >= 85) {
    features.push('High Yield');
  } else if (scores.investment >= 70) {
    features.push('Good ROI');
  }
  
  // Overall
  if (scores.location >= 80) {
    features.push('Prime Location');
  }
  
  return features.slice(0, 5); // Max 5 features
}

/**
 * Generate target buyer profiles based on property characteristics
 */
function generateTargetBuyer(property: PropertyData, scores: { location: number; value: number; investment: number }): string[] {
  const buyers: string[] = [];
  
  // Investment-focused
  if (scores.investment >= 70) {
    buyers.push('Investor');
  }
  
  // Location-focused (retirees love beach proximity)
  if (property.nearestBeachKm && property.nearestBeachKm <= 2 && property.nearestHospitalKm && property.nearestHospitalKm <= 5) {
    buyers.push('Retiree');
  }
  
  // Family-focused (near schools)
  if (property.nearestSchoolKm && property.nearestSchoolKm <= 2) {
    buyers.push('Family');
  }
  
  // Value seekers
  if (scores.value >= 75) {
    buyers.push('Value Seeker');
  }
  
  // First-time buyers (smaller, affordable)
  if (property.size && property.size <= 50 && property.category === 'CONDO') {
    buyers.push('First-Time Buyer');
  }
  
  return buyers.slice(0, 3); // Max 3 buyer types
}

/**
 * Calculate all scores for a property
 */
export function calculatePropertyScores(property: PropertyData): ScoreResult {
  const locationScore = calculateLocationScore(property);
  const valueScore = calculateValueScore(property);
  const investmentScore = calculateInvestmentScore(property);
  
  // Weighted overall score
  const overallScore = Math.round(
    (locationScore * SCORE_WEIGHTS.location) +
    (valueScore * SCORE_WEIGHTS.value) +
    (investmentScore * SCORE_WEIGHTS.investment)
  );
  
  const scores = { location: locationScore, value: valueScore, investment: investmentScore };
  
  return {
    locationScore,
    valueScore,
    investmentScore,
    overallScore,
    keyFeatures: generateKeyFeatures(property, scores),
    targetBuyer: generateTargetBuyer(property, scores),
    dealQuality: determineDealQuality(valueScore, investmentScore),
  };
}

/**
 * Update scores for a single property
 */
export async function updatePropertyScores(propertyId: string): Promise<ScoreResult | null> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      category: true,
      price: true,
      rentPrice: true,
      size: true,
      floor: true,
      nearestBeachKm: true,
      nearestMallKm: true,
      nearestHospitalKm: true,
      nearestSchoolKm: true,
      pricePerSqm: true,
      projectAvgPricePerSqm: true,
      areaAvgPricePerSqm: true,
      priceDeviation: true,
      estimatedRentalYield: true,
    },
  });
  
  if (!property) return null;
  
  // Convert Decimal to number
  const propertyData: PropertyData = {
    id: property.id,
    category: property.category,
    price: property.price ? Number(property.price) : null,
    rentPrice: property.rentPrice ? Number(property.rentPrice) : null,
    size: property.size,
    floor: property.floor,
    nearestBeachKm: property.nearestBeachKm ? Number(property.nearestBeachKm) : null,
    nearestMallKm: property.nearestMallKm ? Number(property.nearestMallKm) : null,
    nearestHospitalKm: property.nearestHospitalKm ? Number(property.nearestHospitalKm) : null,
    nearestSchoolKm: property.nearestSchoolKm ? Number(property.nearestSchoolKm) : null,
    pricePerSqm: property.pricePerSqm ? Number(property.pricePerSqm) : null,
    projectAvgPricePerSqm: property.projectAvgPricePerSqm ? Number(property.projectAvgPricePerSqm) : null,
    areaAvgPricePerSqm: property.areaAvgPricePerSqm ? Number(property.areaAvgPricePerSqm) : null,
    priceDeviation: property.priceDeviation ? Number(property.priceDeviation) : null,
    estimatedRentalYield: property.estimatedRentalYield ? Number(property.estimatedRentalYield) : null,
  };
  
  const scores = calculatePropertyScores(propertyData);
  
  // Update property with scores
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      locationScore: scores.locationScore,
      valueScore: scores.valueScore,
      investmentScore: scores.investmentScore,
      overallScore: scores.overallScore,
      keyFeatures: scores.keyFeatures,
      targetBuyer: scores.targetBuyer,
      dealQuality: scores.dealQuality,
      lastIntelligenceUpdate: new Date(),
    },
  });
  
  return scores;
}

/**
 * Recalculate scores for all properties
 */
export async function recalculateAllPropertyScores(): Promise<{ updated: number; errors: number }> {
  const properties = await prisma.property.findMany({
    select: { id: true },
  });
  
  let updated = 0;
  let errors = 0;
  
  for (const property of properties) {
    try {
      await updatePropertyScores(property.id);
      updated++;
    } catch (error) {
      console.error(`Error updating scores for property ${property.id}:`, error);
      errors++;
    }
  }
  
  return { updated, errors };
}

/**
 * Calculate and update market comparison data for a property
 * This should be called before scoring to ensure priceDeviation is available
 */
export async function updateMarketComparison(propertyId: string): Promise<void> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      price: true,
      rentPrice: true,
      size: true,
      floor: true,
      area: true,
      city: true,
      category: true,
      projectId: true,
    },
  });
  
  if (!property || !property.price || !property.size) return;
  
  const price = Number(property.price);
  const pricePerSqm = price / property.size;
  
  // Calculate area average price per sqm
  const areaProperties = await prisma.property.findMany({
    where: {
      area: property.area,
      city: property.city,
      category: property.category,
      price: { not: null },
      size: { gt: 0 },
      id: { not: property.id },
    },
    select: {
      price: true,
      size: true,
    },
  });
  
  let areaAvgPricePerSqm: number | null = null;
  if (areaProperties.length > 0) {
    const totalPricePerSqm = areaProperties.reduce((sum: number, p: { price: any; size: number }) => {
      return sum + (Number(p.price) / p.size);
    }, 0);
    areaAvgPricePerSqm = totalPricePerSqm / areaProperties.length;
  }
  
  // Calculate project average if property belongs to a project
  let projectAvgPricePerSqm: number | null = null;
  if (property.projectId) {
    const projectProperties = await prisma.property.findMany({
      where: {
        projectId: property.projectId,
        price: { not: null },
        size: { gt: 0 },
        id: { not: property.id },
      },
      select: {
        price: true,
        size: true,
        floor: true,
      },
    });
    
    if (projectProperties.length > 0) {
      const totalPricePerSqm = projectProperties.reduce((sum: number, p: { price: any; size: number }) => {
        return sum + (Number(p.price) / p.size);
      }, 0);
      projectAvgPricePerSqm = totalPricePerSqm / projectProperties.length;
    }
  }
  
  // Calculate price deviation using FAFV model
  let priceDeviation: number | null = null;
  let fairValueEstimate: number | null = null;
  
  const baselineAvg = projectAvgPricePerSqm || areaAvgPricePerSqm;
  if (baselineAvg) {
    // Floor adjustment: +0.5% per floor above average (for condos)
    let floorAdjustment = 1;
    if (property.category === 'CONDO' && property.floor) {
      const avgFloor = 10; // Assume average floor is 10
      const floorsAboveAvg = property.floor - avgFloor;
      floorAdjustment = 1 + (floorsAboveAvg * 0.005); // 0.5% per floor
    }
    
    fairValueEstimate = baselineAvg * property.size * floorAdjustment;
    priceDeviation = ((price - fairValueEstimate) / fairValueEstimate) * 100;
  }
  
  // Calculate estimated rental yield
  let estimatedRentalYield: number | null = null;
  if (property.rentPrice && price > 0) {
    const annualRent = Number(property.rentPrice) * 12;
    estimatedRentalYield = (annualRent / price) * 100;
  }
  
  // Update property with market comparison data
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      pricePerSqm,
      areaAvgPricePerSqm,
      projectAvgPricePerSqm,
      priceDeviation,
      fairValueEstimate,
      estimatedRentalYield,
      priceVsAreaAvg: areaAvgPricePerSqm ? ((pricePerSqm - areaAvgPricePerSqm) / areaAvgPricePerSqm) * 100 : null,
      priceVsProjectAvg: projectAvgPricePerSqm ? ((pricePerSqm - projectAvgPricePerSqm) / projectAvgPricePerSqm) * 100 : null,
    },
  });
}

/**
 * Full intelligence update: market comparison + scores
 */
export async function updatePropertyIntelligence(propertyId: string): Promise<ScoreResult | null> {
  await updateMarketComparison(propertyId);
  return await updatePropertyScores(propertyId);
}

/**
 * Batch update intelligence for all properties
 */
export async function updateAllPropertyIntelligence(): Promise<{ updated: number; errors: number }> {
  const properties = await prisma.property.findMany({
    select: { id: true },
  });
  
  let updated = 0;
  let errors = 0;
  
  for (const property of properties) {
    try {
      await updatePropertyIntelligence(property.id);
      updated++;
    } catch (error) {
      console.error(`Error updating intelligence for property ${property.id}:`, error);
      errors++;
    }
  }
  
  return { updated, errors };
}

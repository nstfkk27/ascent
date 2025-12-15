import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AlertCircle } from 'lucide-react';
import MarketIntelligenceDashboard from '@/components/agent/MarketIntelligenceDashboard';

export const dynamic = 'force-dynamic';

// ============================================
// TOOL 1: PRICE HUNTER (Floor-Adjusted Fair Value)
// ============================================
async function getPriceHunterData() {
  const projects = await prisma.project.findMany({
    include: {
      units: {
        where: {
          status: 'AVAILABLE',
          listingType: { in: ['SALE', 'BOTH'] },
          price: { not: null },
          size: { gt: 0 }
        }
      }
    }
  });

  const opportunities = [];
  const FLOOR_PREMIUM_PCT = 0.005;
  
  for (const project of projects) {
    if (project.units.length < 2) continue;

    let totalPsm = 0;
    let totalFloors = 0;
    let validFloorCount = 0;

    project.units.forEach(unit => {
      const price = Number(unit.price);
      const size = unit.size;
      totalPsm += (price / size);
      
      if (unit.floor) {
        totalFloors += unit.floor;
        validFloorCount++;
      }
    });
    
    const avgPsm = totalPsm / project.units.length;
    const avgFloor = validFloorCount > 0 ? totalFloors / validFloorCount : 0;

    for (const unit of project.units) {
      const askingPrice = Number(unit.price);
      const size = unit.size;
      const actualPsm = askingPrice / size;
      const unitFloor = unit.floor || avgFloor;

      const floorDiff = unitFloor - avgFloor;
      const floorAdjustment = floorDiff * FLOOR_PREMIUM_PCT;
      const fairPsm = avgPsm * (1 + floorAdjustment);
      const fairValue = fairPsm * size;

      const deviation = ((askingPrice - fairValue) / fairValue) * 100;

      let rentalYield = null;
      if (unit.rentPrice) {
        rentalYield = ((Number(unit.rentPrice) * 12) / askingPrice) * 100;
      }

      if (deviation < -5 || (rentalYield && rentalYield > 6)) {
        opportunities.push({
          unit: {
            ...unit,
            price: unit.price ? Number(unit.price) : null,
            rentPrice: unit.rentPrice ? Number(unit.rentPrice) : null,
            createdAt: unit.createdAt.toISOString(),
            updatedAt: unit.updatedAt.toISOString(),
            lastVerifiedAt: unit.lastVerifiedAt.toISOString(),
          },
          project: {
            ...project,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
          },
          metrics: {
            askingPrice,
            fairValue,
            actualPsm,
            fairPsm,
            deviation,
            floorDiff,
            rentalYield,
            savings: fairValue - askingPrice
          }
        });
      }
    }
  }

  return opportunities.sort((a, b) => a.metrics.deviation - b.metrics.deviation);
}

// ============================================
// TOOL 2: DAYS ON MARKET (DOM) ANALYSIS
// ============================================
async function getDaysOnMarketData() {
  const units = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE',
      price: { not: null }
    },
    include: {
      project: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const now = new Date();
  
  const staleListings = units.map(unit => {
    const createdAt = new Date(unit.createdAt);
    const daysOnMarket = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'fresh' | 'normal' | 'stale' | 'very_stale';
    let negotiationPotential: number;
    
    if (daysOnMarket < 14) {
      status = 'fresh';
      negotiationPotential = 0;
    } else if (daysOnMarket < 60) {
      status = 'normal';
      negotiationPotential = 5;
    } else if (daysOnMarket < 90) {
      status = 'stale';
      negotiationPotential = 10;
    } else {
      status = 'very_stale';
      negotiationPotential = 15;
    }

    return {
      unit: {
        ...unit,
        price: unit.price ? Number(unit.price) : null,
        rentPrice: unit.rentPrice ? Number(unit.rentPrice) : null,
        createdAt: unit.createdAt.toISOString(),
        updatedAt: unit.updatedAt.toISOString(),
        lastVerifiedAt: unit.lastVerifiedAt.toISOString(),
      },
      project: unit.project ? {
        ...unit.project,
        createdAt: unit.project.createdAt.toISOString(),
        updatedAt: unit.project.updatedAt.toISOString(),
      } : null,
      metrics: {
        daysOnMarket,
        status,
        negotiationPotential,
        listedDate: unit.createdAt.toISOString()
      }
    };
  }).filter(item => item.metrics.daysOnMarket >= 60); // Only show stale+ listings

  return staleListings.sort((a, b) => b.metrics.daysOnMarket - a.metrics.daysOnMarket);
}

// ============================================
// TOOL 3: RENTAL YIELD HEATMAP
// ============================================
async function getRentalYieldData() {
  const projects = await prisma.project.findMany({
    include: {
      units: {
        where: {
          status: 'AVAILABLE',
          price: { not: null },
          rentPrice: { not: null },
          size: { gt: 0 }
        }
      }
    }
  });

  const projectYields = projects
    .filter(p => p.units.length > 0)
    .map(project => {
      let totalYield = 0;
      let totalPsm = 0;
      let minYield = Infinity;
      let maxYield = 0;

      project.units.forEach(unit => {
        const price = Number(unit.price);
        const rentPrice = Number(unit.rentPrice);
        const annualRent = rentPrice * 12;
        const yieldPct = (annualRent / price) * 100;
        const psm = price / unit.size;

        totalYield += yieldPct;
        totalPsm += psm;
        if (yieldPct < minYield) minYield = yieldPct;
        if (yieldPct > maxYield) maxYield = yieldPct;
      });

      const avgYield = totalYield / project.units.length;
      const avgPsm = totalPsm / project.units.length;

      return {
        project: {
          id: project.id,
          name: project.name,
          city: project.city,
          type: project.type,
        },
        metrics: {
          avgYield,
          minYield: minYield === Infinity ? 0 : minYield,
          maxYield,
          avgPsm,
          unitCount: project.units.length,
          yieldRating: (avgYield >= 7 ? 'excellent' : avgYield >= 5.5 ? 'good' : avgYield >= 4 ? 'average' : 'below_average') as 'excellent' | 'good' | 'average' | 'below_average'
        }
      };
    })
    .sort((a, b) => b.metrics.avgYield - a.metrics.avgYield);

  // Area aggregation
  const areaMap = new Map<string, { totalYield: number; count: number; projects: string[] }>();
  
  projectYields.forEach(({ project, metrics }) => {
    const area = project.city || 'Unknown';
    const existing = areaMap.get(area) || { totalYield: 0, count: 0, projects: [] };
    existing.totalYield += metrics.avgYield;
    existing.count += 1;
    existing.projects.push(project.name);
    areaMap.set(area, existing);
  });

  const areaYields = Array.from(areaMap.entries()).map(([area, data]) => ({
    area,
    avgYield: data.totalYield / data.count,
    projectCount: data.count,
    projects: data.projects
  })).sort((a, b) => b.avgYield - a.avgYield);

  return { projectYields, areaYields };
}

export default async function MarketIntelligencePage() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.agentProfile.findFirst({
    where: { email: user.email! }
  });

  // For now SUPER_ADMIN only, future: subscription check
  if (profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>This premium tool is reserved for Super Admins only.</p>
        <p className="text-sm mt-2 text-gray-500">Future: Unlock with Pro subscription</p>
      </div>
    );
  }

  // Fetch all intelligence data
  const [priceHunterData, daysOnMarketData, rentalYieldData] = await Promise.all([
    getPriceHunterData(),
    getDaysOnMarketData(),
    getRentalYieldData()
  ]);

  return (
    <MarketIntelligenceDashboard 
      priceHunterData={priceHunterData}
      daysOnMarketData={daysOnMarketData}
      rentalYieldData={rentalYieldData}
    />
  );
}

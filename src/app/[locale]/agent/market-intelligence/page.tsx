import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { AlertCircle } from 'lucide-react';
import MarketIntelligence from '@/components/agent/MarketIntelligence';

export const dynamic = 'force-dynamic';

async function getMarketData() {
  // Fetch all projects with their available sale units
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

  // CONFIGURATION
  // Standard Real Estate Heuristic: 0.5% premium per floor level
  const FLOOR_PREMIUM_PCT = 0.005; // 0.5%
  
  for (const project of projects) {
    if (project.units.length < 2) continue; // Need at least 2 units to compare

    // 1. Calculate Project Baselines
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

    // 2. Analyze each unit
    for (const unit of project.units) {
      const askingPrice = Number(unit.price);
      const size = unit.size;
      const actualPsm = askingPrice / size;
      const unitFloor = unit.floor || avgFloor; // Fallback to avg if floor is missing

      // Calculate "Fair Value" PSM adjusted for floor height
      // Formula: FairPSM = AvgPSM * (1 + (UnitFloor - AvgFloor) * PremiumPerFloor)
      const floorDiff = unitFloor - avgFloor;
      const floorAdjustment = floorDiff * FLOOR_PREMIUM_PCT;
      const fairPsm = avgPsm * (1 + floorAdjustment);
      const fairValue = fairPsm * size;

      // Deviation: How much CHEAPER is the Asking Price compared to Fair Value?
      // Negative deviation means it's CHEAPER (Undervalued)
      const deviation = ((askingPrice - fairValue) / fairValue) * 100;

      // Rental Yield (if rent price exists)
      let rentalYield = null;
      if (unit.rentPrice) {
        rentalYield = ((Number(unit.rentPrice) * 12) / askingPrice) * 100;
      }

      // Filter logic: Show undervalued properties (> 5% below fair value)
      // OR properties with exceptional rental yield (> 6%)
      if (deviation < -5 || (rentalYield && rentalYield > 6)) {
        opportunities.push({
          unit,
          project,
          metrics: {
            askingPrice,
            fairValue,
            actualPsm,
            fairPsm,
            deviation, // % Under/Over valued
            floorDiff,
            rentalYield,
            savings: fairValue - askingPrice
          }
        });
      }
    }
  }

  // Sort by 'Best Value' (Lowest negative deviation)
  return opportunities.sort((a, b) => a.metrics.deviation - b.metrics.deviation);
}

export default async function MarketIntelligencePage() {
  const supabase = createClient();
  
  // Verify User Role
  // Note: Middleware protects /agent, but we need to check specifically for SUPER_ADMIN here
  // or relying on the layout to hide it is not enough security, but for now we do a quick check via API or DB if needed.
  // Ideally we fetch the profile. For this PoC, we assume if you can see the link you might have access, 
  // but let's do a quick DB check if possible.
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.agentProfile.findFirst({
    where: { email: user.email! }
  });

  if (profile?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>This premium tool is reserved for Super Admins only.</p>
      </div>
    );
  }

  const opportunities = await getMarketData();

  return <MarketIntelligence opportunities={opportunities} />;
}

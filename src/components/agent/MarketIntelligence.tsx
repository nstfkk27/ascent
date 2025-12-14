import Link from 'next/link';
import { TrendingDown, Info, Building2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Project, Property } from '@prisma/client';

export type MarketOpportunity = {
  unit: Property;
  project: Project;
  metrics: {
    askingPrice: number;
    fairValue: number;
    actualPsm: number;
    fairPsm: number;
    deviation: number;
    floorDiff: number;
    rentalYield: number | null;
    savings: number;
  };
};

interface MarketIntelligenceProps {
  opportunities: MarketOpportunity[];
}

export default function MarketIntelligence({ opportunities }: MarketIntelligenceProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-emerald-600" />
          Market Intelligence
          <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 font-medium">AI Analysis</span>
        </h1>
        <p className="text-slate-600 mt-3 max-w-2xl text-lg">
          Identifying undervalued assets using <strong>Floor-Adjusted Fair Value</strong> modeling.
        </p>
      </header>

      {/* Methodology Explainer */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-10">
        <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
          <Info className="w-5 h-5" />
          How we calculate "True Value"
        </h3>
        <div className="grid md:grid-cols-3 gap-8 text-sm text-blue-800/80">
          <div>
            <strong className="block text-blue-900 mb-1">1. Project Baseline</strong>
            We calculate the average Price/Sqm across the entire project to establish a baseline market rate.
          </div>
          <div>
            <strong className="block text-blue-900 mb-1">2. Floor Premium Adjustment</strong>
            We adjust the baseline for every unit. Higher floors get a <span className="font-mono bg-blue-100 px-1 rounded">0.5%</span> premium per floor. Lower floors are discounted. This creates a specific "Fair Price" for <i>that exact unit</i>.
          </div>
          <div>
            <strong className="block text-blue-900 mb-1">3. The Discrepancy</strong>
            We compare the <span className="font-bold text-emerald-700">Fair Price</span> vs. <span className="font-bold text-red-700">Asking Price</span>. Large negative gaps indicate undervalued "Steal" deals.
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {opportunities.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm text-center border border-slate-200">
            <Building2 className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Market Efficiency High</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              No significant pricing anomalies detected. All active listings are priced within 5% of their estimated fair value.
            </p>
          </div>
        ) : (
          opportunities.map(({ unit, project, metrics }) => (
            <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
              <div className="flex flex-col lg:flex-row">
                
                {/* Left: Unit Identity */}
                <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm
                        ${metrics.deviation < -15 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}
                      `}>
                        {metrics.deviation < -15 ? '🔥 Super Deal' : '✅ Good Value'}
                      </span>
                      {metrics.rentalYield && (
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ml-2 ${
                          metrics.rentalYield > 6 
                            ? 'bg-purple-100 text-purple-700 border-purple-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {metrics.rentalYield > 6 ? '💰 High Yield' : 'Yield'} {metrics.rentalYield.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    
                    <Link href={`/agent/project-manager/${project.id}`} className="block text-sm font-semibold text-slate-500 hover:text-blue-600 mb-1">
                      {project.name}
                    </Link>
                    <Link href={`/properties/${unit.id}`} className="block text-xl font-bold text-slate-900 hover:text-blue-600 leading-tight">
                      {unit.title}
                    </Link>
                  </div>

                  <div className="mt-6 flex items-center gap-6 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">{unit.bedrooms} Bed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">{unit.size} sqm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white p-1.5 rounded border border-slate-200 shadow-sm">Floor {unit.floor || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: The Math */}
                <div className="p-6 lg:w-2/3 grid md:grid-cols-3 gap-6 items-center">
                  
                  {/* Column 1: Asking Price */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Asking Price</div>
                    <div className="text-2xl font-bold text-slate-900">
                      ฿{(metrics.askingPrice / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-sm font-mono text-slate-500 mt-1">
                      ฿{Math.round(metrics.actualPsm).toLocaleString()}/sqm
                    </div>
                  </div>

                  {/* Column 2: Fair Value (The AI Estimate) */}
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-px bg-slate-100 hidden md:block"></div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      Fair Value
                      <Info className="w-3 h-3 text-slate-300" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      ฿{(metrics.fairValue / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-sm font-mono text-slate-500 mt-1">
                      Est. ฿{Math.round(metrics.fairPsm).toLocaleString()}/sqm
                    </div>
                    {metrics.floorDiff !== 0 && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
                        {metrics.floorDiff > 0 ? `+${metrics.floorDiff} Floors Premium` : `${metrics.floorDiff} Floors Discount`}
                      </div>
                    )}
                  </div>

                  {/* Column 3: The Verdict (Savings) */}
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100 text-right">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Instant Equity</div>
                    <div className="text-xl font-bold text-emerald-600 flex items-center justify-end gap-1">
                      {metrics.deviation < 0 ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      )}
                      {Math.abs(metrics.deviation).toFixed(1)}%
                    </div>
                    <div className="text-sm font-bold text-emerald-700 mt-1">
                      Save ฿{(metrics.savings / 1000000).toFixed(2)}M
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

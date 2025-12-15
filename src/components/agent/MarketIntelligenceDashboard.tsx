'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingDown, 
  Clock, 
  PieChart, 
  Info, 
  Building2, 
  ArrowDownRight, 
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Flame,
  Target
} from 'lucide-react';

// Types
export type PriceHunterOpportunity = {
  unit: any;
  project: any;
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

export type DOMOpportunity = {
  unit: any;
  project: any | null;
  metrics: {
    daysOnMarket: number;
    status: 'fresh' | 'normal' | 'stale' | 'very_stale';
    negotiationPotential: number;
    listedDate: string;
  };
};

export type ProjectYield = {
  project: {
    id: string;
    name: string;
    city: string;
    type: string;
  };
  metrics: {
    avgYield: number;
    minYield: number;
    maxYield: number;
    avgPsm: number;
    unitCount: number;
    yieldRating: 'excellent' | 'good' | 'average' | 'below_average';
  };
};

export type AreaYield = {
  area: string;
  avgYield: number;
  projectCount: number;
  projects: string[];
};

interface MarketIntelligenceDashboardProps {
  priceHunterData: PriceHunterOpportunity[];
  daysOnMarketData: DOMOpportunity[];
  rentalYieldData: {
    projectYields: ProjectYield[];
    areaYields: AreaYield[];
  };
}

type TabType = 'price-hunter' | 'days-on-market' | 'rental-yield';

export default function MarketIntelligenceDashboard({ 
  priceHunterData, 
  daysOnMarketData, 
  rentalYieldData 
}: MarketIntelligenceDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('price-hunter');

  const tabs = [
    { id: 'price-hunter' as TabType, label: 'Price Hunter', icon: Target, count: priceHunterData.length },
    { id: 'days-on-market' as TabType, label: 'Stale Listings', icon: Clock, count: daysOnMarketData.length },
    { id: 'rental-yield' as TabType, label: 'Yield Heatmap', icon: PieChart, count: rentalYieldData.projectYields.length },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-emerald-600" />
          Market Intelligence
          <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 font-medium">
            Premium Tools
          </span>
        </h1>
        <p className="text-slate-600 mt-2">
          Your unfair advantage in the Pattaya real estate market.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-slate-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'price-hunter' && (
        <PriceHunterTab data={priceHunterData} />
      )}
      {activeTab === 'days-on-market' && (
        <DaysOnMarketTab data={daysOnMarketData} />
      )}
      {activeTab === 'rental-yield' && (
        <RentalYieldTab data={rentalYieldData} />
      )}
    </div>
  );
}

// ============================================
// TOOL 1: PRICE HUNTER TAB
// ============================================
function PriceHunterTab({ data }: { data: PriceHunterOpportunity[] }) {
  return (
    <div>
      {/* Methodology */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
        <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-3">
          <Info className="w-5 h-5" />
          Floor-Adjusted Fair Value Model
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800/80">
          <div>
            <strong className="block text-blue-900 mb-1">1. Project Baseline</strong>
            Average Price/Sqm across all units in the project.
          </div>
          <div>
            <strong className="block text-blue-900 mb-1">2. Floor Premium</strong>
            +0.5% per floor above average, -0.5% below.
          </div>
          <div>
            <strong className="block text-blue-900 mb-1">3. Find Deals</strong>
            Units priced &gt;5% below fair value = opportunity.
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <EmptyState message="No undervalued properties found. Market is efficiently priced." />
        ) : (
          data.map(({ unit, project, metrics }) => (
            <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row">
                {/* Left: Unit Info */}
                <div className="p-5 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${
                      metrics.deviation < -15 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {metrics.deviation < -15 ? '🔥 Super Deal' : '✅ Good Value'}
                    </span>
                    {metrics.rentalYield && metrics.rentalYield > 6 && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        💰 {metrics.rentalYield.toFixed(1)}% Yield
                      </span>
                    )}
                  </div>
                  
                  <Link href={`/agent/project-manager/${project.id}`} className="text-sm font-medium text-slate-500 hover:text-blue-600">
                    {project.name}
                  </Link>
                  <Link href={`/properties/${unit.id}`} className="block text-lg font-bold text-slate-900 hover:text-blue-600 mt-1">
                    {unit.title}
                  </Link>

                  <div className="mt-4 flex gap-4 text-sm text-slate-600">
                    <span className="bg-white px-2 py-1 rounded border">{unit.bedrooms} Bed</span>
                    <span className="bg-white px-2 py-1 rounded border">{unit.size} sqm</span>
                    <span className="bg-white px-2 py-1 rounded border">Floor {unit.floor || '-'}</span>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="p-5 lg:w-2/3 grid md:grid-cols-3 gap-4 items-center">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Asking Price</div>
                    <div className="text-xl font-bold text-slate-900">฿{(metrics.askingPrice / 1000000).toFixed(2)}M</div>
                    <div className="text-sm text-slate-500">฿{Math.round(metrics.actualPsm).toLocaleString()}/sqm</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Fair Value</div>
                    <div className="text-xl font-bold text-emerald-700">฿{(metrics.fairValue / 1000000).toFixed(2)}M</div>
                    <div className="text-sm text-slate-500">฿{Math.round(metrics.fairPsm).toLocaleString()}/sqm</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-right border border-emerald-100">
                    <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Instant Equity</div>
                    <div className="text-lg font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <ArrowDownRight className="w-4 h-4" />
                      {Math.abs(metrics.deviation).toFixed(1)}%
                    </div>
                    <div className="text-sm font-bold text-emerald-700">Save ฿{(metrics.savings / 1000000).toFixed(2)}M</div>
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

// ============================================
// TOOL 2: DAYS ON MARKET TAB
// ============================================
function DaysOnMarketTab({ data }: { data: DOMOpportunity[] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'stale':
        return { label: '🔥 Stale', color: 'bg-orange-500 text-white', hint: 'Negotiation Window' };
      case 'very_stale':
        return { label: '💀 Very Stale', color: 'bg-red-500 text-white', hint: 'Desperate Seller Alert' };
      default:
        return { label: 'Normal', color: 'bg-slate-200 text-slate-700', hint: '' };
    }
  };

  return (
    <div>
      {/* Methodology */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 mb-6">
        <h3 className="text-orange-900 font-bold flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5" />
          Stale Listing Detection
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm text-orange-800/80">
          <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl mb-1">🏷️</div>
            <strong className="block text-orange-900">&lt; 14 days</strong>
            <span className="text-xs">Fresh - No leverage</span>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
            <div className="text-2xl mb-1">⏰</div>
            <strong className="block text-orange-900">14-60 days</strong>
            <span className="text-xs">Normal - 5% off possible</span>
          </div>
          <div className="text-center p-3 bg-orange-100 rounded-lg border border-orange-300">
            <div className="text-2xl mb-1">🔥</div>
            <strong className="block text-orange-900">60-90 days</strong>
            <span className="text-xs">Stale - 10% off likely</span>
          </div>
          <div className="text-center p-3 bg-red-100 rounded-lg border border-red-300">
            <div className="text-2xl mb-1">💀</div>
            <strong className="block text-red-900">90+ days</strong>
            <span className="text-xs">Very Stale - 15%+ off</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {data.length === 0 ? (
          <EmptyState message="No stale listings found. All properties are fresh!" />
        ) : (
          data.map(({ unit, project, metrics }) => {
            const statusConfig = getStatusConfig(metrics.status);
            return (
              <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-slate-500">{statusConfig.hint}</span>
                    </div>
                    {project && (
                      <Link href={`/agent/project-manager/${project.id}`} className="text-sm text-slate-500 hover:text-blue-600">
                        {project.name}
                      </Link>
                    )}
                    <Link href={`/properties/${unit.id}`} className="block text-lg font-bold text-slate-900 hover:text-blue-600">
                      {unit.title}
                    </Link>
                    <div className="mt-2 flex gap-3 text-sm text-slate-600">
                      {unit.bedrooms && <span>{unit.bedrooms} Bed</span>}
                      {unit.size && <span>{unit.size} sqm</span>}
                      {unit.price && <span className="font-medium">฿{(unit.price / 1000000).toFixed(2)}M</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-slate-900">{metrics.daysOnMarket}</div>
                      <div className="text-xs text-slate-500 uppercase">Days Listed</div>
                    </div>
                    <div className="text-center bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-600">-{metrics.negotiationPotential}%</div>
                      <div className="text-xs text-emerald-700 uppercase">Negotiation</div>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-500">
                        {new Date(metrics.listedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================
// TOOL 3: RENTAL YIELD TAB
// ============================================
function RentalYieldTab({ data }: { data: { projectYields: ProjectYield[]; areaYields: AreaYield[] } }) {
  const [view, setView] = useState<'projects' | 'areas'>('projects');

  const getYieldColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-emerald-500 text-white';
      case 'good': return 'bg-blue-500 text-white';
      case 'average': return 'bg-amber-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getYieldLabel = (rating: string) => {
    switch (rating) {
      case 'excellent': return '🏆 Excellent';
      case 'good': return '✅ Good';
      case 'average': return '⚡ Average';
      default: return '⚠️ Below Avg';
    }
  };

  return (
    <div>
      {/* Methodology */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 mb-6">
        <h3 className="text-purple-900 font-bold flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5" />
          Rental Yield Analysis
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-emerald-100 rounded-lg border border-emerald-200">
            <div className="text-lg font-bold text-emerald-700">≥7%</div>
            <span className="text-xs text-emerald-800">🏆 Excellent</span>
          </div>
          <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-700">5.5-7%</div>
            <span className="text-xs text-blue-800">✅ Good</span>
          </div>
          <div className="text-center p-3 bg-amber-100 rounded-lg border border-amber-200">
            <div className="text-lg font-bold text-amber-700">4-5.5%</div>
            <span className="text-xs text-amber-800">⚡ Average</span>
          </div>
          <div className="text-center p-3 bg-slate-100 rounded-lg border border-slate-200">
            <div className="text-lg font-bold text-slate-700">&lt;4%</div>
            <span className="text-xs text-slate-600">⚠️ Below Avg</span>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('projects')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            view === 'projects' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          By Project
        </button>
        <button
          onClick={() => setView('areas')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            view === 'areas' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          By Area
        </button>
      </div>

      {/* Project View */}
      {view === 'projects' && (
        <div className="space-y-3">
          {data.projectYields.length === 0 ? (
            <EmptyState message="No rental yield data available. Add rent prices to listings." />
          ) : (
            data.projectYields.map(({ project, metrics }) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getYieldColor(metrics.yieldRating)}`}>
                        {getYieldLabel(metrics.yieldRating)}
                      </span>
                      <span className="text-xs text-slate-500">{metrics.unitCount} units analyzed</span>
                    </div>
                    <Link href={`/agent/project-manager/${project.id}`} className="block text-lg font-bold text-slate-900 hover:text-blue-600">
                      {project.name}
                    </Link>
                    <div className="text-sm text-slate-500">{project.city}</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{metrics.avgYield.toFixed(1)}%</div>
                      <div className="text-xs text-slate-500 uppercase">Avg Yield</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-slate-700">{metrics.minYield.toFixed(1)}% - {metrics.maxYield.toFixed(1)}%</div>
                      <div className="text-xs text-slate-500 uppercase">Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-slate-700">฿{Math.round(metrics.avgPsm).toLocaleString()}</div>
                      <div className="text-xs text-slate-500 uppercase">Avg PSM</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Area View */}
      {view === 'areas' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.areaYields.length === 0 ? (
            <EmptyState message="No area data available." />
          ) : (
            data.areaYields.map((area) => (
              <div key={area.area} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">{area.area}</h3>
                  <span className="text-2xl font-bold text-purple-600">{area.avgYield.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-slate-500 mb-2">{area.projectCount} projects</div>
                <div className="text-xs text-slate-400">
                  {area.projects.slice(0, 3).join(', ')}
                  {area.projects.length > 3 && ` +${area.projects.length - 3} more`}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-200">
      <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-700 mb-2">No Data</h3>
      <p className="text-slate-500">{message}</p>
    </div>
  );
}


import React from 'react';
import { Database, Home, Building2, Briefcase, Map, GitBranch, Key, Table, List, Info, CheckCircle2 } from 'lucide-react';

export default function SchemaMap() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">AscentWeb Database Schema Map</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Visualizing the structure of the Property table and how different categories (House, Condo, Investment) 
            branch out with their specific fields and types.
          </p>
        </header>

        <div className="relative">
          {/* Main Root Node */}
          <div className="flex justify-center mb-16 relative z-10">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-xl border-4 border-slate-700 w-96 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <Database className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Property Table</h2>
              <div className="text-sm text-slate-400 font-mono bg-slate-800 rounded p-2 mb-3">
                model Property
              </div>
              <p className="text-slate-300 text-sm">
                The central table storing all listings. 
                Common fields apply to everyone.
              </p>
            </div>
          </div>

          {/* Connection Lines (SVGs would be better but CSS borders work for simple trees) */}
          <div className="absolute top-[160px] left-1/2 -translate-x-1/2 w-[85%] h-20 border-t-4 border-l-4 border-r-4 border-slate-300 rounded-t-3xl -z-0"></div>
          <div className="absolute top-[160px] left-1/2 -translate-x-1/2 h-20 border-l-4 border-slate-300 -z-0"></div>

          {/* Categories Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 relative z-10">
            
            {/* HOUSE BRANCH */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-emerald-500 w-full max-w-sm hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Home className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">HOUSE</h3>
                    <code className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Category: HOUSE</code>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* House Types */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="flex items-center text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      <List className="w-4 h-4 mr-2" /> House Types
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['SINGLE_HOUSE', 'POOL_VILLA', 'TOWNHOUSE', 'SHOPHOUSE'].map(t => (
                        <span key={t} className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 text-center">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specific Fields */}
                  <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                    <h4 className="flex items-center text-sm font-bold text-emerald-800 mb-2 uppercase tracking-wide">
                      <Key className="w-4 h-4 mr-2" /> Specific Fields
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { name: 'houseType', type: 'Enum', desc: 'Type of house' },
                        { name: 'floors', type: 'Int', desc: 'Number of stories' },
                        { name: 'garden', type: 'Boolean', desc: 'Has garden?' },
                        { name: 'pool', type: 'Boolean', desc: 'Has private pool?' },
                      ].map((field) => (
                        <li key={field.name} className="flex justify-between items-center text-sm border-b border-emerald-100 last:border-0 pb-1 last:pb-0">
                          <code className="text-emerald-700 font-bold">{field.name}</code>
                          <span className="text-xs text-slate-500">{field.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CONDO BRANCH */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-blue-500 w-full max-w-sm hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">CONDO</h3>
                    <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Category: CONDO</code>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Relations */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h4 className="flex items-center text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">
                      <GitBranch className="w-4 h-4 mr-2" /> Key Relations
                    </h4>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200">
                      <Database className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold">Project</span>
                      <span className="text-xs text-slate-400"> (Parent Building)</span>
                    </div>
                  </div>

                  {/* Specific Fields */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                    <h4 className="flex items-center text-sm font-bold text-blue-800 mb-2 uppercase tracking-wide">
                      <Key className="w-4 h-4 mr-2" /> Specific Fields
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { name: 'floor', type: 'Int', desc: 'Unit floor level' },
                        { name: 'amenities', type: 'JSON', desc: 'Gym, Pool, etc.' },
                      ].map((field) => (
                        <li key={field.name} className="flex justify-between items-center text-sm border-b border-blue-100 last:border-0 pb-1 last:pb-0">
                          <code className="text-blue-700 font-bold">{field.name}</code>
                          <span className="text-xs text-slate-500">{field.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded">
                    * Condos rely heavily on the parent <strong>Project</strong> model for location and facilities.
                  </div>
                </div>
              </div>
            </div>

            {/* INVESTMENT / BUSINESS BRANCH */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-orange-500 w-full max-w-sm hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">BUSINESS</h3>
                    <code className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">Category: INVESTMENT</code>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Business Types */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="flex items-center text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      <List className="w-4 h-4 mr-2" /> Investment Types
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['HOTEL', 'CLUB_BAR', 'MASSAGE', 'RESTAURANT', 'WELLNESS'].map(t => (
                        <span key={t} className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specific Fields */}
                  <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                    <h4 className="flex items-center text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">
                      <Key className="w-4 h-4 mr-2" /> Specific Fields
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { name: 'investmentType', type: 'Enum', desc: 'Type of biz' },
                        { name: 'monthlyRevenue', type: 'Decimal', desc: 'Earnings' },
                        { name: 'numberOfStaff', type: 'Int', desc: 'Staff count' },
                        { name: 'license', type: 'Boolean', desc: 'Has license?' },
                        { name: 'equipmentIncluded', type: 'Enum', desc: 'Fully/Partial' },
                        { name: 'openForYears', type: 'Int', desc: 'Age of biz' },
                      ].map((field) => (
                        <li key={field.name} className="flex justify-between items-center text-sm border-b border-orange-100 last:border-0 pb-1 last:pb-0">
                          <code className="text-orange-700 font-bold">{field.name}</code>
                          <span className="text-xs text-slate-500">{field.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* LAND BRANCH */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-8 border-amber-800 w-full max-w-sm hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Map className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">LAND</h3>
                    <code className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded">Category: LAND</code>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Land Zone Colors */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="flex items-center text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      <List className="w-4 h-4 mr-2" /> Land Zone Colors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['RED', 'ORANGE', 'YELLOW', 'BROWN', 'PURPLE', 'GREEN'].map(t => (
                        <span key={t} className={`text-xs font-mono border px-2 py-1 rounded text-white font-bold shadow-sm
                          ${t === 'RED' ? 'bg-red-500 border-red-600' : ''}
                          ${t === 'ORANGE' ? 'bg-orange-500 border-orange-600' : ''}
                          ${t === 'YELLOW' ? 'bg-yellow-400 border-yellow-500 text-yellow-900' : ''}
                          ${t === 'BROWN' ? 'bg-amber-800 border-amber-900' : ''}
                          ${t === 'PURPLE' ? 'bg-purple-600 border-purple-700' : ''}
                          ${t === 'GREEN' ? 'bg-green-600 border-green-700' : ''}
                        `}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specific Fields */}
                  <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                    <h4 className="flex items-center text-sm font-bold text-amber-900 mb-2 uppercase tracking-wide">
                      <Key className="w-4 h-4 mr-2" /> Specific Fields
                    </h4>
                    <ul className="space-y-2">
                      {[
                        { name: 'landZoneColor', type: 'Enum', desc: 'Zone Color' },
                        { name: 'size', type: 'Int', desc: 'Total Area (sqm/rai)' },
                        { name: 'price', type: 'Decimal', desc: 'Sale Price' },
                      ].map((field) => (
                        <li key={field.name} className="flex justify-between items-center text-sm border-b border-amber-100 last:border-0 pb-1 last:pb-0">
                          <code className="text-amber-900 font-bold">{field.name}</code>
                          <span className="text-xs text-slate-500">{field.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Common Fields Legend */}
          <div className="mt-12 max-w-4xl mx-auto bg-slate-800 text-slate-300 rounded-xl p-8 shadow-inner">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-400" />
              Common Fields (All Types)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Identity</span>
                <ul className="text-sm font-mono space-y-1">
                  <li>id</li>
                  <li>title</li>
                  <li>description</li>
                  <li>status</li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Financial</span>
                <ul className="text-sm font-mono space-y-1">
                  <li>price (Sale)</li>
                  <li>rentPrice</li>
                  <li>listingType</li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Specs</span>
                <ul className="text-sm font-mono space-y-1">
                  <li>bedrooms</li>
                  <li>bathrooms</li>
                  <li>size (sqm)</li>
                  <li>parking</li>
                </ul>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Location</span>
                <ul className="text-sm font-mono space-y-1">
                  <li>address</li>
                  <li>city</li>
                  <li>lat/lng</li>
                  <li>area</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

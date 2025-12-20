'use client';

import { useState } from 'react';
import { 
  PROPERTY_CATEGORIES, 
  LISTING_TYPES, 
  CATEGORY_SUBTYPES,
  PATTAYA_AREAS
} from '@/lib/constants';

export interface MapFilters {
  query: string;
  category: string;
  subtype: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  area: string;
  minSize: string;
  maxSize: string;
  landZoneColor: string;
  petFriendly: boolean;
  furnished: boolean;
  pool: boolean;
  seaView: boolean;
}

interface MapSearchProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  onSearchSubmit?: (query: string) => void;
  isCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function MapSearch({ filters, onFilterChange, onSearchSubmit, isCollapsed: externalIsCollapsed, onCollapseChange }: MapSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapseChange || setInternalIsCollapsed;

  const handleChange = (name: keyof MapFilters, value: string | boolean) => {
    if (name === 'minPrice' || name === 'maxPrice' || name === 'minSize' || name === 'maxSize') {
      const rawValue = String(value).replace(/[^0-9]/g, '');
      const formattedValue = rawValue ? Number(rawValue).toLocaleString() : '';
      onFilterChange({ ...filters, [name]: formattedValue });
    } else {
      onFilterChange({ ...filters, [name]: value });
    }
  };

  const toggleFilter = (name: keyof MapFilters) => {
    onFilterChange({ ...filters, [name]: !filters[name] });
  };

  // Quick filter chips (removed furnished)
  const quickFilters = [
    { id: 'petFriendly' as keyof MapFilters, label: 'Pet Friendly', icon: '🐾' },
    { id: 'pool' as keyof MapFilters, label: 'Pool', icon: '🏊' },
    { id: 'seaView' as keyof MapFilters, label: 'Sea View', icon: '🌊' },
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subtype) count++;
    if (filters.listingType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.area) count++;
    if (filters.minSize) count++;
    if (filters.maxSize) count++;
    if (filters.landZoneColor) count++;
    if (filters.petFriendly) count++;
    if (filters.furnished) count++;
    if (filters.pool) count++;
    if (filters.seaView) count++;
    return count;
  };

  const getSubtypeOptions = () => {
    if (!filters.category) return [];
    return CATEGORY_SUBTYPES[filters.category as keyof typeof CATEGORY_SUBTYPES] || [];
  };

  return (
    <>
      {/* Mobile Collapse Button (Only visible when collapsed on mobile) */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`md:hidden absolute top-4 left-4 z-20 bg-white shadow-lg p-3 rounded-full text-gray-700 hover:text-[#496f5d] transition-all duration-300 ${!isCollapsed ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Search Container */}
      <div 
        className={`absolute top-4 z-20 w-full max-w-xl px-4 md:px-0 left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0 transition-all duration-300 origin-top-left ${
          isCollapsed ? 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto scale-95 md:scale-100' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-4 border border-gray-100 relative">
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsCollapsed(true)}
            className="md:hidden absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-gray-100 text-gray-500 z-30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Row 1: Search Input (Full width on mobile, with Category & Buy/Rent on desktop) */}
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search Project name, location..."
                value={filters.query}
                onChange={(e) => handleChange('query', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearchSubmit) {
                    onSearchSubmit(filters.query);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="flex-1 md:w-28 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Type</option>
                {Object.entries(PROPERTY_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={filters.listingType}
                onChange={(e) => handleChange('listingType', e.target.value)}
                className="flex-1 md:w-28 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Buy/Rent</option>
                <option value="SALE">For Sale</option>
                <option value="RENT">For Rent</option>
              </select>
            </div>
          </div>

          {/* Row 2/3: Min Price + Max Price + More Button */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-28 md:flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-28 md:flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`w-20 md:w-24 px-2 md:px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap ${
                isAdvancedOpen 
                  ? 'bg-primary-600 text-white shadow-soft' 
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="flex-shrink-0">{isAdvancedOpen ? 'Less' : 'More'}</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-white/30 text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Category-Specific More Filters */}
          {isAdvancedOpen && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              
              {/* CONDO: Area + Bedrooms + Size + Pills */}
              {filters.category === 'CONDO' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Areas</option>
                      {PATTAYA_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleChange('bedrooms', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Bedrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Min sq.m"
                      value={filters.minSize}
                      onChange={(e) => handleChange('minSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Max sq.m"
                      value={filters.maxSize}
                      onChange={(e) => handleChange('maxSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => toggleFilter(filter.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          filters[filter.id]
                            ? 'bg-primary-600 text-white shadow-soft'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <span>{filter.icon}</span>
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* HOUSE: Subtype + Area + Bedrooms + Size + Pet Friendly */}
              {filters.category === 'HOUSE' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.subtype}
                      onChange={(e) => handleChange('subtype', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All House Types</option>
                      {getSubtypeOptions().map((subtype) => (
                        <option key={subtype} value={subtype}>
                          {subtype.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Areas</option>
                      {PATTAYA_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleChange('bedrooms', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Bedrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleFilter('petFriendly')}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                        filters.petFriendly
                          ? 'bg-primary-600 text-white shadow-soft'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <span>🐾</span>
                      <span>Pet Friendly</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Min sq.m"
                      value={filters.minSize}
                      onChange={(e) => handleChange('minSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Max sq.m"
                      value={filters.maxSize}
                      onChange={(e) => handleChange('maxSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              {/* LAND: ZoningColor + Area + Size */}
              {filters.category === 'LAND' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.landZoneColor}
                      onChange={(e) => handleChange('landZoneColor', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Zones</option>
                      <option value="RED">Red (Commercial)</option>
                      <option value="ORANGE">Orange (High Density)</option>
                      <option value="YELLOW">Yellow (Low Density)</option>
                      <option value="BROWN">Brown (Special)</option>
                      <option value="PURPLE">Purple (Industrial)</option>
                      <option value="GREEN">Green (Rural/Agri)</option>
                    </select>
                    <select
                      value={filters.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Areas</option>
                      {PATTAYA_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Min sq.m"
                      value={filters.minSize}
                      onChange={(e) => handleChange('minSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Max sq.m"
                      value={filters.maxSize}
                      onChange={(e) => handleChange('maxSize', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              {/* INVESTMENT: Subtype */}
              {filters.category === 'INVESTMENT' && (
                <select
                  value={filters.subtype}
                  onChange={(e) => handleChange('subtype', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Investment Types</option>
                  {getSubtypeOptions().map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              )}

              {/* No category selected - show generic filters */}
              {!filters.category && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.area}
                      onChange={(e) => handleChange('area', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Areas</option>
                      {PATTAYA_AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleChange('bedrooms', e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Bedrooms</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {quickFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => toggleFilter(filter.id)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                          filters[filter.id]
                            ? 'bg-primary-600 text-white shadow-soft'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        <span>{filter.icon}</span>
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
      </div>
    </div>
    </>
  );
}

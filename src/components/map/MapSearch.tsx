'use client';

import { useState } from 'react';
import { 
  PROPERTY_CATEGORIES, 
  LISTING_TYPES, 
  CATEGORY_SUBTYPES 
} from '@/lib/constants';

export interface MapFilters {
  query: string;
  category: string;
  subtype: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  petFriendly: boolean;
  furnished: boolean;
  pool: boolean;
  seaView: boolean;
}

interface MapSearchProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  onSearchSubmit?: (query: string) => void;
}

export default function MapSearch({ filters, onFilterChange, onSearchSubmit }: MapSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleChange = (name: keyof MapFilters, value: string | boolean) => {
    if (name === 'minPrice' || name === 'maxPrice') {
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

  // Quick filter chips
  const quickFilters = [
    { id: 'petFriendly' as keyof MapFilters, label: 'Pet Friendly', icon: '🐾' },
    { id: 'furnished' as keyof MapFilters, label: 'Furnished', icon: '🛋️' },
    { id: 'pool' as keyof MapFilters, label: 'Pool', icon: '🏊' },
    { id: 'seaView' as keyof MapFilters, label: 'Sea View', icon: '🌊' },
  ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.listingType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
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

          {/* Top Row: Search & Main Toggles */}
          <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search project, location, or road..."
              value={filters.query}
              onChange={(e) => handleChange('query', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearchSubmit) {
                  onSearchSubmit(filters.query);
                }
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d] focus:border-transparent transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {onSearchSubmit && filters.query && (
              <button 
                onClick={() => onSearchSubmit(filters.query)}
                className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
            )}
          </div>

          {/* Primary Filters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
            >
              <option value="">All Types</option>
              {Object.entries(PROPERTY_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Listing Type */}
            <select
              value={filters.listingType}
              onChange={(e) => handleChange('listingType', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
            >
              <option value="">Any Deal</option>
              {Object.entries(LISTING_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Price Min */}
            <input
              type="text"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
            />

            {/* Price Max */}
            <input
              type="text"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
            />
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => toggleFilter(filter.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                filters[filter.id]
                  ? 'bg-[#496f5d] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
          
          {getActiveFilterCount() > 0 && (
            <span className="ml-auto text-xs text-[#496f5d] font-medium bg-[#e8f0eb] px-2 py-1 rounded-full">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>

        {/* Advanced Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-xs font-medium text-[#496f5d] flex items-center gap-1 hover:text-[#3d5c4d] transition-colors"
          >
            {isAdvancedOpen ? 'Hide Advanced' : 'More Filters'}
            <svg 
              className={`w-3 h-3 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Advanced Filters Section */}
        {isAdvancedOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Bedrooms</label>
              <div className="flex flex-wrap gap-1.5">
                {['Any', '1+', '2+', '3+', '4+', '5+'].map((bed) => (
                  <button
                    key={bed}
                    type="button"
                    onClick={() => handleChange('bedrooms', bed === 'Any' ? '' : bed.replace('+', ''))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      (bed === 'Any' && !filters.bedrooms) || filters.bedrooms === bed.replace('+', '')
                        ? 'bg-[#496f5d] text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#496f5d]'
                    }`}
                  >
                    {bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtype (Dynamic based on Category) */}
            {filters.category && getSubtypeOptions().length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Property Type</label>
                <select
                  value={filters.subtype}
                  onChange={(e) => handleChange('subtype', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">All {PROPERTY_CATEGORIES[filters.category as keyof typeof PROPERTY_CATEGORIES]} Types</option>
                  {getSubtypeOptions().map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {subtype.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
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
}

interface MapSearchProps {
  filters: MapFilters;
  onFilterChange: (filters: MapFilters) => void;
  onSearchSubmit?: (query: string) => void;
}

export default function MapSearch({ filters, onFilterChange, onSearchSubmit }: MapSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleChange = (name: keyof MapFilters, value: string) => {
    // Handle price formatting (remove non-digits)
    if (name === 'minPrice' || name === 'maxPrice') {
      const rawValue = value.replace(/[^0-9]/g, '');
      const formattedValue = rawValue ? Number(rawValue).toLocaleString() : '';
      onFilterChange({ ...filters, [name]: formattedValue });
    } else {
      onFilterChange({ ...filters, [name]: value });
    }
  };

  const getSubtypeOptions = () => {
    if (!filters.category) return [];
    return CATEGORY_SUBTYPES[filters.category as keyof typeof CATEGORY_SUBTYPES] || [];
  };

  return (
    <div className="absolute top-4 left-4 z-20 w-full max-w-xl px-4 md:px-0">
      <div className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-4 border border-gray-100 transition-all duration-300">
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

        {/* Advanced Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-xs font-medium text-[#496f5d] flex items-center gap-1 hover:text-[#3d5c4d] transition-colors"
          >
            {isAdvancedOpen ? 'Hide Advanced' : 'Advanced Filters'}
            <svg 
              className={`w-3 h-3 transform transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Active Filter Count Badge could go here */}
        </div>

        {/* Advanced Filters Section */}
        {isAdvancedOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Subtype (Dynamic based on Category) */}
            {filters.category && getSubtypeOptions().length > 0 && (
              <select
                value={filters.subtype}
                onChange={(e) => handleChange('subtype', e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
              >
                <option value="">All {PROPERTY_CATEGORIES[filters.category as keyof typeof PROPERTY_CATEGORIES]} Types</option>
                {getSubtypeOptions().map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            )}

            {/* Bedrooms */}
            <select
              value={filters.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
            >
              <option value="">Any Bedrooms</option>
              <option value="0">Studio</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

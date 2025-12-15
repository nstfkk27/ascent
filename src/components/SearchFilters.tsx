'use client';

import { useState } from 'react';
import { 
  PROPERTY_CATEGORIES, 
  PROPERTY_SUBTYPES, 
  CATEGORY_SUBTYPES, 
  LISTING_TYPES, 
  CONDO_UNIT_FEATURES,
  HOUSE_UNIT_FEATURES,
  PROJECT_FACILITIES,
  YEARS_OPERATIONAL_RANGES,
  STAFF_COUNT_RANGES,
  EQUIPMENT_LEVELS,
  PATTAYA_AREAS
} from '@/lib/constants';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  category: string;
  subtype: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  city: string;
  area: string;
  // Features
  petFriendly: boolean;
  furnished: boolean;
  pool: boolean;
  garden: boolean;
  seaView: boolean;
  conferenceRoom: boolean;
  // Investment Specific
  openForYearsRange: string;
  staffRange: string;
  equipmentIncluded: string;
  landZoneColor: string;
  [key: string]: any;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    subtype: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    city: 'Pattaya', // Default to Pattaya
    area: '',
    petFriendly: false,
    furnished: false,
    pool: false,
    garden: false,
    seaView: false,
    conferenceRoom: false,
    openForYearsRange: '',
    staffRange: '',
    equipmentIncluded: '',
    landZoneColor: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Handle price formatting
    if (name === 'minPrice' || name === 'maxPrice') {
      const rawValue = value.replace(/[^0-9]/g, '');
      newValue = rawValue ? Number(rawValue).toLocaleString() : '';
    }

    const newFilters = {
      ...filters,
      [name]: newValue,
    };
    
    // Reset subtype if category changes
    if (name === 'category') {
      newFilters.subtype = '';
    }
    
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const getSubtypeOptions = () => {
    if (!filters.category) return [];
    return CATEGORY_SUBTYPES[filters.category as keyof typeof CATEGORY_SUBTYPES] || [];
  };
  
  // Helper to check if a specific field should be shown for the current category
  const shouldShowField = (fieldId: string) => {
    // Hide residential-specific filters for Investment and Land
    if (filters.category === 'INVESTMENT' || filters.category === 'LAND') {
      if (['petFriendly', 'furnished', 'garden', 'seaView'].includes(fieldId)) return false;
    }
    // Hide investment-specific for residential
    if (filters.category === 'HOUSE' || filters.category === 'CONDO') {
      if (['conferenceRoom', 'landZoneColor'].includes(fieldId)) return false;
    }
    return true;
  };

  // Get active filter count for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.subtype) count++;
    if (filters.listingType) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.bedrooms) count++;
    if (filters.area) count++;
    if (filters.petFriendly) count++;
    if (filters.furnished) count++;
    if (filters.pool) count++;
    if (filters.garden) count++;
    if (filters.seaView) count++;
    return count;
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      subtype: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      city: 'Pattaya',
      area: '',
      petFriendly: false,
      furnished: false,
      pool: false,
      garden: false,
      seaView: false,
      conferenceRoom: false,
      openForYearsRange: '',
      staffRange: '',
      equipmentIncluded: '',
      landZoneColor: '',
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  // Quick filter chips
  const quickFilters = [
    { id: 'petFriendly', label: 'Pet Friendly', icon: '🐾', show: shouldShowField('petFriendly') },
    { id: 'furnished', label: 'Furnished', icon: '🛋️', show: shouldShowField('furnished') },
    { id: 'pool', label: 'Pool', icon: '🏊', show: shouldShowField('pool') },
    { id: 'seaView', label: 'Sea View', icon: '🌊', show: shouldShowField('seaView') },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 1. Static Location Dropdown */}
        <div>
          <select
            name="city"
            value={filters.city}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          >
            <option value="Pattaya">Pattaya</option>
          </select>
        </div>

        {/* 2. Area Dropdown */}
        <div>
          <select
            name="area"
            value={filters.area}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent ${filters.area ? 'text-gray-900' : 'text-gray-600'}`}
          >
            <option value="">All Areas</option>
            {PATTAYA_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* 3. Search Keyword */}
        <div className="lg:col-span-2">
          <input
            type="text"
            name="query"
            placeholder="Search by keyword..."
            value={filters.query}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent text-gray-900 placeholder-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 3. Category */}
        <div>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent ${filters.category ? 'text-gray-900' : 'text-gray-600'}`}
          >
            <option value="">All Categories</option>
            {Object.entries(PROPERTY_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        {/* 4. Subtype */}
        <div>
          <select
            name="subtype"
            value={filters.subtype}
            onChange={handleChange}
            disabled={!filters.category}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent disabled:bg-gray-100 ${filters.subtype ? 'text-gray-900' : 'text-gray-600'}`}
          >
            <option value="">All Types</option>
            {getSubtypeOptions().map((subtype) => (
              <option key={subtype} value={subtype}>
                {PROPERTY_SUBTYPES[subtype as keyof typeof PROPERTY_SUBTYPES]}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Listing Type */}
        <div>
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent ${filters.listingType ? 'text-gray-900' : 'text-gray-600'}`}
          >
            <option value="">All Listings</option>
            {Object.entries(LISTING_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* 6. Price Range */}
        <div className="flex space-x-2">
          <input
            type="text"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent text-gray-900 placeholder-gray-600"
          />
          <input
            type="text"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent text-gray-900 placeholder-gray-600"
          />
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="pt-4 border-t border-gray-100 mt-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {quickFilters.filter(f => f.show).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                const newFilters = { ...filters, [filter.id]: !filters[filter.id] };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                filters[filter.id]
                  ? 'bg-[#496f5d] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
          
          {/* Clear Filters */}
          {getActiveFilterCount() > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear ({getActiveFilterCount()})
            </button>
          )}
          
          <div className="flex-1" />
          
          <button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2 ${
              showMoreFilters 
                ? 'bg-[#496f5d] text-white' 
                : 'bg-[#e8f0eb] text-[#496f5d] hover:bg-[#d1e0d6]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {showMoreFilters ? 'Less Filters' : 'More Filters'}
            <svg className={`w-4 h-4 transform transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showMoreFilters && (
          <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
            {/* Bedrooms Filter */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#496f5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Bedrooms
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Any', '1+', '2+', '3+', '4+', '5+'].map((bed) => (
                  <button
                    key={bed}
                    type="button"
                    onClick={() => {
                      const value = bed === 'Any' ? '' : bed.replace('+', '');
                      const newFilters = { ...filters, bedrooms: value };
                      setFilters(newFilters);
                      onSearch(newFilters);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      (bed === 'Any' && !filters.bedrooms) || filters.bedrooms === bed.replace('+', '')
                        ? 'bg-[#496f5d] text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#496f5d] hover:text-[#496f5d]'
                    }`}
                  >
                    {bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Features - Condo */}
            {filters.category === 'CONDO' && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#496f5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Unit Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CONDO_UNIT_FEATURES.map((feature: { id: string; label: string }) => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name={feature.id}
                        checked={!!filters[feature.id]}
                        onChange={handleChange}
                        className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Unit Features - House */}
            {filters.category === 'HOUSE' && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#496f5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Unit Features
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {HOUSE_UNIT_FEATURES.map((feature: { id: string; label: string }) => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name={feature.id}
                        checked={!!filters[feature.id]}
                        onChange={handleChange}
                        className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Project Facilities - for Condo & House */}
            {(filters.category === 'CONDO' || filters.category === 'HOUSE') && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#496f5d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Project Facilities
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PROJECT_FACILITIES.slice(0, 8).map((feature: { id: string; label: string }) => (
                    <label key={feature.id} className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        name={feature.id}
                        checked={!!filters[feature.id]}
                        onChange={handleChange}
                        className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Specific Dropdowns */}
            {filters.category === 'INVESTMENT' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Operational Years</label>
                  <select
                    name="openForYearsRange"
                    value={filters.openForYearsRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#496f5d] focus:border-transparent bg-white"
                  >
                    <option value="">Any</option>
                    {YEARS_OPERATIONAL_RANGES.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Staff Count</label>
                  <select
                    name="staffRange"
                    value={filters.staffRange}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#496f5d] focus:border-transparent bg-white"
                  >
                    <option value="">Any</option>
                    {STAFF_COUNT_RANGES.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Equipment Level</label>
                  <select
                    name="equipmentIncluded"
                    value={filters.equipmentIncluded}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#496f5d] focus:border-transparent bg-white"
                  >
                    <option value="">Any</option>
                    {Object.entries(EQUIPMENT_LEVELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Zone Color</label>
                  <select
                    name="landZoneColor"
                    value={filters.landZoneColor}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#496f5d] focus:border-transparent bg-white"
                  >
                    <option value="">Any</option>
                    <option value="RED">Red (Commercial)</option>
                    <option value="ORANGE">Orange (High Density)</option>
                    <option value="YELLOW">Yellow (Low Density)</option>
                    <option value="BROWN">Brown (Special)</option>
                    <option value="PURPLE">Purple (Industrial)</option>
                    <option value="GREEN">Green (Rural/Agri)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Land Zone Color - for Land category */}
            {filters.category === 'LAND' && (
              <div className="mb-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Zone Color</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '', label: 'Any', color: 'bg-gray-100' },
                    { value: 'RED', label: 'Red (Commercial)', color: 'bg-red-500' },
                    { value: 'ORANGE', label: 'Orange (High Density)', color: 'bg-orange-500' },
                    { value: 'YELLOW', label: 'Yellow (Low Density)', color: 'bg-yellow-400' },
                    { value: 'BROWN', label: 'Brown (Special)', color: 'bg-amber-700' },
                    { value: 'PURPLE', label: 'Purple (Industrial)', color: 'bg-purple-500' },
                    { value: 'GREEN', label: 'Green (Rural)', color: 'bg-green-500' },
                  ].map((zone) => (
                    <button
                      key={zone.value}
                      type="button"
                      onClick={() => {
                        const newFilters = { ...filters, landZoneColor: zone.value };
                        setFilters(newFilters);
                        onSearch(newFilters);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                        filters.landZoneColor === zone.value
                          ? 'ring-2 ring-offset-1 ring-[#496f5d]'
                          : 'hover:opacity-80'
                      } ${zone.value ? 'text-white' : 'text-gray-700 border border-gray-200'} ${zone.color}`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

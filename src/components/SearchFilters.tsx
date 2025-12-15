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
  // Special filters
  newProject: boolean;
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
    newProject: false,
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
      newProject: false,
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

  // Quick filter chips (removed furnished)
  const quickFilters = [
    { id: 'petFriendly', label: 'Pet Friendly', icon: '🐾', show: shouldShowField('petFriendly') },
    { id: 'pool', label: 'Pool', icon: '🏊', show: shouldShowField('pool') },
    { id: 'seaView', label: 'Sea View', icon: '🌊', show: shouldShowField('seaView') },
  ];

  const toggleFilter = (id: string) => {
    const newFilters = { ...filters, [id]: !filters[id] };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      {/* Row 1: Input + Category */}
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            name="query"
            placeholder="Search project name, location..."
            value={filters.query}
            onChange={handleChange}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category */}
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
        >
          <option value="">All Types</option>
          {Object.entries(PROPERTY_CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {/* Row 2: Min/Max Price + More Filters Button */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleChange}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
        />
        <input
          type="text"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleChange}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
        />
        <button
          type="button"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
            showMoreFilters 
              ? 'bg-[#496f5d] text-white' 
              : 'bg-[#e8f0eb] text-[#496f5d] hover:bg-[#d1e0d6]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {showMoreFilters ? 'Less' : 'More'}
          {getActiveFilterCount() > 0 && (
            <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>
      </div>

      {/* Category-Specific More Filters */}
      {showMoreFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          
          {/* CONDO: Area | Bedroom + Pills */}
          {filters.category === 'CONDO' && (
            <>
              <div className="flex gap-2">
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">All Areas</option>
                  {PATTAYA_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1+ Bed</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickFilters.filter(f => f.show).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      filters[filter.id]
                        ? 'bg-[#496f5d] text-white shadow-md'
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

          {/* HOUSE: Subtype | Area, Bedroom, Pet Friendly pill only */}
          {filters.category === 'HOUSE' && (
            <>
              <div className="flex gap-2">
                <select
                  name="subtype"
                  value={filters.subtype}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">All House Types</option>
                  {getSubtypeOptions().map((subtype) => (
                    <option key={subtype} value={subtype}>
                      {PROPERTY_SUBTYPES[subtype as keyof typeof PROPERTY_SUBTYPES] || subtype.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">All Areas</option>
                  {PATTAYA_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1+ Bed</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleFilter('petFriendly')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    filters.petFriendly
                      ? 'bg-[#496f5d] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span>🐾</span>
                  <span>Pet Friendly</span>
                </button>
              </div>
            </>
          )}

          {/* LAND: ZoningColor | Area */}
          {filters.category === 'LAND' && (
            <div className="flex gap-2">
              <select
                name="landZoneColor"
                value={filters.landZoneColor}
                onChange={handleChange}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
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
                name="area"
                value={filters.area}
                onChange={handleChange}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
              >
                <option value="">All Areas</option>
                {PATTAYA_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          )}

          {/* INVESTMENT: Subtype only */}
          {filters.category === 'INVESTMENT' && (
            <div className="flex gap-2">
              <select
                name="subtype"
                value={filters.subtype}
                onChange={handleChange}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
              >
                <option value="">All Investment Types</option>
                {getSubtypeOptions().map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {PROPERTY_SUBTYPES[subtype as keyof typeof PROPERTY_SUBTYPES] || subtype.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* No category selected - show generic filters */}
          {!filters.category && (
            <>
              <div className="flex gap-2">
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">All Areas</option>
                  {PATTAYA_AREAS.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                <select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleChange}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1+ Bed</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickFilters.filter(f => f.show).map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => toggleFilter(filter.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      filters[filter.id]
                        ? 'bg-[#496f5d] text-white shadow-md'
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
  );
}

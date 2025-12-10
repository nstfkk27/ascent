'use client';

import { useState } from 'react';
import { 
  PROPERTY_CATEGORIES, 
  PROPERTY_SUBTYPES, 
  CATEGORY_SUBTYPES, 
  LISTING_TYPES, 
  CONDO_FACILITIES,
  CONDO_VIEWS,
  HOUSE_FACILITIES,
  HOUSE_AMENITIES,
  INVESTMENT_AMENITIES,
  YEARS_OPERATIONAL_RANGES,
  STAFF_COUNT_RANGES,
  EQUIPMENT_LEVELS,
  SUBTYPE_FEATURES,
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
  
  // Helper to check if a specific field should be shown for the current subtype
  const shouldShowField = (fieldId: string) => {
    // Hide residential-specific common filters for Investment
    if (filters.category === 'INVESTMENT') {
       // Allow specific investment fields
       if (['pool', 'conferenceRoom', 'elevator', 'zoning'].includes(fieldId)) {
          // Check if subtype allows it
          if (!filters.subtype) return true;
          const allowedFeatures = SUBTYPE_FEATURES[filters.subtype as keyof typeof SUBTYPE_FEATURES] as readonly string[];
          return allowedFeatures?.includes(fieldId);
       }
       // Hide residential defaults
       if (['petFriendly', 'furnished', 'garden', 'seaView'].includes(fieldId)) return false;
    }

    if (!filters.subtype) return true; // Show all if no subtype selected
    const allowedFeatures = SUBTYPE_FEATURES[filters.subtype as keyof typeof SUBTYPE_FEATURES] as readonly string[];
    return allowedFeatures?.includes(fieldId);
  };

  // --- Render Helpers ---

  const renderHouseFeatures = () => {
    const amenities = HOUSE_AMENITIES.filter(f => shouldShowField(f.id));
    const facilities = HOUSE_FACILITIES.filter(f => shouldShowField(f.id));

    return (
      <div className="col-span-full space-y-4">
        {amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {amenities.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {facilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Facilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {facilities.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCondoFeatures = () => {
    const facilities = CONDO_FACILITIES.filter(f => shouldShowField(f.id));
    const views = CONDO_VIEWS.filter(f => shouldShowField(f.id));

    return (
      <div className="col-span-full space-y-4">
        {views.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Views</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {views.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {facilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Facilities & Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {facilities.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInvestmentFeatures = () => {
    // Columns that are treated as checkboxes
    const columns = [
      { id: 'conferenceRoom', label: 'Conference Room' },
      { id: 'pool', label: 'Swimming Pool' },
    ].filter(f => shouldShowField(f.id));

    // JSON Amenities
    const amenities = INVESTMENT_AMENITIES.filter(f => shouldShowField(f.id));

    return (
      <div className="col-span-full space-y-4">
        {(columns.length > 0 || amenities.length > 0) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Features & Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {columns.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
              {amenities.map(feature => (
                <label key={feature.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={feature.id}
                    checked={!!filters[feature.id]}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {/* 7. Dropdown for More Filters */}
      <div className="pt-4 border-t border-gray-100 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-4">
            {/* Common Filters - Only show if relevant to subtype */}
            {shouldShowField('petFriendly') && !showMoreFilters && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="petFriendly"
                  checked={filters.petFriendly}
                  onChange={handleChange}
                  className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                />
                <span className="text-sm text-gray-700">Pet Friendly</span>
              </label>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="px-4 py-2 text-sm font-medium text-[#496f5d] bg-[#e8f0eb] rounded-lg hover:bg-[#d1e0d6] transition-colors flex items-center"
          >
            {showMoreFilters ? 'Hide Filters' : 'More Filters'}
            <svg className={`w-4 h-4 ml-2 transform transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showMoreFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Common Filters - Only show if relevant to subtype */}
              {shouldShowField('furnished') && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="furnished"
                    checked={filters.furnished}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">Furnished</span>
                </label>
              )}

              {shouldShowField('pool') && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="pool"
                    checked={filters.pool}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">
                    {filters.category === 'HOUSE' ? 'Private Pool' : 'Pool'}
                  </span>
                </label>
              )}

              {shouldShowField('garden') && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="garden"
                    checked={filters.garden}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">Garden</span>
                </label>
              )}

              {shouldShowField('seaView') && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="seaView"
                    checked={filters.seaView}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">Sea View</span>
                </label>
              )}
              
              {shouldShowField('petFriendly') && (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="petFriendly"
                    checked={filters.petFriendly}
                    onChange={handleChange}
                    className="rounded text-[#496f5d] focus:ring-[#496f5d]"
                  />
                  <span className="text-sm text-gray-700">Pet Friendly</span>
                </label>
              )}

              {/* Dynamic Filters */}
              {filters.category === 'CONDO' && renderCondoFeatures()}
              {filters.category === 'HOUSE' && renderHouseFeatures()}
              {filters.category === 'INVESTMENT' && renderInvestmentFeatures()}

              {/* Investment Specific Dropdowns */}
              {filters.category === 'INVESTMENT' && (
                <>
                  {shouldShowField('openForYears') && (
                    <div className="col-span-2 md:col-span-1">
                      <select
                        name="openForYearsRange"
                        value={filters.openForYearsRange}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent"
                      >
                        <option value="">Any Operational Years</option>
                        {YEARS_OPERATIONAL_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {shouldShowField('numberOfStaff') && (
                    <div className="col-span-2 md:col-span-1">
                      <select
                        name="staffRange"
                        value={filters.staffRange}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent"
                      >
                        <option value="">Any Staff Count</option>
                        {STAFF_COUNT_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {shouldShowField('equipmentIncluded') && (
                    <div className="col-span-2 md:col-span-1">
                      <select
                        name="equipmentIncluded"
                        value={filters.equipmentIncluded}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8ea4d2] focus:border-transparent"
                      >
                        <option value="">Any Equipment Level</option>
                        {Object.entries(EQUIPMENT_LEVELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/SearchFilters';
import Link from 'next/link';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [displayCount, setDisplayCount] = useState(20); // 4 cards × 5 rows
  const [isLoading, setIsLoading] = useState(false);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const observerTarget = useRef(null);
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: '',
    subtype: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    city: '',
    area: '',
    minSize: '',
    maxSize: '',
    tag: '',
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

  useEffect(() => {
    const nextFilters: any = { ...filters };

    const urlCategory = searchParams.get('category');
    const urlSubtype = searchParams.get('subtype');
    const urlListingType = searchParams.get('listingType');
    const urlCity = searchParams.get('city');
    const urlArea = searchParams.get('area');
    const urlQuery = searchParams.get('query');
    const urlTag = searchParams.get('tag');
    const urlNewProject = searchParams.get('newProject');

    if (urlCategory) nextFilters.category = urlCategory;
    if (urlNewProject === 'true') nextFilters.newProject = true;
    if (urlSubtype) {
      // Navbar uses `subtype=HOUSE` for houses; the API expects `category=HOUSE`.
      if (urlSubtype === 'HOUSE') nextFilters.category = 'HOUSE';
      else nextFilters.subtype = urlSubtype;
    }
    if (urlListingType) nextFilters.listingType = urlListingType;
    if (urlCity) nextFilters.city = urlCity;
    if (urlArea) nextFilters.area = urlArea;
    if (urlQuery) nextFilters.query = urlQuery;
    if (urlTag) nextFilters.tag = urlTag;

    // Only update if something actually changed
    const changed = Object.keys(nextFilters).some((k) => nextFilters[k] !== (filters as any)[k]);
    if (changed) {
      setFilters(nextFilters);
      setDisplayCount(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  // Fetch properties from API
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoadingData(true);
        const params = new URLSearchParams();
        
        // Append all active filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value === '' || value === false || value === null || value === undefined) return;
          
          if (value === true) {
            params.append(key, 'true');
          } else {
            // Strip commas from price fields
            if (key === 'minPrice' || key === 'maxPrice') {
              params.append(key, String(value).replace(/,/g, ''));
            } else {
              params.append(key, String(value));
            }
          }
        });
        
        const response = await fetch(`/api/properties?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setAllProperties(result.data);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoadingData(false);
      }
    }
    
    fetchProperties();
  }, [filters]);

  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setDisplayCount(20); // Reset to initial 5 rows when filters change
  };

  // Filter properties based on search query (API already filters most criteria)
  const filteredProperties = allProperties.filter((property) => {
    if (filters.query && !(
      property.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
      property.city?.toLowerCase().includes(filters.query.toLowerCase()) ||
      property.address?.toLowerCase().includes(filters.query.toLowerCase()) ||
      property.referenceId?.toLowerCase().includes(filters.query.toLowerCase())
    )) return false;
    return true;
  });

  const loadMore = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 20); // Load 5 more rows (4 × 5)
      setIsLoading(false);
    }, 500);
  }, [isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && filteredProperties.length > displayCount) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayCount, loadMore, filteredProperties.length]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Browse Properties</h1>
          <p className="text-gray-600 text-sm sm:text-base">Find your perfect property in Pattaya</p>
        </div>
        
        {/* Search Filters */}
        <div className="mb-6 sm:mb-8">
          <SearchFilters onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-gray-700">
            <span className="font-semibold text-primary-600">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'} found
          </p>
          <Link 
            href="/search" 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map View
          </Link>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProperties.slice(0, displayCount).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
        {filteredProperties.length > displayCount && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#496f5d] rounded-full animate-bounce"></div>
                  <div className="w-4 h-4 bg-[#49516f] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-4 bg-[#8ea4d2] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            )}
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No properties found</h2>
            <p className="text-gray-500">Try adjusting your search filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import MapComponent from './map/MapComponent';
import Inspector from './inspector/Inspector';
import MapSearch, { MapFilters } from './map/MapSearch';
import { searchAddress } from '@/lib/mapbox';

interface HomeClientProps {
  projects: any[]; // Filtered projects from server
}

export default function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  
  // Initialize filters from URL Search Params
  const [filters, setFilters] = useState<MapFilters>({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    subtype: searchParams.get('subtype') || '',
    listingType: searchParams.get('listingType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    area: searchParams.get('area') || '',
    minSize: searchParams.get('minSize') || '',
    maxSize: searchParams.get('maxSize') || '',
    landZoneColor: searchParams.get('landZoneColor') || '',
    petFriendly: searchParams.get('petFriendly') === 'true',
    furnished: searchParams.get('furnished') === 'true',
    pool: searchParams.get('pool') === 'true',
    seaView: searchParams.get('seaView') === 'true',
    nearBeach: searchParams.get('nearBeach') || '',
    nearMall: searchParams.get('nearMall') || '',
    nearHospital: searchParams.get('nearHospital') || '',
  });

  // Debounce URL updates to avoid excessive history entries
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value === true) {
          params.set(key, 'true');
        } else if (value && value !== false) {
          params.set(key, String(value));
        }
      });
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [filters, router]);

  const handleSearchSubmit = async (query: string) => {
    if (!query) return;
    const results = await searchAddress(query);
    if (results.length > 0) {
      const first = results[0];
      setFlyToLocation({
        lat: first.lat,
        lng: first.lng,
        zoom: 16
      });
    }
  };

  // Filter units for the selected project locally for the Inspector view
  // (We still need client-side filtering here because the server might return a project 
  // but we only want to show the matching units inside it)
  const displayProject = useMemo(() => {
    if (!selectedProject) return null;
    
    // Clone project to avoid mutating state
    const project = { ...selectedProject };
    
    // Filter units
    project.units = project.units.filter((unit: any) => {
       // Apply same unit filters as above
       if (filters.listingType) {
         const type = filters.listingType;
         const unitType = unit.listingType;

         if (type === 'SALE') {
            if (unitType !== 'SALE' && unitType !== 'BOTH') return false;
         } else if (type === 'RENT') {
            if (unitType !== 'RENT' && unitType !== 'BOTH') return false;
         } else if (type === 'BOTH') {
            if (unitType !== 'BOTH') return false;
         }
       }

       const min = filters.minPrice ? Number(filters.minPrice.replace(/,/g, '')) : 0;
       const max = filters.maxPrice ? Number(filters.maxPrice.replace(/,/g, '')) : Infinity;
       
       let priceMatch = false;
       if (filters.listingType === 'RENT') {
          const price = unit.rentPrice || 0;
          priceMatch = price >= min && price <= max;
       } else if (filters.listingType === 'SALE') {
          const price = unit.price || 0;
          priceMatch = price >= min && price <= max;
       } else {
          const salePrice = unit.price || 0;
          const rentPrice = unit.rentPrice || 0;
          priceMatch = (salePrice >= min && salePrice <= max) || (rentPrice >= min && rentPrice <= max);
       }
       if (!priceMatch) return false;

       if (filters.bedrooms) {
         const minBeds = Number(filters.bedrooms);
         if ((unit.bedrooms || 0) < minBeds) return false;
       }

       if (filters.minSize || filters.maxSize) {
         const minSizeNum = filters.minSize ? Number(filters.minSize.replace(/,/g, '')) : 0;
         const maxSizeNum = filters.maxSize ? Number(filters.maxSize.replace(/,/g, '')) : Infinity;
         const unitSize = unit.size || 0;
         if (unitSize < minSizeNum || unitSize > maxSizeNum) return false;
       }

       if (filters.subtype) {
          // Fix: Handle CONDO and LAND which don't have specific subtype fields
          if (filters.subtype === 'CONDO' || filters.subtype === 'LAND') {
             // Pass
          } else {
             if (unit.houseType !== filters.subtype && unit.investmentType !== filters.subtype) return false;
          }
       }

       return true;
    });

    return project;
  }, [selectedProject, filters]);

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    setIsInspectorOpen(true);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          projects={projects} 
          onProjectSelect={handleProjectSelect} 
          flyToLocation={flyToLocation}
        />
      </div>

      {/* Grid View Button - Top Right */}
      <div className="absolute top-4 right-2.5 z-20">
        <Link
          href="/properties"
          className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-md hover:bg-gray-50 text-gray-700 font-medium text-sm border border-gray-300 transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          Grid view
        </Link>
      </div>

      {/* Inspector Layer */}
      <Inspector 
        project={displayProject} 
        isOpen={isInspectorOpen} 
        onClose={() => setIsInspectorOpen(false)} 
      />

      {/* Search & Filter Overlay */}
      <MapSearch 
        filters={filters} 
        onFilterChange={setFilters} 
        onSearchSubmit={handleSearchSubmit}
      />
    </main>
  );
}

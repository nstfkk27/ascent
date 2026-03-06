'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Home, MapPin, Calendar, Building, Store, Hotel, Wine, Sparkles, UtensilsCrossed, Flower2, TrendingUp, DollarSign, PawPrint } from 'lucide-react';
import { createCompoundSlug } from '@/utils/propertyHelpers';
import PropertyCard from '@/components/PropertyCard';

interface Project {
  id: string;
  name: string;
  type: string;
  city: string;
  imageUrl: string | null;
  completionYear: number | null;
  developer: string | null;
}

interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  rentPrice?: number | undefined;
  address: string;
  city: string;
  state?: string;
  size: number;
  images: string[];
  category: string;
  listingType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  createdAt?: string;
  updatedAt?: string;
  lastVerifiedAt?: string;
  featured?: boolean;
  dealQuality?: string | null;
  overallScore?: number | null;
  estimatedRentalYield?: number | null;
  agentCommissionRate?: number | null;
  commissionAmount?: number | null;
  viewCount?: number | null;
  enquiryCount?: number | null;
}

interface PropertyCategoriesSectionProps {
  projects: Project[];
  newProperties: Property[];
  valueProperties: Property[];
  petFriendlyProperties: Property[];
}

export default function PropertyCategoriesSection({ 
  projects, 
  newProperties, 
  valueProperties, 
  petFriendlyProperties 
}: PropertyCategoriesSectionProps) {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* New Project Section - Full Width White Background */}
      <div className="bg-white pb-20 pt-8">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
          <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-2xl font-bold text-[#49516f]">New Project</h4>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:grid-rows-2 md:gap-4 md:overflow-visible md:pb-0 md:h-[600px] -mx-4 px-4 md:mx-0 md:px-0">
            {projects.length > 0 ? (
              projects.slice(0, 5).map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))
            ) : (
              [...Array(5)].map((_, i) => (
                <ProjectCardPlaceholder key={i} index={i} />
              ))
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Link 
              href="/projects"
              className="flex items-center gap-2 text-[#496f5d] font-semibold hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          </div>
        </div>
      </div>

      {/* Type Filter Icons - Standalone Section */}
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 space-y-20 pt-20 pb-8">
        <div className="flex items-center justify-center gap-8 md:gap-12 overflow-x-auto pb-4">
          <Link href="/properties?category=HOUSE&houseType=SINGLE_HOUSE" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <Home className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Single House</span>
          </Link>
          <Link href="/properties?category=HOUSE&houseType=POOL_VILLA" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <Home className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Pool Villa</span>
          </Link>
          <Link href="/properties?category=CONDO" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <Building2 className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Condo</span>
          </Link>
          <Link href="/properties?category=INVESTMENT&investmentType=HOTEL" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <Hotel className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Hotel</span>
          </Link>
          <Link href="/properties?category=INVESTMENT&investmentType=CLUB_BAR" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <Wine className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Club/Bar</span>
          </Link>
          <Link href="/properties?category=INVESTMENT&investmentType=RESTAURANT" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Restaurant</span>
          </Link>
          <Link href="/properties?category=LAND" className="flex flex-col items-center gap-3 group flex-shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-full hover:bg-amber-50 transition-all flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-600 group-hover:text-amber-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors whitespace-nowrap">Land</span>
          </Link>
        </div>

        {/* Trending Section with Tabs */}
        <TrendingSection 
          newProperties={newProperties}
          valueProperties={valueProperties}
          petFriendlyProperties={petFriendlyProperties}
        />
      </div>
    </section>
  );
}

// Trending Section Component with Tabs
function TrendingSection({ newProperties, valueProperties, petFriendlyProperties }: { newProperties: Property[], valueProperties: Property[], petFriendlyProperties: Property[] }) {
  const [activeTab, setActiveTab] = useState<'new' | 'value' | 'pet'>('new');

  const getPropertiesForTab = () => {
    switch (activeTab) {
      case 'new':
        return newProperties.slice(0, 4);
      case 'value':
        return valueProperties.slice(0, 4);
      case 'pet':
        return petFriendlyProperties.slice(0, 4);
      default:
        return newProperties.slice(0, 4);
    }
  };

  const properties = getPropertiesForTab();

  return (
    <div>
      {/* Header with Icon and Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <h4 className="text-2xl font-bold text-[#49516f]">Trending</h4>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === 'new'
              ? 'bg-[#496f5d] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          New
        </button>
        <button
          onClick={() => setActiveTab('value')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === 'value'
              ? 'bg-[#496f5d] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Value
        </button>
        <button
          onClick={() => setActiveTab('pet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === 'pet'
              ? 'bg-[#496f5d] text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <PawPrint className="w-4 h-4" />
          Pet Friendly
        </button>
      </div>

      {/* Properties Grid */}
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div key={property.id} className="flex-shrink-0 w-[300px] md:w-auto snap-center">
              <PropertyCard property={property as any} showScores={true} />
            </div>
          ))
        ) : (
          [...Array(4)].map((_, i) => (
            <PropertyCardPlaceholder key={i} index={i} />
          ))
        )}
      </div>

      {/* View All Link */}
      <div className="flex justify-end mt-4">
        <Link 
          href={`/properties?trending=${activeTab}`}
          className="flex items-center gap-2 text-[#496f5d] font-semibold hover:gap-3 transition-all"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// Project Card for In Construction
function ProjectCard({ project, index }: { project: Project; index: number }) {
  // Convert project name to slug format (e.g., "Riviera Oceandrive" -> "Riviera-Oceandrive")
  const projectSlug = project.name.replace(/\s+/g, '-');
  
  // Define grid layout positions for bento-style grid
  const getGridClass = (idx: number) => {
    switch(idx) {
      case 0: return 'md:col-span-1 md:row-span-2'; // Tall left card (1x2)
      case 1: return 'md:col-span-1 md:row-span-1'; // Top-right first
      case 2: return 'md:col-span-1 md:row-span-1'; // Top-right second
      case 3: return 'md:col-span-1 md:row-span-1'; // Bottom-right first
      case 4: return 'md:col-span-1 md:row-span-1'; // Bottom-right second
      default: return 'md:col-span-1 md:row-span-1';
    }
  };
  
  return (
    <Link href={`/project/${projectSlug}`} className={`flex-shrink-0 w-[300px] md:w-auto snap-center group ${getGridClass(index)}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full relative">
        {/* Full Image Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-amber-300" />
            </div>
          )}
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-between p-4">
          {/* Top badges */}
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              {project.type === 'CONDO' ? 'Condo' : project.type === 'HOUSE' ? 'Pool Villa' : project.type}
            </span>
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
              {project.city}
            </span>
          </div>

          {/* Bottom content */}
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 mb-1">
              {project.name}
            </h4>
            {project.developer && (
              <p className="text-sm text-white/80 mb-2">{project.developer}</p>
            )}
            <span className="text-xs font-medium text-amber-400 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full inline-block">
              {project.completionYear ? `Completion: ${project.completionYear}` : 'Under Construction'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Mini Property Card for Resale and Land
function PropertyCardMini({ property, isLand = false }: { property: Property; isLand?: boolean }) {
  const image = property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  
  // Generate property URL - use compound slug (slug + id fragment) like main PropertyCard
  const propertyUrl = property.slug 
    ? `/properties/${createCompoundSlug(property.slug, property.id)}`
    : `/properties/${property.id}`;
  
  return (
    <Link href={propertyUrl} className="flex-shrink-0 w-[300px] md:w-auto snap-center group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
        {/* Image */}
        <div className={`relative h-48 overflow-hidden ${isLand ? 'bg-gradient-to-br from-emerald-50 to-green-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Tags */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`px-2.5 py-1 text-white text-xs font-bold rounded-full ${isLand ? 'bg-emerald-500' : 'bg-blue-500'}`}>
              {property.listingType === 'RENT' ? 'For Rent' : 'For Sale'}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
              {property.city}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h4 className="text-lg font-bold text-[#49516f] mb-2 group-hover:text-[#496f5d] transition-colors line-clamp-1">
            {property.title}
          </h4>
          
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">{property.address}</p>

          {/* Details */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            {!isLand && property.bedrooms && (
              <span>{property.bedrooms} Bed</span>
            )}
            {!isLand && property.bathrooms && (
              <span>{property.bathrooms} Bath</span>
            )}
            <span>{property.size?.toLocaleString()} m²</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-[#496f5d]">
              {property.listingType === 'RENT' 
                ? `฿${Number(property.rentPrice || property.price).toLocaleString()}/mo`
                : `฿${Number(property.price).toLocaleString()}`
              }
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#496f5d] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Placeholder Cards
function ProjectCardPlaceholder({ index }: { index: number }) {
  const placeholders = [
    { name: 'Riviera Jomtien', type: 'Condo', city: 'Jomtien', year: 2026, developer: 'Developer A' },
    { name: 'Copacabana Beach', type: 'Condo', city: 'Jomtien', year: 2025, developer: 'Developer B' },
    { name: 'Palm Oasis Village', type: 'Pool Villa', city: 'East Pattaya', year: 2025, developer: 'Developer C' },
    { name: 'The Base Central', type: 'Condo', city: 'Central Pattaya', year: 2026, developer: 'Developer D' },
  ];
  const p = placeholders[index] || placeholders[0];
  
  return (
    <div className="flex-shrink-0 w-[300px] md:w-auto snap-center opacity-60">
      <div>
        {/* Image Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-amber-200" />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-amber-400 text-white text-xs font-bold rounded-full">{p.type}</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-white/80 text-gray-600 text-xs font-medium rounded-full">{p.city}</span>
            </div>
          </div>
        </div>
        {/* Content - Outside card */}
        <div className="pt-3 flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-gray-400">{p.name}</h4>
            <p className="text-sm text-gray-400">{p.developer}</p>
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap">Completion: {p.year}</span>
        </div>
      </div>
    </div>
  );
}

function PropertyCardPlaceholder({ index }: { index: number }) {
  const placeholders = [
    { title: 'Modern Condo Jomtien', city: 'Jomtien', price: 15000 },
    { title: 'Sea View Apartment', city: 'Pratumnak', price: 22000 },
    { title: 'Pool Villa East Pattaya', city: 'East Pattaya', price: 35000 },
    { title: 'Beachfront Condo', city: 'Na Jomtien', price: 28000 },
  ];
  const p = placeholders[index] || placeholders[0];
  
  return (
    <div className="flex-shrink-0 w-[300px] md:w-auto snap-center">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full opacity-75">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <Home className="w-16 h-16 text-blue-200" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-blue-400 text-white text-xs font-bold rounded-full">For Rent</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/80 text-gray-600 text-xs font-medium rounded-full">{p.city}</span>
          </div>
        </div>
        <div className="p-5">
          <h4 className="text-lg font-bold text-gray-400 mb-2">{p.title}</h4>
          <p className="text-sm text-gray-400 mb-3">Sample Property</p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-400">฿{p.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandCardPlaceholder({ index }: { index: number }) {
  const placeholders = [
    { title: 'Land Plot Huay Yai', city: 'Huay Yai', size: 400, price: 2000000 },
    { title: 'Beachfront Land', city: 'Na Jomtien', size: 800, price: 12000000 },
    { title: 'Mountain View Land', city: 'East Pattaya', size: 1600, price: 4800000 },
    { title: 'Development Land', city: 'Banglamung', size: 2400, price: 7200000 },
  ];
  const p = placeholders[index] || placeholders[0];
  
  return (
    <div className="flex-shrink-0 w-[300px] md:w-auto snap-center">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full opacity-75">
        <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
          <MapPin className="w-16 h-16 text-emerald-200" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-emerald-400 text-white text-xs font-bold rounded-full">Land</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-white/80 text-gray-600 text-xs font-medium rounded-full">{p.city}</span>
          </div>
        </div>
        <div className="p-5">
          <h4 className="text-lg font-bold text-gray-400 mb-2">{p.title}</h4>
          <p className="text-sm text-gray-400 mb-3">{p.size.toLocaleString()} m²</p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-400">฿{p.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

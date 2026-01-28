import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Home, MapPin, Calendar } from 'lucide-react';
import { createCompoundSlug } from '@/utils/propertyHelpers';

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
  address: string;
  city: string;
  size: number;
  images: string[];
  category: string;
  listingType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

interface PropertyCategoriesSectionProps {
  projects: Project[];
  resaleProperties: Property[];
  landProperties: Property[];
}

export default function PropertyCategoriesSection({ 
  projects, 
  resaleProperties, 
  landProperties 
}: PropertyCategoriesSectionProps) {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#496f5d] mb-2 uppercase tracking-wide">Explore Properties</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-[#49516f] mb-4">
            Find Your Perfect Property
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From new developments to resale properties and land opportunities
          </p>
        </div>

        {/* In Construction Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="text-2xl font-bold text-[#49516f]">In Construction</h4>
            </div>
            <Link 
              href="/properties?newProject=true"
              className="hidden md:flex items-center gap-2 text-[#496f5d] font-semibold hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {projects.length > 0 ? (
              projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              [...Array(4)].map((_, i) => (
                <ProjectCardPlaceholder key={i} index={i} />
              ))
            )}
          </div>
          <Link 
            href="/properties?newProject=true"
            className="flex md:hidden items-center justify-center gap-2 text-[#496f5d] font-semibold mt-4"
          >
            View All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Resale Property Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-[#49516f]">Resale Property</h4>
            </div>
            <Link 
              href="/properties?newProject=false"
              className="hidden md:flex items-center gap-2 text-[#496f5d] font-semibold hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {resaleProperties.length > 0 ? (
              resaleProperties.slice(0, 4).map((property) => (
                <PropertyCardMini key={property.id} property={property} />
              ))
            ) : (
              [...Array(4)].map((_, i) => (
                <PropertyCardPlaceholder key={i} index={i} />
              ))
            )}
          </div>
          <Link 
            href="/properties?newProject=false"
            className="flex md:hidden items-center justify-center gap-2 text-[#496f5d] font-semibold mt-4"
          >
            View All Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Land Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-2xl font-bold text-[#49516f]">Land</h4>
            </div>
            <Link 
              href="/properties?category=LAND"
              className="hidden md:flex items-center gap-2 text-[#496f5d] font-semibold hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {landProperties.length > 0 ? (
              landProperties.slice(0, 4).map((property) => (
                <PropertyCardMini key={property.id} property={property} isLand />
              ))
            ) : (
              [...Array(4)].map((_, i) => (
                <LandCardPlaceholder key={i} index={i} />
              ))
            )}
          </div>
          <Link 
            href="/properties?category=LAND"
            className="flex md:hidden items-center justify-center gap-2 text-[#496f5d] font-semibold mt-4"
          >
            View All Land <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Project Card for In Construction
function ProjectCard({ project }: { project: Project }) {
  // Convert project name to slug format (e.g., "Riviera Oceandrive" -> "Riviera-Oceandrive")
  const projectSlug = project.name.replace(/\s+/g, '-');
  
  return (
    <Link href={`/project/${projectSlug}`} className="flex-shrink-0 w-[300px] md:w-auto snap-center group">
      <div>
        {/* Image Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
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
            
            {/* Type - Top Left */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                {project.type === 'CONDO' ? 'Condo' : project.type === 'HOUSE' ? 'Pool Villa' : project.type}
              </span>
            </div>
            
            {/* Area - Top Right */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                {project.city}
              </span>
            </div>
          </div>
        </div>

        {/* Content - Outside card */}
        <div className="pt-3 flex items-start justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-[#49516f] group-hover:text-[#496f5d] transition-colors line-clamp-1">
              {project.name}
            </h4>
            {project.developer && (
              <p className="text-sm text-gray-500">{project.developer}</p>
            )}
          </div>
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {project.completionYear ? `Completion: ${project.completionYear}` : 'Under Construction'}
          </span>
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
              ฿{Number(property.price).toLocaleString()}
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
    { title: 'Modern Condo Jomtien', city: 'Jomtien', price: 3500000 },
    { title: 'Sea View Apartment', city: 'Pratumnak', price: 4200000 },
    { title: 'Pool Villa East Pattaya', city: 'East Pattaya', price: 8500000 },
    { title: 'Beachfront Condo', city: 'Na Jomtien', price: 5900000 },
  ];
  const p = placeholders[index] || placeholders[0];
  
  return (
    <div className="flex-shrink-0 w-[300px] md:w-auto snap-center">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full opacity-75">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <Home className="w-16 h-16 text-blue-200" />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-blue-400 text-white text-xs font-bold rounded-full">For Sale</span>
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

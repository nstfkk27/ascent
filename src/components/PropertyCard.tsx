import Image from 'next/image';
import Link from 'next/link';
import { PROPERTY_SUBTYPES, PROPERTY_CATEGORIES } from '@/lib/constants';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    rentPrice?: number | null;
    address: string;
    city: string;
    state: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    size: number;
    images: string[];
    category: string;
    houseType?: string | null;
    investmentType?: string | null;
    listingType: string;
    projectName?: string | null;
    updatedAt?: string;
    lastVerifiedAt?: string;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const getUpdatedLabel = () => {
    const ts = property.updatedAt || property.lastVerifiedAt;
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;

    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Updated today';
    if (days === 1) return 'Updated 1 day ago';
    return `Updated ${days} days ago`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CONDO':
      case 'HOUSE':
        return 'bg-[#8ea4d2] text-white';
      case 'INVESTMENT':
        return 'bg-[#496f5d] text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubtypeLabel = () => {
    if (property.houseType) return property.houseType.replace('_', ' ');
    if (property.investmentType) return property.investmentType.replace('_', ' ');
    return property.category;
  };

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getCategoryColor(property.category)}`}>
              {property.category}
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
              {property.listingType === 'BOTH' ? 'Sale & Rent' : (property.listingType === 'SALE' ? 'For Sale' : 'For Rent')}
            </span>
          </div>
        </div>
        <div className="p-5">
          {getUpdatedLabel() && (
            <div
              className="text-xs text-gray-500 mb-2"
              title={property.updatedAt || property.lastVerifiedAt}
            >
              {getUpdatedLabel()}
            </div>
          )}
          <div className="flex justify-between items-start mb-2">
            <div>
              {property.projectName && (
                <p className="text-xs font-medium text-[#8ea4d2] mb-1 uppercase tracking-wide">
                  {property.projectName}
                </p>
              )}
              <h3 className="text-lg font-bold text-[#49516f] line-clamp-1 group-hover:text-[#496f5d] transition-colors">
                {property.title}
              </h3>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1 line-clamp-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.address}, {property.city}
          </p>

          <div className="mb-4 pb-4 border-b border-gray-100">
            {property.listingType === 'BOTH' ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#496f5d]">
                  ฿{Number(property.price).toLocaleString()}
                </span>
                {property.rentPrice && (
                  <span className="text-sm font-medium text-gray-500">
                    / ฿{Number(property.rentPrice).toLocaleString()}/mo
                  </span>
                )}
              </div>
            ) : property.listingType === 'RENT' ? (
              <p className="text-xl font-bold text-[#496f5d]">
                ฿{Number(property.rentPrice || property.price).toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
            ) : (
              <p className="text-xl font-bold text-[#496f5d]">
                ฿{Number(property.price).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-gray-600 text-sm">
            <div className="flex gap-4">
            {property.bedrooms && (
              <span className="flex items-center" title={`${property.bedrooms} Bedrooms`}>
                <svg className="w-4 h-4 mr-1.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center" title={`${property.bathrooms} Bathrooms`}>
                <svg className="w-4 h-4 mr-1.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                {property.bathrooms}
              </span>
            )}
            <span className="flex items-center" title={`${property.size} Sqm`}>
              <svg className="w-4 h-4 mr-1.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.size?.toLocaleString() || 0} m²
            </span>
          </div>
          
          <span className="inline-block bg-gray-50 text-gray-600 rounded-lg px-2.5 py-1 text-xs font-medium border border-gray-100">
            {getSubtypeLabel()}
          </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Ruler, MapPin } from 'lucide-react';
import { PROPERTY_SUBTYPES, PROPERTY_CATEGORIES } from '@/lib/constants';
import PropertyActions from '@/components/property/PropertyActions';
import { createCompoundSlug } from '@/utils/propertyHelpers';

interface PropertyCardProps {
  property: {
    id: string;
    slug?: string;
    referenceId?: string;
    title: string;
    price: number;
    rentPrice?: number | null;
    address: string;
    city: string;
    state: string;
    area?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    size: number;
    floor?: number | null;
    images: string[];
    category: string;
    houseType?: string | null;
    investmentType?: string | null;
    listingType: string;
    projectName?: string | null;
    createdAt?: string;
    updatedAt?: string;
    lastVerifiedAt?: string;
    // Scoring fields
    dealQuality?: string | null;
    overallScore?: number | null;
    locationScore?: number | null;
    valueScore?: number | null;
    investmentScore?: number | null;
    estimatedRentalYield?: number | null;
    keyFeatures?: string[];
    // Commission fields
    agentCommissionRate?: number | null;
    commissionAmount?: number | null;
    // Engagement
    viewCount?: number | null;
    enquiryCount?: number | null;
  };
  showScores?: boolean;
}

export default function PropertyCard({ property, showScores = true }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageSwiping, setIsImageSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const images = property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      e.preventDefault();
      e.stopPropagation();
      setIsImageSwiping(true);
      if (diff > 0 && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isImageSwiping) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => setIsImageSwiping(false), 0);
      return false;
    }
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Check if property is new (created within last 7 days)
  const isJustListed = () => {
    if (!property.createdAt) return false;
    const created = new Date(property.createdAt);
    if (isNaN(created.getTime())) return false;
    const daysSinceCreated = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreated <= 7;
  };

  // Check if property is "hot" (high engagement)
  const isHot = () => {
    const views = property.viewCount || 0;
    const enquiries = property.enquiryCount || 0;
    return views >= 50 || enquiries >= 5;
  };

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

  // Generate property URL - use slug if available, otherwise fall back to ID
  const propertyUrl = property.slug 
    ? `/properties/${createCompoundSlug(property.slug, property.id)}`
    : `/properties/${property.id}`;
  
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col group">
      <Link href={propertyUrl} className="block h-full flex flex-col" onClick={handleCardClick}>
        <div 
          className="relative h-56 sm:h-64 overflow-hidden flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image Carousel */}
          <div 
            className="flex transition-transform duration-300 ease-out h-full"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.slice(0, 5).map((img, index) => (
              <div key={index} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={img}
                  alt={`${property.title} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          {/* Dot Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'bg-white w-4' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-premium backdrop-blur-sm ${getCategoryColor(property.category)}`}>
              {property.category}
            </span>
          </div>
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <span className="glass px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-soft">
              {property.listingType === 'BOTH' ? 'Sale & Rent' : (property.listingType === 'SALE' ? 'For Sale' : 'For Rent')}
            </span>
            {isJustListed() && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md animate-pulse">
                ✨ Just Listed
              </span>
            )}
            {isHot() && !isJustListed() && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                🔥 Hot
              </span>
            )}
          </div>
          
        </div>
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          {/* Title Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 mb-2">
              {property.title}
            </h3>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-2">
                <Bed className="w-8 h-8 text-[#8ea4d2]" />
                <span>{property.bedrooms}B</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="w-8 h-8 text-[#8ea4d2]" />
                <span>{property.bathrooms}Ba</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Ruler className="w-8 h-8 text-[#8ea4d2]" />
              <span>{property.size?.toLocaleString() || 0}m²</span>
            </div>
          </div>

          {/* Price & Action Section */}
          <div className="border-t border-gray-100 pt-2">
            {/* Price - Larger */}
            {property.listingType === 'BOTH' ? (
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ฿{Number(property.price).toLocaleString()}
                </span>
                {property.rentPrice && (
                  <span className="text-xs font-medium text-gray-500">
                    / ฿{Number(property.rentPrice).toLocaleString()}/mo
                  </span>
                )}
              </div>
            ) : property.listingType === 'RENT' ? (
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-3">
                ฿{Number(property.rentPrice || property.price).toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
            ) : (
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-3">
                ฿{Number(property.price).toLocaleString()}
              </div>
            )}

            {/* Bottom Row: Area Left, Action Buttons Right */}
            <div className="flex items-center justify-between">
              {/* Location - Bottom Left */}
              <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                <svg className="w-3 h-3 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{property.area || property.city}</span>
              </p>

              {/* Action Buttons - Right */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const wishlistBtn = document.querySelector(`[data-wishlist-${property.id}]`) as HTMLButtonElement;
                    wishlistBtn?.click();
                  }}
                  className="text-gray-600 hover:text-red-500 font-medium transition-colors"
                >
                  Wish
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const compareBtn = document.querySelector(`[data-compare-${property.id}]`) as HTMLButtonElement;
                    compareBtn?.click();
                  }}
                  className="text-gray-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Compare
                </button>
                <span className="text-gray-300">|</span>
                <Link href={propertyUrl} className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  Detail
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

'use client';

import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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
    e.preventDefault();
    e.stopPropagation();
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
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
    <Link href={propertyUrl} className="block group h-full">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-premium transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] h-full flex flex-col">
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
            {showScores && property.dealQuality && property.dealQuality !== 'FAIR' && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                property.dealQuality === 'SUPER_DEAL' ? 'bg-green-500 text-white' :
                property.dealQuality === 'GOOD_VALUE' ? 'bg-emerald-400 text-white' :
                property.dealQuality === 'HIGH_YIELD' ? 'bg-amber-500 text-white' :
                'bg-red-400 text-white'
              }`}>
                {property.dealQuality === 'SUPER_DEAL' ? '🔥 Super Deal' :
                 property.dealQuality === 'GOOD_VALUE' ? '✓ Good Value' :
                 property.dealQuality === 'HIGH_YIELD' ? '📈 High Yield' :
                 '⚠️ Overpriced'}
              </span>
            )}
            {(property.agentCommissionRate && property.agentCommissionRate > 0) || (property.commissionAmount && property.commissionAmount > 0) ? (
              <span className="px-2 py-1 rounded-full text-xs font-bold shadow-sm bg-blue-500 text-white backdrop-blur-sm">
                💰 Commission
              </span>
            ) : null}
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
          {/* Location - Top */}
          <p className="text-xs text-gray-500 flex items-center gap-1 line-clamp-1 mb-2">
            <svg className="w-3 h-3 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{property.area || property.city}</span>
          </p>

          {/* Title Section */}
          <div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300 mb-2">
              {property.title}
            </h3>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{property.bedrooms}B</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                <span>{property.bathrooms}Ba</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-[#8ea4d2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{property.size?.toLocaleString() || 0}m²</span>
            </div>
          </div>

          {/* Score & Price Section */}
          <div className="border-t border-gray-100 pt-2">
            {/* Score badges */}
            {showScores && (property.overallScore || property.estimatedRentalYield) && (
              <div className="flex items-center gap-2 mb-2 text-xs">
                {property.overallScore && property.overallScore > 0 && (
                  <div className="flex items-center gap-1" title={`Overall Score: ${property.overallScore}/100`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      property.overallScore >= 75 ? 'bg-green-500' :
                      property.overallScore >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-gray-500">{property.overallScore}</span>
                  </div>
                )}
                {property.estimatedRentalYield && property.estimatedRentalYield > 0 && (
                  <span className="text-gray-500" title="Estimated Rental Yield">
                    {property.estimatedRentalYield.toFixed(1)}% yield
                  </span>
                )}
              </div>
            )}
            
            {/* Price */}
            {property.listingType === 'BOTH' ? (
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  ฿{Number(property.price).toLocaleString()}
                </span>
                {property.rentPrice && (
                  <span className="text-xs font-medium text-gray-500">
                    / ฿{Number(property.rentPrice).toLocaleString()}/mo
                  </span>
                )}
              </div>
            ) : property.listingType === 'RENT' ? (
              <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-3">
                ฿{Number(property.rentPrice || property.price).toLocaleString()}<span className="text-xs font-normal text-gray-500">/mo</span>
              </div>
            ) : (
              <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-3">
                ฿{Number(property.price).toLocaleString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 text-xs pt-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Trigger wishlist action
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
                  // Trigger comparison action
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
  );
}

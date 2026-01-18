'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';
import PropertyActions from '@/components/property/PropertyActions';
import { extractIdFromSlug } from '@/utils/propertyHelpers';
import { PROPERTY_HIGHLIGHTS } from '@/lib/highlights';
import NearbyPOIs from '@/components/property/NearbyPOIs';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    async function fetchProperty() {
      try {
        // Extract UUID from compound slug (e.g., "luxury-villa-a1b2c3d4" -> "a1b2c3d4")
        // If it's already a UUID, extractIdFromSlug will return null and we use params.id directly
        const uuidFragment = extractIdFromSlug(params.id);
        const propertyId = uuidFragment || params.id;
        
        const response = await fetch(`/api/properties/${propertyId}`);
        const result = await response.json();
        
        console.log('Property API response:', result);
        
        if (result.success) {
          console.log('Property data:', result.data);
          console.log('Property agentId:', result.data?.agentId);
          setProperty(result.data);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }
    
    // Fetch current user profile
    async function fetchCurrentUser() {
      try {
        const res = await fetch('/api/agent/me');
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch current user', error);
      }
    }
    
    fetchProperty();
    fetchCurrentUser();
  }, [params.id]);

  useEffect(() => {
    async function fetchAgent() {
      if (!property?.agentId) {
        return;
      }
      
      try {
        const response = await fetch(`/api/agents/${property.agentId}`);
        
        if (!response.ok) {
          // Agent not found or deleted - use fallback
          setAgent({
            name: 'Ascent',
            phone: null,
            email: null,
            lineId: null,
          });
          return;
        }
        
        const result = await response.json();
        
        if (result?.success && result.data) {
          const agentData = result.data.agent || result.data;
          setAgent(agentData);
        } else {
          // Fallback to default
          setAgent({
            name: 'Ascent',
            phone: null,
            email: null,
            lineId: null,
          });
        }
      } catch (err) {
        // Fallback to default on error
        setAgent({
          name: 'Ascent',
          phone: null,
          email: null,
          lineId: null,
        });
      }
    }

    if (property) {
      fetchAgent();
    }
  }, [property]);

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#496f5d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#49516f] mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link href="/properties" className="text-[#496f5d] hover:text-[#8ea4d2] font-semibold">
            ← Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-[100vw]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link 
          href="/properties"
          className="inline-flex items-center gap-2 text-[#49516f] hover:text-[#8ea4d2] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full min-w-0">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full">
              {/* Header: Location & ID */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold">
                    {property.city}
                    {property.area && ` > ${property.area}`}
                  </span>
                </div>
                {property.referenceId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">ID:</span>
                    <span className="text-xs font-mono font-bold text-[#496f5d] bg-gray-100 px-2 py-1 rounded">
                      {property.referenceId}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Image */}
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200">
                <Image
                  src={property.images[selectedImage]}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                {property.featured && (
                  <span className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                    HOT DEAL
                  </span>
                )}
              </div>

              {/* Thumbnail Grid */}
              <div className="p-2 sm:p-4 grid grid-cols-4 gap-1 sm:gap-2 overflow-hidden">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 sm:h-24 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 sm:ring-4 ring-[#496f5d]' : 'opacity-70 hover:opacity-100'
                    } transition-all`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-[#49516f] break-words">{property.title}</h1>
                </div>
              </div>

              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {/* Sale Price */}
                  {(property.listingType === 'SALE' || property.listingType === 'BOTH') && property.price && (
                    <div className="flex flex-wrap items-baseline gap-1 sm:gap-3 mb-3">
                      <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-[#496f5d]">
                        ฿{Number(property.price).toLocaleString()}
                      </span>
                      {property.listingType === 'BOTH' && (
                        <span className="text-xl text-gray-600">Sale Price</span>
                      )}
                    </div>
                  )}
                  
                  {/* Rent Price */}
                  {(property.listingType === 'RENT' || property.listingType === 'BOTH') && (property as any).rentPrice && (
                    <div className="flex flex-wrap items-baseline gap-1 sm:gap-3">
                      <span className={`font-bold text-[#496f5d] ${property.listingType === 'BOTH' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-5xl'}`}>
                        ฿{Number((property as any).rentPrice).toLocaleString()}
                      </span>
                      <span className="text-base sm:text-xl text-gray-600">/ month</span>
                    </div>
                  )}
                  
                  {/* Price per sqm */}
                  {property.size && Number(property.size) > 0 && (
                    <div className="mt-2 text-gray-600">
                      {property.price && (property.listingType === 'SALE' || property.listingType === 'BOTH') && (
                        <div>
                          <span className="text-lg font-semibold">
                            ฿{(Number(property.price) / Number(property.size)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/m²
                          </span>
                          <span className="text-sm text-gray-500 ml-2">per sqm (sale)</span>
                        </div>
                      )}
                      {(property as any).rentPrice && (property.listingType === 'RENT' || property.listingType === 'BOTH') && (
                        <div>
                          <span className="text-lg font-semibold">
                            ฿{(Number((property as any).rentPrice) / Number(property.size)).toLocaleString(undefined, { maximumFractionDigits: 0 })}/m²
                          </span>
                          <span className="text-sm text-gray-500 ml-2">per sqm (rent)</span>
                        </div>
                      )}
                    </div>
                  )}
                  {(!property.size || Number(property.size) === 0) && (
                    <div className="mt-2 text-xs text-gray-400">
                      (Size not specified)
                    </div>
                  )}
                </div>
                <PropertyActions propertyId={property.id} variant="default" showLabels={true} />
              </div>

              {/* Commission Section - Role-based visibility */}
              {currentUser && (property.agentCommissionRate || property.commissionAmount) && (
                <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💰</span>
                    <h3 className="text-lg font-bold text-blue-900">
                      {currentUser.id === property.agentId ? 'Your Commission Sharing' : 'Commission Available'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.agentCommissionRate && property.agentCommissionRate > 0 && (
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Share Rate</p>
                        <p className="text-2xl font-bold text-blue-900">{property.agentCommissionRate}%</p>
                      </div>
                    )}
                    {property.commissionAmount && property.commissionAmount > 0 && (
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Fixed Amount</p>
                        <p className="text-2xl font-bold text-blue-900">฿{Number(property.commissionAmount).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {currentUser.id !== property.agentId && (
                    <p className="text-xs text-blue-700 mt-3">
                      💡 This listing offers commission sharing. Contact the listing agent to collaborate.
                    </p>
                  )}
                </div>
              )}

              {/* House Features */}
              {property.category === 'HOUSE' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#49516f] mb-4">Property Features</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-semibold text-[#49516f]">{property.houseType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🛏️</span>
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold text-[#49516f]">{property.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🚿</span>
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-semibold text-[#49516f]">{property.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📐</span>
                      <div>
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-semibold text-[#49516f]">{property.size} m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🚗</span>
                      <div>
                        <p className="text-sm text-gray-600">Parking</p>
                        <p className="font-semibold text-[#49516f]">{property.parking} Cars</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <p className="text-sm text-gray-600">Floors</p>
                        <p className="font-semibold text-[#49516f]">{property.floors}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {property.pool && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🏊 Swimming Pool
                      </span>
                    )}
                    {property.garden && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🌳 Garden
                      </span>
                    )}
                    {property.petFriendly && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🐕 Pet Friendly
                      </span>
                    )}
                    {property.furnished && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🛋️ Furnished
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Condo Features */}
              {property.category === 'CONDO' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#49516f] mb-4">Property Features</h2>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Project Name</p>
                    <p className="text-2xl font-bold text-[#496f5d]">{property.projectName}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🛏️</span>
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold text-[#49516f]">{property.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🚿</span>
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-semibold text-[#49516f]">{property.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📐</span>
                      <div>
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-semibold text-[#49516f]">{property.size} m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <p className="text-sm text-gray-600">Floor Level</p>
                        <p className="font-semibold text-[#49516f]">{property.floor}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {property.petFriendly && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🐕 Pet Friendly
                      </span>
                    )}
                    {property.furnished && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        🛋️ Furnished
                      </span>
                    )}
                  </div>

                  {property.amenities && (
                    <div>
                      <h3 className="text-xl font-bold text-[#49516f] mb-4">Building Amenities</h3>
                      <div className="flex flex-wrap gap-3">
                        {property.amenities.swimmingPool && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🏊 Swimming Pool
                          </span>
                        )}
                        {property.amenities.gym && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            💪 Gym
                          </span>
                        )}
                        {property.amenities.sauna && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🧖 Sauna
                          </span>
                        )}
                        {(property.amenities.security || property.amenities.security24h) && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🔒 24h Security
                          </span>
                        )}
                        {property.amenities.parking && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🚗 Parking
                          </span>
                        )}
                        {property.amenities.garden && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🌳 Garden
                          </span>
                        )}
                        {property.amenities.playground && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🎪 Playground
                          </span>
                        )}
                        {property.amenities.coworking && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            💻 Co-working
                          </span>
                        )}
                        {property.amenities.library && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            📚 Library
                          </span>
                        )}
                        {property.amenities.shuttleBus && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            🚌 Shuttle Bus
                          </span>
                        )}
                        
                        {/* Views */}
                        {property.amenities.cityView && (
                          <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                            🏙️ City View
                          </span>
                        )}
                        {property.amenities.poolView && (
                          <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                            🏊 Pool View
                          </span>
                        )}
                        {property.amenities.seaView && (
                          <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                            🌊 Sea View
                          </span>
                        )}
                        {property.amenities.gardenView && (
                          <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                            🌳 Garden View
                          </span>
                        )}
                        {property.amenities.coWorkingSpace && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            💼 Co-Working Space
                          </span>
                        )}
                        {property.amenities.sauna && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            ♨️ Sauna
                          </span>
                        )}
                        {property.amenities.library && (
                          <span className="px-4 py-2 bg-[#8ea4d2] text-white rounded-full text-sm font-semibold">
                            📚 Library
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Investment Features */}
              {property.category === 'INVESTMENT' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#49516f] mb-4">Business Details</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-semibold text-[#49516f]">{property.investmentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm text-gray-600">Open For</p>
                        <p className="font-semibold text-[#49516f]">{property.openForYears} Years</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">👥</span>
                      <div>
                        <p className="text-sm text-gray-600">Number of Staff</p>
                        <p className="font-semibold text-[#49516f]">{property.numberOfStaff}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">📐</span>
                      <div>
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-semibold text-[#49516f]">{property.size} m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <p className="text-sm text-gray-600">Equipment</p>
                        <p className="font-semibold text-[#49516f]">{property.equipmentIncluded}</p>
                      </div>
                    </div>
                    {property.monthlyRevenue && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="text-sm text-gray-600">Monthly Revenue</p>
                          <p className="font-semibold text-[#49516f]">฿{property.monthlyRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {property.license && (
                      <span className="px-4 py-2 bg-[#496f5d] text-white rounded-full text-sm font-semibold">
                        ✅ Licensed
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#49516f] mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Compact Enquiry */}
          <div className="lg:col-span-1 space-y-6 min-w-0">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#49516f] mb-4">Enquire Now</h3>
              
              {agent && (
                <div className="mb-6">
                  <p className="text-base font-bold text-[#49516f] mb-1">{agent.name || 'Ascent'}</p>
                  {agent.phone && (
                    <p className="text-sm text-gray-600">{agent.phone}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                {agent?.phone && (
                  <>
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5a4a] transition-colors text-sm font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${String(agent.phone).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </>
                )}
              </div>

              {agent?.lineId && (
                <a
                  href={`https://line.me/ti/p/~${encodeURIComponent(agent.lineId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00B900] text-white rounded-lg hover:bg-[#00A000] transition-colors text-sm font-semibold mb-3 w-full"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  Line
                </a>
              )}

              {agent?.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold w-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              )}
            </div>

            {/* Property & Area Highlights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#49516f] mb-4">Property & Area Highlights</h3>
              
              {/* Highlights Tags */}
              {property.highlights && property.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {property.highlights.map((highlightKey: string) => {
                    const highlight = PROPERTY_HIGHLIGHTS[highlightKey as keyof typeof PROPERTY_HIGHLIGHTS];
                    if (!highlight) return null;
                    return (
                      <div
                        key={highlightKey}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-300"
                      >
                        <span className="text-base">{highlight.icon}</span>
                        <span>{highlight.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nearby POIs */}
              {property.id && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-[#49516f] mb-3">📍 Nearby Places</h4>
                  <NearbyPOIs propertyId={property.id} />
                </div>
              )}

              {/* Location Info */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#496f5d] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">
                      {property.area && `${property.area}, `}{property.city}, {property.state}
                    </p>
                  </div>
                </div>

                {property.latitude && property.longitude && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#496f5d] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">View on Map</p>
                      <a 
                        href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#496f5d] hover:text-[#3d5a4a] font-semibold inline-block"
                      >
                        Open Google Maps →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

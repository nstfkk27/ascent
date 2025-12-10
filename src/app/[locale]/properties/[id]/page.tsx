'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types/property';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        const result = await response.json();
        
        if (result.success) {
          setProperty(result.data);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperty();
  }, [params.id]);
  
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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
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

      <div className="max-w-[1600px] mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative h-[500px] bg-gray-200">
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
              <div className="p-4 grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-24 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-4 ring-[#496f5d]' : 'opacity-70 hover:opacity-100'
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
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-4xl font-bold text-[#49516f] mb-4">{property.title}</h1>
              
              <div className="flex items-center gap-4 mb-6 text-gray-600">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.area ? `${property.area}, ` : ''}{property.city}, {property.state}
                </span>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold text-[#496f5d]">
                  ฿{Number(property.price).toLocaleString()}
                </span>
                <span className="text-xl text-gray-600 ml-2">
                  {property.listingType === 'RENT' ? '/ month' : ''}
                </span>
              </div>

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

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-2xl font-bold text-[#49516f] mb-6">Contact Agent</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
                    placeholder="+66 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
                    placeholder="I'm interested in this property..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#496f5d] text-white py-3 rounded-lg font-semibold hover:bg-[#3d5a4a] transition-colors"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Or contact us directly:</p>
                <div className="space-y-3">
                  <a href="tel:+66123456789" className="flex items-center gap-3 text-[#49516f] hover:text-[#8ea4d2]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +66 123 456 789
                  </a>
                  <a href="mailto:info@ascentpattaya.com" className="flex items-center gap-3 text-[#49516f] hover:text-[#8ea4d2]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@ascentpattaya.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

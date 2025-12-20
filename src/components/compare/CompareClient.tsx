'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { X, Home, Bed, Bath, Maximize, MapPin, Building2, Calendar, Users, Sparkles } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: string | null;
  rentPrice: string | null;
  category: string;
  houseType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number;
  floor: number | null;
  address: string;
  city: string;
  images: string[];
  listingType: string;
  petFriendly: boolean | null;
  furnished: boolean | null;
  pool: boolean | null;
  garden: boolean | null;
  parking: number | null;
  projectName: string | null;
  project: {
    id: string;
    name: string;
    type: string;
    developer: string | null;
    completionYear: number | null;
    totalUnits: number | null;
    totalFloors: number | null;
    totalBuildings: number | null;
    description: string | null;
    facilities: Array<{ id: string; name: string; imageUrl: string | null }>;
    imageUrl: string | null;
  } | null;
}

export default function CompareClient() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      const res = await fetch('/api/comparison');
      const data = await res.json();
      setProperties(data.comparison || []);
    } catch (error) {
      console.error('Error fetching comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = async (propertyId: string) => {
    try {
      await fetch(`/api/comparison?propertyId=${propertyId}`, {
        method: 'DELETE',
      });
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing from comparison:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#496f5d]"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Properties to Compare</h2>
        <p className="text-gray-600 mb-6">Add properties from search results to compare them side-by-side</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d] transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  const hasProjects = properties.some(p => p.project);

  return (
    <div className="space-y-8">
      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                  Property
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="px-6 py-4 min-w-[280px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromComparison(property.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link href={`/properties/${property.id}`}>
                        <div className="relative h-48 rounded-lg overflow-hidden mb-3 group cursor-pointer">
                          {property.images[0] ? (
                            <Image
                              src={property.images[0]}
                              alt={property.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Home className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1 hover:text-[#496f5d] transition-colors">
                          {property.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{property.city}</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Price */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  Price
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      {property.price && (
                        <div className="text-lg font-bold text-[#496f5d]">
                          ฿{Number(property.price).toLocaleString()}
                        </div>
                      )}
                      {property.rentPrice && (
                        <div className="text-sm font-semibold text-orange-600">
                          ฿{Number(property.rentPrice).toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  Type
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {property.category}
                      {property.houseType && ` - ${property.houseType.replace('_', ' ')}`}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    Bedrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {property.bedrooms || 'Studio'}
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4" />
                    Bathrooms
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {property.bathrooms || '-'}
                  </td>
                ))}
              </tr>

              {/* Size */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  <div className="flex items-center gap-2">
                    <Maximize className="w-4 h-4" />
                    Size
                  </div>
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {property.size} m²
                    {property.price && (
                      <div className="text-xs text-gray-500 mt-1">
                        ฿{Math.round(Number(property.price) / property.size).toLocaleString()}/m²
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Floor */}
              {properties.some(p => p.floor) && (
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    Floor Level
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {property.floor || '-'}
                    </td>
                  ))}
                </tr>
              )}

              {/* Features */}
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                  Features
                </td>
                {properties.map((property) => (
                  <td key={property.id} className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {property.furnished && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Furnished</span>
                      )}
                      {property.petFriendly && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">Pet Friendly</span>
                      )}
                      {property.pool && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Pool</span>
                      )}
                      {property.garden && (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs">Garden</span>
                      )}
                      {property.parking && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{property.parking} Parking</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Comparison */}
      {hasProjects && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#496f5d] to-[#3d5c4d]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Project Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                    Project Details
                  </th>
                  {properties.map((property) => (
                    <th key={property.id} className="px-6 py-4 min-w-[280px]">
                      <div className="text-sm font-semibold text-gray-900">
                        {property.project?.name || property.projectName || 'Standalone Property'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Developer */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    Developer
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {property.project?.developer || '-'}
                    </td>
                  ))}
                </tr>

                {/* Completion Year */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Completion
                    </div>
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {property.project?.completionYear || '-'}
                    </td>
                  ))}
                </tr>

                {/* Total Units */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Total Units
                    </div>
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {property.project?.totalUnits || '-'}
                    </td>
                  ))}
                </tr>

                {/* Floors */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    Total Floors
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {property.project?.totalFloors || '-'}
                    </td>
                  ))}
                </tr>

                {/* Facilities */}
                <tr className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white hover:bg-gray-50 px-6 py-4 font-semibold text-gray-900 text-sm">
                    Facilities
                  </td>
                  {properties.map((property) => (
                    <td key={property.id} className="px-6 py-4">
                      {property.project?.facilities && property.project.facilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {property.project.facilities.slice(0, 6).map((facility) => (
                            <span key={facility.id} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                              {facility.name}
                            </span>
                          ))}
                          {property.project.facilities.length > 6 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{property.project.facilities.length - 6} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-sm text-gray-500">-</div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Home, Bed, Bath, Maximize, MapPin, Trash2 } from 'lucide-react';

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
  address: string;
  city: string;
  images: string[];
  listingType: string;
  projectName: string | null;
  project: {
    name: string;
  } | null;
}

export default function WishlistClient() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('/api/wishlist');
      const data = await res.json();
      setProperties(data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    try {
      await fetch(`/api/wishlist?propertyId=${propertyId}`, {
        method: 'DELETE',
      });
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
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
          <Heart className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-600 mb-6">Start adding properties you love to keep track of them</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d] transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
          <Link href={`/properties/${property.id}`}>
            <div className="relative h-56 bg-gray-200">
              {property.images[0] ? (
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Listing Type Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  property.listingType === 'SALE' 
                    ? 'bg-blue-500 text-white' 
                    : property.listingType === 'RENT'
                    ? 'bg-orange-500 text-white'
                    : 'bg-purple-500 text-white'
                }`}>
                  {property.listingType}
                </span>
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(property.id);
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-red-500 hover:text-white transition-colors group/btn"
                title="Remove from wishlist"
              >
                <Heart className="w-5 h-5 fill-current text-red-500 group-hover/btn:text-white" />
              </button>
            </div>
          </Link>

          <div className="p-5">
            <Link href={`/properties/${property.id}`}>
              <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-[#496f5d] transition-colors line-clamp-2">
                {property.title}
              </h3>
            </Link>

            {/* Project Name */}
            {(property.project?.name || property.projectName) && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                <Home className="w-4 h-4" />
                <span className="truncate">{property.project?.name || property.projectName}</span>
              </div>
            )}

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{property.city}</span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms || 'Studio'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms || '-'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span>{property.size}m²</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-gray-100 pt-4">
              {property.price && (
                <div className="text-xl font-bold text-[#496f5d]">
                  ฿{Number(property.price).toLocaleString()}
                  <span className="text-sm text-gray-500 font-normal ml-2">
                    (฿{Math.round(Number(property.price) / property.size).toLocaleString()}/m²)
                  </span>
                </div>
              )}
              {property.rentPrice && (
                <div className="text-lg font-semibold text-orange-600 mt-1">
                  ฿{Number(property.rentPrice).toLocaleString()}/month
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Link
                href={`/properties/${property.id}`}
                className="flex-1 px-4 py-2 bg-[#496f5d] text-white text-center rounded-lg hover:bg-[#3d5c4d] transition-colors text-sm font-medium"
              >
                View Details
              </Link>
              <button
                onClick={() => removeFromWishlist(property.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

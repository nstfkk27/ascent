'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Copy, Share2, Edit, Plus, Home, ExternalLink, Facebook, MessageCircle } from 'lucide-react';
import { createCompoundSlug } from '@/utils/propertyHelpers';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id');
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!propertyId) {
      router.push('/agent');
      return;
    }

    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setProperty(data.data);
      } else {
        router.push('/agent');
      }
    } catch (error) {
      console.error('Failed to fetch property:', error);
      router.push('/agent');
    } finally {
      setLoading(false);
    }
  };

  const propertyUrl = property?.slug 
    ? `${window.location.origin}/properties/${createCompoundSlug(property.slug, property.id)}`
    : `${window.location.origin}/properties/${propertyId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Check out this property: ${property?.title}\n${propertyUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareLine = () => {
    const text = `Check out this property: ${property?.title}\n${propertyUrl}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#496f5d] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#49516f] mb-2">
            Listing Created Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your property is now live and visible to buyers
          </p>
        </div>

        {/* Property Preview Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          {/* Property Image */}
          <div className="relative h-80 bg-gray-100">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg">
                LIVE
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#49516f] mb-2">{property.title}</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.address}, {property.city}
              </p>
            </div>

            <div className="flex items-center gap-6 mb-6 text-gray-700">
              <div className="text-3xl font-bold text-[#496f5d]">
                ฿{Number(property.price || property.rentPrice || 0).toLocaleString()}
                {property.listingType === 'RENT' && <span className="text-lg font-normal text-gray-500">/mo</span>}
              </div>
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{property.bedrooms}</span>
                  <span className="text-sm text-gray-500">beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{property.bathrooms}</span>
                  <span className="text-sm text-gray-500">baths</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="font-semibold">{property.size}</span>
                <span className="text-sm text-gray-500">m²</span>
              </div>
            </div>

            {/* URL Section */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Listing URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={propertyUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
                />
                <button
                  onClick={copyUrl}
                  className="px-4 py-2 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d] transition-colors flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share Your Listing
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={shareWhatsApp}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
                <button
                  onClick={shareLine}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00B900] text-white rounded-lg hover:bg-[#00A000] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Line
                </button>
                <button
                  onClick={shareFacebook}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button
                  onClick={copyUrl}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  More
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href={`/properties/${property.slug ? createCompoundSlug(property.slug, property.id) : property.id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d] transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View Live
              </Link>
              <Link
                href={`/agent/edit/${property.id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <Link
                href="/agent/create"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create New
              </Link>
              <Link
                href="/agent"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="text-lg font-bold text-[#49516f] mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Tips to Get More Enquiries
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Add more photos</p>
                <p className="text-sm text-gray-600">
                  Listings with 8+ photos get 3x more enquiries. You have {property.images?.length || 0} photos.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Share on social media</p>
                <p className="text-sm text-gray-600">
                  Post to Facebook groups, Line groups, and WhatsApp status to reach more buyers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Verify details regularly</p>
                <p className="text-sm text-gray-600">
                  Update your listing every 2 weeks to keep it fresh and ranked higher in search.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">Respond quickly to enquiries</p>
                <p className="text-sm text-gray-600">
                  Agents who respond within 2 hours close 5x more deals. Check your dashboard regularly.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ListingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#496f5d] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

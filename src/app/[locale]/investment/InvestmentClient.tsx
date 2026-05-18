'use client';

import { useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { Building2, Hotel, UtensilsCrossed, Wine, Sparkles, Heart, CheckCircle2, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface Property {
  id: string;
  slug?: string | null;
  referenceId?: string | null;
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
  createdAt?: string | null;
  updatedAt?: string | null;
  lastVerifiedAt?: string | null;
  dealQuality?: string | null;
  overallScore?: number | null;
  locationScore?: number | null;
  valueScore?: number | null;
  investmentScore?: number | null;
  estimatedRentalYield?: number | null;
  keyFeatures?: string[] | null;
  agentCommissionRate?: number | null;
  commissionAmount?: number | null;
  viewCount?: number | null;
  enquiryCount?: number | null;
}

interface InvestmentClientProps {
  properties: Property[];
  typeCounts: Record<string, number>;
}

const businessTypes = [
  { 
    value: 'HOTEL', 
    label: 'Hotels', 
    icon: Hotel,
    description: 'Established hotels with existing bookings and reputation',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  { 
    value: 'RESTAURANT', 
    label: 'Restaurants', 
    icon: UtensilsCrossed,
    description: 'Turn-key restaurants with kitchen equipment and customer base',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200'
  },
  { 
    value: 'CLUB_BAR', 
    label: 'Bars & Clubs', 
    icon: Wine,
    description: 'Profitable bars and nightlife venues ready to operate',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  { 
    value: 'MASSAGE', 
    label: 'Massage & Spa', 
    icon: Sparkles,
    description: 'Wellness centers with trained staff and loyal clientele',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200'
  },
  { 
    value: 'WELLNESS', 
    label: 'Wellness Centers', 
    icon: Heart,
    description: 'Health and wellness businesses with established operations',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
];

const benefits = [
  {
    icon: TrendingUp,
    title: 'Immediate Revenue',
    desc: 'Start earning from day one with existing customers and bookings',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  {
    icon: Users,
    title: 'Trained Staff',
    desc: 'Experienced team already familiar with daily operations',
    color: 'text-orange-500',
    bg: 'bg-orange-50'
  },
  {
    icon: ShieldCheck,
    title: 'Lower Risk',
    desc: 'Proven business models with historical financial data',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50'
  }
];

export default function InvestmentClient({ properties, typeCounts }: InvestmentClientProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredProperties = selectedType === 'ALL' 
    ? properties 
    : properties.filter(p => p.investmentType === selectedType);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Premium Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent z-10" />
          <Image
            src="/og-image.jpg"
            alt="Pattaya Cityscape"
            fill
            className="object-cover object-center"
            priority
            onError={(e) => {
              // Fallback to solid color if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.backgroundColor = '#1f2937';
            }}
          />
        </div>

        <div className="container relative z-20 mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium mb-6 border border-amber-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Profitable Businesses for Sale
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Business for Sale in <span className="text-amber-400">Pattaya</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light leading-relaxed">
              Find profitable hotels, restaurants, bars, and commercial properties for sale. Turnkey businesses with proven revenue from ฿2M.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {['Established Customer Base', 'Trained Staff Included', 'Proven Revenue History', 'Turn-Key Operations'].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Filter Section */}
      <section className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex overflow-x-auto pb-2 -mb-2 hide-scrollbar gap-3 justify-start lg:justify-center">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                selectedType === 'ALL'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              All Businesses ({properties.length})
            </button>
            {businessTypes.map(type => {
              const Icon = type.icon;
              const isSelected = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300 border ${
                    isSelected
                      ? `${type.bg} ${type.color} ${type.border} shadow-lg scale-105 ring-1 ring-inset ${type.border.replace('border-', 'ring-')}`
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? '' : 'opacity-70'}`} />
                  {type.label}
                  <span className={`ml-1 text-sm ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>
                    ({typeCounts[type.value] || 0})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Property Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Selected Type Header */}
          {selectedType !== 'ALL' && (
            <div className="mb-10 text-center animate-fade-in-up">
              {businessTypes.map(type => {
                if (type.value === selectedType) {
                  const Icon = type.icon;
                  return (
                    <div key={type.value} className="max-w-2xl mx-auto">
                      <div className={`inline-flex p-4 rounded-2xl ${type.bg} ${type.color} mb-4`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        {type.label} for Sale in Pattaya
                      </h2>
                      <p className="text-lg text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {filteredProperties.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No listings available</h3>
              <p className="text-gray-500 text-lg mb-6">We&apos;re currently updating our inventory for this category.</p>
              <button
                onClick={() => setSelectedType('ALL')}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
              >
                View all available businesses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProperties.map(property => (
                <div key={property.id} className="transition-transform duration-300 hover:-translate-y-1">
                  <PropertyCard property={{
                    ...property,
                    slug: property.slug || undefined,
                    referenceId: property.referenceId || undefined,
                    area: property.area || null,
                    projectName: property.projectName || undefined,
                    createdAt: property.createdAt || undefined,
                    updatedAt: property.updatedAt || undefined,
                    lastVerifiedAt: property.lastVerifiedAt || undefined,
                    keyFeatures: property.keyFeatures || [],
                  }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section - Modern Cards */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-amber-500 uppercase mb-3">Why Invest in Pattaya</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
              The Smart Way to Enter the Market
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl ${benefit.bg} ${benefit.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO Content Section - Clean Typography */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg prose-gray">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Business for Sale Opportunities in Pattaya
              </h2>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mt-0 mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
                  Buying a Business in Pattaya
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Buying a business for sale in Pattaya means acquiring an existing, operational business rather than starting from scratch. In Pattaya&apos;s vibrant market, this includes hotels, restaurants, bars, massage spas, wellness centers, and commercial buildings that already have customers, staff, equipment, and proven revenue streams. Perfect for investors seeking immediate income.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Popular Business Types</h4>
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span><strong>Hotels:</strong> Benefit from year-round tourism</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span><strong>Restaurants:</strong> Loyal local and tourist customers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span><strong>Bars & Nightlife:</strong> High-traffic entertainment venues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span><strong>Wellness:</strong> Booming health tourism market</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">How We Help</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    We specialize in business transfers in Pattaya, providing comprehensive support throughout the entire takeover process.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">• Financial verification</li>
                    <li className="flex items-center gap-2">• Legal documentation</li>
                    <li className="flex items-center gap-2">• Staff transition assistance</li>
                    <li className="flex items-center gap-2">• Post-sale support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Compare Business Types for Sale</h2>
              <p className="text-gray-600">Find the right business investment for your budget and goals</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Business Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Price Range</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Monthly Revenue</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">ROI</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Beach Bar</td>
                    <td className="px-6 py-4 text-gray-600">฿3-8M</td>
                    <td className="px-6 py-4 text-gray-600">฿150-400K</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">12-18%</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">High foot traffic areas</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Restaurant</td>
                    <td className="px-6 py-4 text-gray-600">฿4-12M</td>
                    <td className="px-6 py-4 text-gray-600">฿200-600K</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">10-15%</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">Food enthusiasts</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Massage Spa</td>
                    <td className="px-6 py-4 text-gray-600">฿2-6M</td>
                    <td className="px-6 py-4 text-gray-600">฿100-300K</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">15-20%</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">Wellness market</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Boutique Hotel</td>
                    <td className="px-6 py-4 text-gray-600">฿15-40M</td>
                    <td className="px-6 py-4 text-gray-600">฿500K-1.5M</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">8-12%</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">Long-term investment</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Nightclub</td>
                    <td className="px-6 py-4 text-gray-600">฿8-20M</td>
                    <td className="px-6 py-4 text-gray-600">฿400K-1M</td>
                    <td className="px-6 py-4 text-emerald-600 font-semibold">10-16%</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">Entertainment district</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">*ROI estimates based on average market performance. Actual returns may vary.</p>
          </div>
        </div>
      </section>

      {/* Businesses by Location */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Businesses for Sale by Pattaya Area</h2>
              <p className="text-lg text-gray-600">Each area offers unique opportunities for different business types</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Jomtien Beach */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="text-2xl">🏖️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Jomtien Beach</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Quieter beach area perfect for family-friendly restaurants, beachfront bars, guesthouses, and wellness centers. Popular with long-term expats and families.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Beach Bars</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Restaurants</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Guesthouses</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿3-10M</p>
              </div>

              {/* Walking Street */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Walking Street</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Pattaya&apos;s famous entertainment hub. High-traffic nightclubs, bars, and entertainment venues with premium pricing. Best for nightlife businesses.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Nightclubs</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Bars</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Entertainment</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿8-25M</p>
              </div>

              {/* Naklua/Wongamat */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="text-2xl">🏨</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Naklua/Wongamat</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Upscale area with luxury hotels, fine dining restaurants, and wellness centers. Attracts high-end tourists and expats seeking premium services.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Hotels</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Fine Dining</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Wellness</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿10-40M</p>
              </div>

              {/* Central Pattaya */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Central Pattaya</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Commercial hub with retail shops, restaurants, commercial buildings, and mixed-use properties. High foot traffic and diverse customer base.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Retail</span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Commercial</span>
                  <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">Restaurants</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿5-20M</p>
              </div>

              {/* Pratumnak Hill */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                    <span className="text-2xl">⛰️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pratumnak Hill</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Scenic hillside location ideal for boutique hotels, rooftop restaurants, wellness retreats, and romantic dining venues with sea views.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Boutique Hotels</span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Rooftop Bars</span>
                  <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">Wellness</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿6-18M</p>
              </div>

              {/* Soi Buakhao */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <span className="text-2xl">🍺</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Soi Buakhao</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Popular expat area with affordable bars, restaurants, massage shops, and small hotels. Great for budget-conscious investors seeking steady income.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">Bars</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">Massage</span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">Small Hotels</span>
                </div>
                <p className="text-sm text-gray-500">Avg. Price: ฿2-8M</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">Everything you need to know about buying a business in Pattaya</p>
            </div>

            <div className="space-y-6">
              {/* FAQ 1 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How much does it cost to buy a business in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Business prices in Pattaya range from ฿2M for small massage shops or bars to ฿40M+ for established hotels. Most restaurants and bars fall in the ฿4-12M range. The price depends on location, size, revenue history, and included assets like equipment and licenses.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Can foreigners buy a business in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes, foreigners can buy businesses in Pattaya. However, certain business types require Thai majority ownership (51%). Common structures include setting up a Thai Limited Company or partnering with Thai nationals. We provide full legal support to ensure compliant ownership structures.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What are the best businesses to buy in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  The most profitable businesses in Pattaya are beach bars (12-18% ROI), massage spas (15-20% ROI), and restaurants in high-traffic areas (10-15% ROI). Hotels offer stable long-term returns (8-12% ROI). The best choice depends on your budget, experience, and involvement level.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How profitable are bars in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Well-located bars in Pattaya typically generate ฿150-400K monthly revenue with 12-18% annual ROI. Walking Street and beach locations command premium prices but offer higher returns. Success depends on location, management, and maintaining good relationships with staff and customers.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What documents do I need to buy a business in Thailand?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Required documents include: passport and visa, proof of funds, business registration documents, tax clearance certificates, lease agreements, staff contracts, licenses (liquor, food, massage), and financial records. We assist with due diligence and document verification throughout the process.
                </p>
              </div>

              {/* FAQ 6 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Are there financing options for buying a business in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Financing options include seller financing (common for established businesses), Thai bank loans (requires Thai company structure), international lenders, or private investors. Many sellers offer payment plans with 30-50% down payment. We can connect you with financing partners.
                </p>
              </div>

              {/* FAQ 7 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How long does it take to buy a business in Pattaya?</h3>
                <p className="text-gray-600 leading-relaxed">
                  The typical timeline is 4-8 weeks from offer to completion. This includes due diligence (1-2 weeks), legal documentation (2-3 weeks), license transfers (1-2 weeks), and staff transition (1 week). Turnkey businesses with clear documentation can close faster.
                </p>
              </div>

              {/* FAQ 8 */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What is included when buying a turnkey business?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Turnkey businesses include all equipment, furniture, inventory, existing staff, customer database, operating licenses, supplier contracts, and training from the current owner. You can start operating immediately with minimal setup. All our listings clearly specify what&apos;s included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Styles for hide-scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

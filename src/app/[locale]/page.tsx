import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { MapPin, ArrowRight, User, Home, Users, Star, Quote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import HeroSearch from '@/components/HeroSearch';
import VideoSection from '@/components/VideoSection';
import NewsKnowledgeSection from '@/components/NewsKnowledgeSection';
import PropertyCategoriesSection from '@/components/PropertyCategoriesSection';

interface Agent {
  name: string;
  role: string;
  color: string;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}

export default function LandingPage() {
  return <LandingPageContent />;
}

async function LandingPageContent() {
  const t = await getTranslations('HomePage');

  let displayAgents: Agent[] = [
    { name: "Sarah Johnson", role: "Real Estate Consultant", color: "bg-emerald-100" },
    { name: "Michael Chen", role: "Real Estate Consultant", color: "bg-blue-100" }
  ];

  // Fetch agents
  try {
    const dbAgents = await prisma.agentProfile.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      take: 2
    });
    if (dbAgents.length > 0) {
      displayAgents = dbAgents.map((a) => ({
        name: a.name,
        role: "Real Estate Consultant",
        color: "bg-gray-100",
        imageUrl: a.imageUrl,
        phone: a.phone,
        email: a.email
      }));
    }
  } catch (e) {
    console.warn("Could not fetch agents from DB");
  }

  // Fetch posts for News & Knowledge section
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    category: 'LOCAL_NEWS' | 'LEGAL' | 'VISA';
    coverImage: string | null;
    createdAt: string;
    authorName: string | null;
  }> = [];

  try {
    const dbPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 9, // 3 per category
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        coverImage: true,
        createdAt: true,
        authorName: true,
      },
    });
    posts = dbPosts.map(p => ({
      ...p,
      category: p.category as 'LOCAL_NEWS' | 'LEGAL' | 'VISA',
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (e) {
    console.warn("Could not fetch posts from DB");
  }

  // Fetch projects for In Construction section
  let projects: Array<{
    id: string;
    name: string;
    type: string;
    city: string;
    imageUrl: string | null;
    completionYear: number | null;
    developer: string | null;
  }> = [];

  try {
    const dbProjects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        imageUrl: true,
        completionYear: true,
        developer: true,
      },
    });
    projects = dbProjects.map(p => ({
      ...p,
      type: p.type as string,
    }));
  } catch (e) {
    console.warn("Could not fetch projects from DB");
  }

  // Fetch rental properties
  let rentalProperties: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    rentPrice?: number | undefined;
    address: string;
    city: string;
    state: string;
    area?: string | null;
    size: number;
    images: string[];
    category: string;
    listingType: string;
    bedrooms: number | null;
    bathrooms: number | null;
    createdAt?: string;
    updatedAt?: string;
    lastVerifiedAt?: string;
    featured?: boolean;
    dealQuality?: string | null;
    overallScore?: number | null;
    estimatedRentalYield?: number | null;
    agentCommissionRate?: number | null;
    commissionAmount?: number | null;
    viewCount?: number | null;
    enquiryCount?: number | null;
  }> = [];

  try {
    const dbRental = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE',
        listingType: 'RENT',
        category: { in: ['CONDO', 'HOUSE'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        rentPrice: true,
        address: true,
        city: true,
        state: true,
        area: true,
        size: true,
        images: true,
        category: true,
        listingType: true,
        bedrooms: true,
        bathrooms: true,
        createdAt: true,
        updatedAt: true,
        lastVerifiedAt: true,
        featured: true,
        dealQuality: true,
        overallScore: true,
        estimatedRentalYield: true,
        agentCommissionRate: true,
        commissionAmount: true,
      },
    });
    rentalProperties = dbRental.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      rentPrice: Number(p.rentPrice) || undefined,
      size: Number(p.size) || 0,
      category: p.category as string,
      listingType: p.listingType as string,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
      lastVerifiedAt: p.lastVerifiedAt?.toISOString(),
      overallScore: p.overallScore ? Number(p.overallScore) : undefined,
      estimatedRentalYield: p.estimatedRentalYield ? Number(p.estimatedRentalYield) : undefined,
      agentCommissionRate: p.agentCommissionRate ? Number(p.agentCommissionRate) : undefined,
      commissionAmount: p.commissionAmount ? Number(p.commissionAmount) : undefined,
    }));
  } catch (e) {
    console.warn("Could not fetch rental properties from DB");
  }

  // Fetch land properties
  let landProperties: Array<{
    id: string;
    slug: string;
    title: string;
    price: number;
    rentPrice?: number | undefined;
    address: string;
    city: string;
    state: string;
    area?: string | null;
    size: number;
    images: string[];
    category: string;
    listingType: string;
    bedrooms: number | null;
    bathrooms: number | null;
    createdAt?: string;
    updatedAt?: string;
    lastVerifiedAt?: string;
    featured?: boolean;
    dealQuality?: string | null;
    overallScore?: number | null;
    estimatedRentalYield?: number | null;
    agentCommissionRate?: number | null;
    commissionAmount?: number | null;
  }> = [];

  try {
    const dbLand = await prisma.property.findMany({
      where: {
        status: 'AVAILABLE',
        category: 'LAND',
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        rentPrice: true,
        address: true,
        city: true,
        state: true,
        area: true,
        size: true,
        images: true,
        category: true,
        listingType: true,
        bedrooms: true,
        bathrooms: true,
        createdAt: true,
        updatedAt: true,
        lastVerifiedAt: true,
        featured: true,
        dealQuality: true,
        overallScore: true,
        estimatedRentalYield: true,
        agentCommissionRate: true,
        commissionAmount: true,
      },
    });
    landProperties = dbLand.map(p => ({
      ...p,
      price: Number(p.price) || 0,
      rentPrice: Number(p.rentPrice) || undefined,
      size: Number(p.size) || 0,
      category: p.category as string,
      listingType: p.listingType as string,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
      lastVerifiedAt: p.lastVerifiedAt?.toISOString(),
      overallScore: p.overallScore ? Number(p.overallScore) : undefined,
      estimatedRentalYield: p.estimatedRentalYield ? Number(p.estimatedRentalYield) : undefined,
      agentCommissionRate: p.agentCommissionRate ? Number(p.agentCommissionRate) : undefined,
      commissionAmount: p.commissionAmount ? Number(p.commissionAmount) : undefined,
    }));
  } catch (e) {
    console.warn("Could not fetch land properties from DB");
  }

  return (
    <main className="min-h-screen font-sans text-gray-900">
      
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              <span className="text-gray-600">{t('heroTitle')}</span> <br />
              <span className="text-[#496f5d] font-bold">
                {t('heroHighlight')}
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
            
            {/* Hero Search */}
            <HeroSearch />
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[20%] left-[50%] w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="py-10 bg-[#49516f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-3 gap-8 md:gap-16">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl md:text-5xl font-bold text-white mb-1">50+</div>
              <div className="text-sm text-white/80 font-medium">Active Listings</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl md:text-5xl font-bold text-white mb-1">100+</div>
              <div className="text-sm text-white/80 font-medium">Deals Closed</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl md:text-5xl font-bold text-white mb-1">5+</div>
              <div className="text-sm text-white/80 font-medium">Years in Pattaya</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Property Categories Section */}
      <PropertyCategoriesSection 
        projects={projects}
        rentalProperties={rentalProperties}
        landProperties={landProperties}
      />

      {/* 3. Motto Section */}
      <section className="py-32 bg-[#49516f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif italic text-white mb-8 leading-tight">
            &quot;{t('motto')}&quot;
          </h2>
          <div className="w-24 h-1 bg-[#496f5d] mx-auto mb-8"></div>
          <p className="text-xl text-gray-300 font-light">
            {t('mottoSub')}
          </p>
        </div>
      </section>

      {/* 4. News and Knowledge */}
      <NewsKnowledgeSection posts={posts} />

      {/* 5. Our Agents */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl font-bold text-[#49516f] mb-4">{t('meetExperts')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            {t('meetExpertsSub')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-3xl mx-auto">
            {displayAgents.map((agent: Agent, i: number) => (
              <div key={i} className="group relative">
                <div className="aspect-square rounded-full mx-auto w-40 h-40 mb-6 relative overflow-hidden ring-4 ring-gray-50 group-hover:ring-[#496f5d]/20 transition-all">
                    {agent.imageUrl ? (
                      <Image src={agent.imageUrl} alt={agent.name} width={160} height={160} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`absolute inset-0 ${agent.color} flex items-center justify-center`}>
                          <User className="w-16 h-16 text-gray-400/50" />
                      </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-[#49516f]">{agent.name}</h3>
                <p className="text-[#496f5d] font-medium text-sm">{agent.role}</p>
                
                <div className="mt-4 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-2 text-gray-400 hover:text-[#496f5d]">
                        <span className="sr-only">Email</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-[#496f5d]">
                        <span className="sr-only">Phone</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#496f5d]/10 rounded-full px-4 py-2 mb-6">
              <Quote className="w-4 h-4 text-[#496f5d]" />
              <span className="text-[#496f5d] text-sm font-medium">Client Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#49516f] mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from investors who trusted us with their property journey
            </p>
          </div>

          {/* Phone UI Testimonials - Horizontal scroll on mobile, 3 in row on desktop */}
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {[
              {
                name: "Paul",
                role: "Villa Tenant",
                text: "I rent a villa with Stefan, he verified all the documents needed for me and helped me to get a villa that I wanted.",
                rating: 5,
              },
              {
                name: "Flavio",
                role: "Condo Owner",
                text: "I saw Nicky taking a photo of a building, he looked sharp and professional so I asked him for his WhatsApp. Later on we bought a condo with him.",
                rating: 5,
              },
              {
                name: "Tony and Da",
                role: "Condo Owners",
                text: "We walked by their office and they seemed nice. I was looking for a nice seaview and they introduced me to Riviera Jomtien - it's perfect for me.",
                rating: 5,
              }
            ].map((testimonial, i) => (
              <div key={i} className="flex-shrink-0 w-[280px] md:w-auto snap-center">
                {/* Phone Frame */}
                <div className="relative mx-auto">
                  {/* Phone outer frame */}
                  <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                    {/* Phone inner bezel */}
                    <div className="bg-gray-800 rounded-[2rem] p-1">
                      {/* Phone screen */}
                      <div className="bg-white rounded-[1.75rem] overflow-hidden">
                        {/* Notch */}
                        <div className="flex justify-center pt-2 pb-1 bg-white">
                          <div className="w-20 h-6 bg-gray-900 rounded-full"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="px-5 pb-6 pt-2">
                          {/* Stars */}
                          <div className="flex gap-1 mb-3 justify-center">
                            {[...Array(testimonial.rating)].map((_, j) => (
                              <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          
                          {/* Quote */}
                          <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
                            &quot;{testimonial.text}&quot;
                          </p>
                          
                          {/* Divider */}
                          <div className="w-12 h-0.5 bg-[#496f5d]/20 mx-auto mb-4"></div>
                          
                          {/* Author */}
                          <div className="text-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#496f5d] to-[#49516f] rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="font-semibold text-[#49516f] text-sm">{testimonial.name}</div>
                            <div className="text-xs text-gray-500">{testimonial.role}</div>
                          </div>
                        </div>
                        
                        {/* Home indicator */}
                        <div className="flex justify-center pb-2">
                          <div className="w-24 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll indicator for mobile */}
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            <span className="text-xs text-gray-400">Swipe to see more</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </section>

      {/* 7. Video Reels / Social Content */}
      <VideoSection />

    </main>
  );
}

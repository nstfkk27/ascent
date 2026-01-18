import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { MapPin, ArrowRight, User, Calendar, Newspaper, Play, ExternalLink, Home, Users, Star, Quote } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import HeroSearch from '@/components/HeroSearch';

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

      {/* 2. Search Feature Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-[#496f5d] mb-2 uppercase tracking-wide text-sm">{t('featureTitle')}</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-[#49516f] mb-6">
                {t('featureSubtitle')} <span className="underline decoration-[#496f5d] decoration-4 underline-offset-4">{t('featureSubtitleHighlight')}</span>
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t('featureDescription')}
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  t('feature1'),
                  t('feature2'),
                  t('feature3')
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-gray-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-[#496f5d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-[#49516f] hover:bg-[#384059] transition-all"
              >
                {t('ctaMap')}
              </Link>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100 aspect-[4/3] group">
                {/* Simulated Map Interface */}
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-16 h-16 text-[#496f5d] mx-auto mb-4 animate-bounce" />
                        <span className="text-gray-500 font-medium">Interactive Map Preview</span>
                    </div>
                </div>
                {/* Overlay Elements imitating UI */}
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                    <div className="h-10 bg-white/90 backdrop-blur rounded-lg flex-1 shadow-sm"></div>
                    <div className="h-10 w-10 bg-[#496f5d] rounded-lg shadow-sm"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-32 bg-white/90 backdrop-blur rounded-xl shadow-lg p-4">
                    <div className="w-1/2 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-[#496f5d]/0 group-hover:bg-[#496f5d]/10 transition-colors duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* 4. News and Articles */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#49516f]">{t('marketInsights')}</h2>
              <p className="mt-2 text-gray-600">{t('marketInsightsSub')}</p>
            </div>
            <Link href="#" className="hidden md:flex items-center text-[#496f5d] font-semibold hover:underline">
              {t('viewArticles')} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Why Pattaya&apos;s Condo Market is Booming in 2025",
                category: "Market Trend",
                date: "Dec 8, 2025",
                image: "bg-blue-100"
              },
              {
                title: "Top 5 Areas for High ROI Investment",
                category: "Investment",
                date: "Dec 5, 2025",
                image: "bg-green-100"
              },
              {
                title: "New Foreign Ownership Laws Explained",
                category: "Legal",
                date: "Nov 28, 2025",
                image: "bg-orange-100"
              }
            ].map((article, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100">
                <div className={`h-48 ${article.image} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
                        <Newspaper className="w-12 h-12 opacity-50" />
                    </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-xs font-semibold text-[#496f5d] mb-3 uppercase tracking-wider">
                    {article.category}
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-gray-400 flex items-center normal-case font-normal">
                        <Calendar className="w-3 h-3 mr-1" /> {article.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#49516f] mb-3 group-hover:text-[#496f5d] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="#" className="inline-flex items-center text-[#496f5d] font-semibold hover:underline">
              {t('viewArticles')} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Thompson",
                role: "Property Investor, UK",
                text: "Found my dream pool villa in Jomtien within 2 weeks. The team understood exactly what I was looking for and made the whole process seamless.",
                rating: 5,
                image: null
              },
              {
                name: "Anna Petrov",
                role: "Condo Owner, Russia",
                text: "Professional service from start to finish. They helped me find a great investment condo with excellent rental yield. Highly recommend!",
                rating: 5,
                image: null
              },
              {
                name: "David Chen",
                role: "Business Owner, Singapore",
                text: "Bought a commercial property for my business. Their market knowledge and negotiation skills saved me significant money. True professionals.",
                rating: 5,
                image: null
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative">
                <div className="absolute -top-4 left-8">
                  <div className="w-8 h-8 bg-[#496f5d] rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &quot;{testimonial.text}&quot;
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#496f5d] to-[#49516f] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-[#49516f]">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Video Reels / Social Content */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-[#49516f] to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Play className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">Watch & Learn</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pattaya Property Insights
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Quick tours, market tips, and local insights from our team
            </p>
          </div>

          {/* Video Reels Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Jomtien Beach Walk", views: "12K", duration: "0:45", gradient: "from-blue-500 to-cyan-400" },
              { title: "Pool Villa Tour", views: "8.5K", duration: "1:20", gradient: "from-emerald-500 to-teal-400" },
              { title: "Condo Market 2025", views: "15K", duration: "0:58", gradient: "from-purple-500 to-pink-400" },
              { title: "Investment Tips", views: "22K", duration: "1:05", gradient: "from-orange-500 to-red-400" },
            ].map((video, i) => (
              <a 
                key={i} 
                href="#" 
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-80`}></div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
                  <span className="text-white text-xs font-medium">{video.duration}</span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-white/70 text-xs">{video.views} views</p>
                </div>
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span className="font-medium">TikTok</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span className="font-medium">Instagram</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-full transition-all duration-300 border border-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="font-medium">YouTube</span>
              <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}

import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { MapPin, ArrowRight, User, Calendar, Newspaper } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';

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
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
              {t('heroTitle')} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 animate-float">
                {t('heroHighlight')}
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/search"
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 transition-all duration-500 shadow-premium hover:shadow-glow transform hover:scale-105"
              >
                {t('ctaExplore')} 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[20%] left-[50%] w-[400px] h-[400px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
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

    </main>
  );
}

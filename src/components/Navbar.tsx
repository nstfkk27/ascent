'use client';

import { Link } from '@/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Search, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex text-2xl font-bold text-[#49516f] hover:text-[#8ea4d2] transition-colors tracking-tight leading-none pb-1">
              Ascent
            </Link>

            <Link 
              href="/search" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#496f5d] hover:bg-gray-50 rounded-full transition-all group"
            >
              <Search className="w-5 h-5 text-gray-500 group-hover:text-[#496f5d]" />
              <span className="font-medium">Find</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            {/* <Link href="/properties" className="text-gray-600 hover:text-[#496f5d] font-medium transition-colors">
              Find Property
            </Link> */}
            
            {/* House Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('house')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center text-gray-600 group-hover:text-[#496f5d] font-medium transition-colors py-2">
                House
                <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-[''] bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 transform origin-top-left ${openDropdown === 'house' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <Link href="/properties?subtype=HOUSE" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Rent and Sale
                </Link>
                <Link href="/properties?subtype=POOL_VILLA" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Pool Villa
                </Link>
                <Link href="/properties?subtype=HOUSE&tag=new" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  New Project
                </Link>
                <Link href="/properties?subtype=HOUSE&tag=renovation" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  For Renovation
                </Link>
              </div>
            </div>

            {/* Condo Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('condo')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center text-gray-600 group-hover:text-[#496f5d] font-medium transition-colors py-2">
                Condo
                <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-[''] bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 transform origin-top-left ${openDropdown === 'condo' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <Link href="/properties?subtype=CONDO" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Rent and Sale
                </Link>
                <Link href="/properties?subtype=CONDO&tag=new" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  New Project
                </Link>
                <Link href="/properties?subtype=CONDO&city=Pattaya" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Condo In Pattaya
                </Link>
              </div>
            </div>

            {/* Land Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('land')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center text-gray-600 group-hover:text-[#496f5d] font-medium transition-colors py-2">
                Land
                <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-[''] bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 transform origin-top-left ${openDropdown === 'land' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <Link href="/properties?category=LAND" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  All Land
                </Link>
                <Link href="/properties?category=LAND&listingType=SALE" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Land for Sale
                </Link>
                <Link href="/properties?category=LAND&listingType=RENT" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Land for Rent
                </Link>
              </div>
            </div>

            {/* Investment Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setOpenDropdown('investment')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center text-gray-600 group-hover:text-[#496f5d] font-medium transition-colors py-2">
                Investment
                <svg className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 mt-1 w-56 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-[''] bg-white rounded-xl shadow-xl border border-gray-100 py-2 transition-all duration-200 transform origin-top-left ${openDropdown === 'investment' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <Link href="/properties?subtype=HOTEL" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Hotel
                </Link>
                <Link href="/properties?category=BUSINESS&businessType=club" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Club and Bar
                </Link>
                <Link href="/properties?category=BUSINESS&businessType=massage" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Massage
                </Link>
                <Link href="/properties?category=BUSINESS&businessType=restaurant" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Restaurant
                </Link>
                <Link href="/properties?category=BUSINESS&businessType=wellness" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Wellness
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/listing"
              className="px-4 py-2 bg-[#496f5d] text-white text-sm font-medium rounded-full hover:bg-[#3d5c4d] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              {t('addListing')}
            </Link>
            
            {user ? (
              <Link
                href="/agent"
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 border border-gray-200 rounded-full hover:border-[#496f5d] transition-all duration-300 group bg-white"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-[#496f5d] transition-colors relative">
                  {user.user_metadata?.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      fill
                      className="object-cover" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#496f5d] text-white text-sm font-bold">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#496f5d] max-w-[100px] truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-full hover:border-[#496f5d] hover:text-[#496f5d] transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{t('login')}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#496f5d] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-20 shadow-xl flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-6 space-y-6 pb-20">
            {/* Search Bar Mobile */}
            <div className="flex items-center justify-between mb-6">
              <Link 
                href="/search" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl text-gray-600 flex-grow mr-4"
              >
                <Search className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Find Properties</span>
              </Link>
              <LanguageSwitcher />
            </div>

            <div className="space-y-6">
              {/* House Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">House</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?subtype=HOUSE" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Rent and Sale</Link>
                  <Link href="/properties?subtype=POOL_VILLA" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Pool Villa</Link>
                  <Link href="/properties?subtype=HOUSE&tag=new" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">New Project</Link>
                  <Link href="/properties?subtype=HOUSE&tag=renovation" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">For Renovation</Link>
                </div>
              </div>

              {/* Condo Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Condo</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?subtype=CONDO" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Rent and Sale</Link>
                  <Link href="/properties?subtype=CONDO&tag=new" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">New Project</Link>
                  <Link href="/properties?subtype=CONDO&city=Pattaya" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Condo In Pattaya</Link>
                </div>
              </div>

              {/* Land Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Land</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?category=LAND" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">All Land</Link>
                  <Link href="/properties?category=LAND&listingType=SALE" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Land for Sale</Link>
                  <Link href="/properties?category=LAND&listingType=RENT" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Land for Rent</Link>
                </div>
              </div>

              {/* Investment Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Investment</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?subtype=HOTEL" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Hotel</Link>
                  <Link href="/properties?category=BUSINESS&businessType=club" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Club and Bar</Link>
                  <Link href="/properties?category=BUSINESS&businessType=massage" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Massage</Link>
                  <Link href="/properties?category=BUSINESS&businessType=restaurant" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Restaurant</Link>
                  <Link href="/properties?category=BUSINESS&businessType=wellness" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Wellness</Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">For Owners</div>
              <Link 
                href="/listing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-[#496f5d] font-semibold"
              >
                {t('addListing')}
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {user ? (
                <Link
                  href="/agent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 relative">
                    {user.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#496f5d] text-white text-sm font-bold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.user_metadata?.full_name || 'Agent'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-6 bg-[#496f5d] text-white rounded-xl justify-center font-bold"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

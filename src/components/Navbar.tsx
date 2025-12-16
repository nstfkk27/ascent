'use client';

import { Link } from '@/navigation';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { Search, Menu, X, LayoutDashboard, Users, Home, LogOut, Calculator, Building, PlusCircle, Rocket, Upload, Inbox, FileText, MessageSquare, List, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [agentProfile, setAgentProfile] = useState<{ name?: string; companyName?: string; role?: string } | null>(null);
  const supabase = createClient();
  const desktopProfileRef = useRef<HTMLDivElement>(null);
  const mobileProfileButtonRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch agent profile for display name
      if (user) {
        try {
          const res = await fetch('/api/agent/me');
          if (res.ok) {
            const data = await res.json();
            setAgentProfile({ name: data.name, companyName: data.companyName, role: data.role });
          }
        } catch (e) {
          console.error('Failed to fetch agent profile', e);
        }
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const clickedInDesktop = !!desktopProfileRef.current?.contains(targetNode);
      const clickedInMobileButton = !!mobileProfileButtonRef.current?.contains(targetNode);
      const clickedInMobileMenu = !!mobileProfileMenuRef.current?.contains(targetNode);

      if (!clickedInDesktop && !clickedInMobileButton && !clickedInMobileMenu) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    
    // Sign out on client side first
    await supabase.auth.signOut();
    
    // Also call server-side logout to ensure cookies are cleared properly
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Continue even if server logout fails - client logout already succeeded
    }
    
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-12">
        {/* Mobile Header: Hamburger | Find | LOGO | Profile */}
        <div className="flex md:hidden items-center h-14">
          {/* Left side - fixed width */}
          <div className="w-20 flex items-center gap-1">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#496f5d] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link 
              href="/search" 
              className="p-2 text-gray-600 hover:text-[#496f5d] transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="text-xl font-bold text-[#49516f]">
              Ascent
            </Link>
          </div>
          
          {/* Right side - fixed width to match left */}
          <div className="w-20 flex items-center justify-end" ref={mobileProfileButtonRef}>
            {user ? (
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 relative"
              >
                {user.user_metadata?.avatar_url ? (
                  <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#496f5d] text-white text-sm font-bold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            ) : (
              <Link href="/login" className="p-2 text-gray-600 hover:text-[#496f5d]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center h-14">
          {/* Left: Logo + Find - fixed width to balance right side */}
          <div className="w-48 flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold text-[#49516f] hover:text-[#8ea4d2] transition-colors">
              Ascent
            </Link>
            <Link 
              href="/search" 
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#496f5d] font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Find</span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="flex-1 flex items-center justify-center space-x-6">
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
                <Link href="/properties?category=HOUSE" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Rent and Sale
                </Link>
                <Link href="/properties?category=HOUSE&subtype=POOL_VILLA" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Pool Villa
                </Link>
                <Link href="/properties?category=HOUSE&newProject=true" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  New Project
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
                <Link href="/properties?category=CONDO" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Rent and Sale
                </Link>
                <Link href="/properties?category=CONDO&newProject=true" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  New Project
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
                  Rent and Sale
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
                <Link href="/properties?category=INVESTMENT&subtype=HOTEL" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Hotel
                </Link>
                <Link href="/properties?category=INVESTMENT&subtype=CLUB_BAR" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Club and Bar
                </Link>
                <Link href="/properties?category=INVESTMENT&subtype=MASSAGE" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Massage
                </Link>
                <Link href="/properties?category=INVESTMENT&subtype=RESTAURANT" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Restaurant
                </Link>
                <Link href="/properties?category=INVESTMENT&subtype=WELLNESS" className="block px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#496f5d] transition-colors">
                  Wellness
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Side Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/listing"
              className="px-4 py-2 bg-[#496f5d] text-white text-sm font-medium rounded-full hover:bg-[#3d5c4d] transition-all shadow-sm hover:shadow-md"
            >
              Owner
            </Link>
            
            {user ? (
              <div className="relative" ref={desktopProfileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 border border-gray-200 rounded-full hover:border-[#496f5d] hover:shadow-sm transition-all group bg-white"
                >
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#496f5d] to-[#3d5c4d] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {user.user_metadata?.avatar_url ? (
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        fill
                        className="object-cover" 
                        unoptimized
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {(agentProfile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#496f5d] max-w-[100px] truncate">
                    {agentProfile?.name || agentProfile?.companyName || user.user_metadata?.full_name || 'Profile'}
                  </span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{agentProfile?.name || user.user_metadata?.full_name || 'Agent'}</p>
                      <p className="text-xs text-gray-500 truncate">{agentProfile?.companyName || user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/agent/create"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create Listing
                      </Link>
                      <Link
                        href="/agent"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/agent/crm"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        CRM
                      </Link>
                      <Link
                        href="/agent/management"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <Building className="w-4 h-4" />
                        Property Management
                      </Link>
                      <Link
                        href="/agent/tools"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <Calculator className="w-4 h-4" />
                        Smart Tools
                      </Link>
                      <Link
                        href="/agent/listings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d] transition-colors"
                      >
                        <List className="w-4 h-4" />
                        My Listings
                      </Link>
                    </div>
                    {/* Admin Tools - only for SUPER_ADMIN */}
                    {agentProfile?.role === 'SUPER_ADMIN' && (
                      <div className="border-t border-gray-100 py-1">
                        <div className="px-4 py-1.5">
                          <span className="text-xs font-semibold text-gray-400 uppercase">Admin Tools</span>
                        </div>
                        <Link href="/agent/submissions" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <FileText className="w-4 h-4" /> Submissions
                        </Link>
                        <Link href="/agent/marketing" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <Rocket className="w-4 h-4" /> Marketing Center
                        </Link>
                        <Link href="/agent/import" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <Upload className="w-4 h-4" /> Bulk Import
                        </Link>
                        <Link href="/agent/leads" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <Inbox className="w-4 h-4" /> Leads Inbox
                        </Link>
                        <Link href="/agent/team" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <Users className="w-4 h-4" /> Team Management
                        </Link>
                        <Link href="/agent/project-manager" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <Building className="w-4 h-4" /> Project Manager
                        </Link>
                      </div>
                    )}
                    {/* Submissions for PLATFORM_AGENT */}
                    {agentProfile?.role === 'PLATFORM_AGENT' && (
                      <div className="border-t border-gray-100 py-1">
                        <Link href="/agent/submissions" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#496f5d]">
                          <FileText className="w-4 h-4" /> Submissions
                        </Link>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

          </div>
      </div>

      {/* Mobile Profile Dropdown (positioned below mobile header) */}
      {showProfileMenu && user && (
        <div ref={mobileProfileMenuRef} className="md:hidden absolute right-4 top-16 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata?.full_name || 'Agent'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/agent/create" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <PlusCircle className="w-4 h-4" /> Create Listing
            </Link>
            <Link href="/agent" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/agent/crm" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Users className="w-4 h-4" /> CRM
            </Link>
            <Link href="/agent/management" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Building className="w-4 h-4" /> Management
            </Link>
            <Link href="/agent/tools" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Calculator className="w-4 h-4" /> Tools
            </Link>
            <Link href="/agent/listings" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <List className="w-4 h-4" /> My Listings
            </Link>
          </div>
          {/* Admin Tools - mobile */}
          {agentProfile?.role === 'SUPER_ADMIN' && (
            <div className="border-t border-gray-100 py-1">
              <div className="px-4 py-1.5"><span className="text-xs font-semibold text-gray-400 uppercase">Admin</span></div>
              <Link href="/agent/submissions" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><FileText className="w-4 h-4" /> Submissions</Link>
              <Link href="/agent/marketing" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Rocket className="w-4 h-4" /> Marketing</Link>
              <Link href="/agent/import" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Upload className="w-4 h-4" /> Import</Link>
              <Link href="/agent/leads" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Inbox className="w-4 h-4" /> Leads</Link>
              <Link href="/agent/team" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Users className="w-4 h-4" /> Team</Link>
            </div>
          )}
          {agentProfile?.role === 'PLATFORM_AGENT' && (
            <div className="border-t border-gray-100 py-1">
              <Link href="/agent/submissions" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><FileText className="w-4 h-4" /> Submissions</Link>
            </div>
          )}
          <div className="border-t border-gray-100 pt-1">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu (Navigation only - no agent tools) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-16 shadow-xl flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-4 space-y-4 pb-20">
            {/* Language Switcher */}
            <div className="flex justify-end">
              <LanguageSwitcher />
            </div>

            <div className="space-y-4">
              {/* House Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">House</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?category=HOUSE" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Rent and Sale</Link>
                  <Link href="/properties?category=HOUSE&subtype=POOL_VILLA" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Pool Villa</Link>
                  <Link href="/properties?category=HOUSE&newProject=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">New Project</Link>
                </div>
              </div>

              {/* Condo Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Condo</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?category=CONDO" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Rent and Sale</Link>
                  <Link href="/properties?category=CONDO&newProject=true" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">New Project</Link>
                </div>
              </div>

              {/* Land Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Land</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?category=LAND" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Rent and Sale</Link>
                </div>
              </div>

              {/* Investment Section */}
              <div className="space-y-2">
                <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">Investment</div>
                <div className="pl-4 space-y-1">
                  <Link href="/properties?category=INVESTMENT&subtype=HOTEL" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Hotel</Link>
                  <Link href="/properties?category=INVESTMENT&subtype=CLUB_BAR" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Club and Bar</Link>
                  <Link href="/properties?category=INVESTMENT&subtype=MASSAGE" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Massage</Link>
                  <Link href="/properties?category=INVESTMENT&subtype=RESTAURANT" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Restaurant</Link>
                  <Link href="/properties?category=INVESTMENT&subtype=WELLNESS" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600">Wellness</Link>
                </div>
              </div>
            </div>

            {/* For Owners */}
            <div className="space-y-2">
              <div className="font-bold text-[#49516f] text-lg border-b border-gray-100 pb-2">For Owners</div>
              <Link 
                href="/listing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-[#496f5d] font-semibold"
              >
                List Your Property
              </Link>
            </div>

            {/* Login for non-users */}
            {!user && (
              <div className="pt-4 border-t border-gray-100">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-3 px-6 bg-[#496f5d] text-white rounded-xl justify-center font-bold"
                >
                  Login / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

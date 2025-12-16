'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, Building2, Rocket, Upload, Inbox, FileText, Users, MessageSquare, Calculator, Home, LogOut, ChevronLeft, Briefcase, List, Menu, X } from 'lucide-react';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/agent/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        }
      } catch (error) {
        console.error('Failed to fetch role', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return null;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isPlatformAgent = role === 'PLATFORM_AGENT';
  const isInternalAgent = isSuperAdmin || isPlatformAgent;

  const isActive = (path: string) => {
    if (path === '/agent') return pathname === '/agent' || pathname === '/en/agent' || pathname === '/th/agent';
    return pathname?.includes(path);
  };

  const navClass = (path: string) => `flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all ${isActive(path) ? 'bg-[#496f5d] text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  const SidebarContent = () => (
    <>
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        <Link onClick={() => setMobileNavOpen(false)} href="/agent" className={navClass('/agent')}><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
        <Link onClick={() => setMobileNavOpen(false)} href="/agent/listings" className={navClass('/agent/listings')}><List className="w-5 h-5" /> My Listings</Link>
        <Link onClick={() => setMobileNavOpen(false)} href="/agent/create" className={navClass('/agent/create')}><PlusCircle className="w-5 h-5" /> Create Listing</Link>
        {isSuperAdmin && (<>
          <div className="px-6 pt-4 pb-2"><span className="text-xs font-semibold text-gray-400 uppercase">Admin Tools</span></div>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/project-manager" className={navClass('/agent/project-manager')}><Building2 className="w-5 h-5" /> Project Manager</Link>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/marketing" className={navClass('/agent/marketing')}><Rocket className="w-5 h-5" /> Marketing Center</Link>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/import" className={navClass('/agent/import')}><Upload className="w-5 h-5" /> Bulk Import</Link>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/leads" className={navClass('/agent/leads')}><Inbox className="w-5 h-5" /> Leads Inbox</Link>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/posts/create" className={navClass('/agent/posts/create')}><MessageSquare className="w-5 h-5" /> Create Post</Link>
          <Link onClick={() => setMobileNavOpen(false)} href="/agent/team" className={navClass('/agent/team')}><Users className="w-5 h-5" /> Team Management</Link>
        </>)}
        {isInternalAgent && <Link onClick={() => setMobileNavOpen(false)} href="/agent/submissions" className={navClass('/agent/submissions')}><FileText className="w-5 h-5" /> Submissions</Link>}
        <div className="px-6 pt-4 pb-2"><span className="text-xs font-semibold text-gray-400 uppercase">Agent Tools</span></div>
        <Link onClick={() => setMobileNavOpen(false)} href="/agent/crm" className={navClass('/agent/crm')}><Briefcase className="w-5 h-5" /> Smart CRM</Link>
        <Link onClick={() => setMobileNavOpen(false)} href="/agent/management" className={navClass('/agent/management')}><Home className="w-5 h-5" /> Property Management</Link>
        <Link onClick={() => setMobileNavOpen(false)} href="/agent/tools" className={navClass('/agent/tools')}><Calculator className="w-5 h-5" /> Smart Tools</Link>
      </nav>
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button onClick={async () => { setMobileNavOpen(false); await handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"><LogOut className="w-5 h-5" /> Sign Out</button>
        <Link href="/" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /> Back to Website</Link>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {mobileNavOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileNavOpen(false)} />}
      
      <aside className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-[#496f5d] to-[#3d5c4d] rounded-xl flex items-center justify-center"><span className="text-white font-bold text-lg">A</span></div>
              <div><h1 className="text-xl font-bold text-[#49516f]">Ascent</h1><p className="text-xs text-gray-400">{isSuperAdmin ? 'Super Admin' : isPlatformAgent ? 'Platform Agent' : 'Partner Agent'}</p></div>
            </Link>
            <button onClick={() => setMobileNavOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <SidebarContent />
        </div>
      </aside>

      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#496f5d] to-[#3d5c4d] rounded-xl flex items-center justify-center"><span className="text-white font-bold text-lg">A</span></div>
            <div><h1 className="text-xl font-bold text-[#49516f]">Ascent</h1><p className="text-xs text-gray-400">{isSuperAdmin ? 'Super Admin' : isPlatformAgent ? 'Platform Agent' : 'Partner Agent'}</p></div>
          </Link>
        </div>
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setMobileNavOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6 text-[#49516f]" /></button>
            <span className="text-xl font-bold text-[#49516f]">Ascent</span>
            <div className="w-10" />
          </div>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}

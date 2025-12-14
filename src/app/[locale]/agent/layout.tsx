'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/agent/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
          setDebugInfo(data);
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

  if (loading) return null; // Or a skeleton

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isPlatformAgent = role === 'PLATFORM_AGENT';
  const isExternalAgent = role === 'AGENT';

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">AgentHub</h1>
          <p className="text-sm text-gray-500">
            {isSuperAdmin ? 'Super Admin' : isPlatformAgent ? 'Platform Agent' : 'Partner Agent'}
          </p>
        </div>
        <nav className="mt-6 flex-1">
          <Link href="/agent" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/agent/create" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Create Listing
          </Link>
          
          {isSuperAdmin && (
            <>
              <Link href="/agent/project-manager" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Project Manager (3D)
              </Link>
              <Link href="/agent/marketing" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Marketing Center
              </Link>
              <Link href="/agent/import" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Bulk Import
              </Link>
              <Link href="/agent/leads" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Leads Inbox
              </Link>
              <Link href="/agent/submissions" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Submissions
              </Link>
              <Link href="/agent/posts/create" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Create Post
              </Link>
              <Link href="/agent/team" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Team Management
              </Link>
            </>
          )}

          <Link href="/agent/crm" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Smart CRM
          </Link>
          
          <Link href="/agent/tools" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Smart Tools
          </Link>
        </nav>
        <div className="p-6 border-t space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Sign Out
          </button>
          <Link href="/" className="block text-sm text-gray-500 hover:text-gray-900">
            &larr; Back to Website
          </Link>
          
          {/* Debug Info */}
          <div className="pt-4 border-t text-xs text-gray-400">
             <p>Role: {role}</p>
             <p>Status: {debugInfo?.debug?.message}</p>
             {debugInfo?.debug?.searchedEmail && (
               <p className="truncate" title={debugInfo.debug.searchedEmail}>
                 Auth: {debugInfo.debug.searchedEmail}
               </p>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="md:hidden mb-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
          >
            <span className="font-semibold text-gray-800">Agent Menu</span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mobileNavOpen && (
            <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <nav className="divide-y divide-gray-100">
                <Link onClick={() => setMobileNavOpen(false)} href="/agent" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/tools" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Smart Tools
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/create" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Create Listing
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/marketing" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Marketing Center
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/crm" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Smart CRM
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/submissions" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Submissions
                </Link>
                <Link onClick={() => setMobileNavOpen(false)} href="/agent/team" className="block px-4 py-3 text-gray-700 hover:bg-gray-50">
                  Team Management
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileNavOpen(false);
                    await handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
                <Link onClick={() => setMobileNavOpen(false)} href="/" className="block px-4 py-3 text-gray-600 hover:bg-gray-50">
                  &larr; Back to Website
                </Link>
              </nav>
            </div>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}

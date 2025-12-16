'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Building2, Rocket, Upload, Inbox, FileText, Users, MessageSquare, List, ChevronDown, ChevronUp, Wrench } from 'lucide-react';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toolsPanelOpen, setToolsPanelOpen] = useState(false);

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

  if (loading) return <div className="min-h-screen" />;

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isPlatformAgent = role === 'PLATFORM_AGENT';
  const isInternalAgent = isSuperAdmin || isPlatformAgent;

  const isActive = (path: string) => pathname?.includes(path);

  const toolLinkClass = (path: string) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive(path) ? 'bg-[#496f5d] text-white' : 'text-gray-600 hover:bg-gray-100'}`;

  // Only show tools panel if user has admin tools or internal agent tools
  const hasAdminTools = isSuperAdmin;
  const hasInternalTools = isInternalAgent;
  const showToolsPanel = hasAdminTools || hasInternalTools;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collapsible Admin Tools Panel - only for users with extra tools */}
      {showToolsPanel && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <button
              onClick={() => setToolsPanelOpen(!toolsPanelOpen)}
              className="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-600 hover:text-[#496f5d] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span>Agent Tools</span>
                {hasAdminTools && <span className="text-xs bg-[#496f5d] text-white px-2 py-0.5 rounded-full">Admin</span>}
              </div>
              {toolsPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {toolsPanelOpen && (
              <div className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {/* My Listings - not in profile dropdown */}
                  <Link href="/agent/listings" className={toolLinkClass('/agent/listings')}>
                    <List className="w-4 h-4" /> My Listings
                  </Link>
                  
                  {/* Submissions - internal agents only */}
                  {isInternalAgent && (
                    <Link href="/agent/submissions" className={toolLinkClass('/agent/submissions')}>
                      <FileText className="w-4 h-4" /> Submissions
                    </Link>
                  )}
                  
                  {/* Admin-only tools */}
                  {isSuperAdmin && (
                    <>
                      <Link href="/agent/project-manager" className={toolLinkClass('/agent/project-manager')}>
                        <Building2 className="w-4 h-4" /> Project Manager
                      </Link>
                      <Link href="/agent/marketing" className={toolLinkClass('/agent/marketing')}>
                        <Rocket className="w-4 h-4" /> Marketing Center
                      </Link>
                      <Link href="/agent/import" className={toolLinkClass('/agent/import')}>
                        <Upload className="w-4 h-4" /> Bulk Import
                      </Link>
                      <Link href="/agent/leads" className={toolLinkClass('/agent/leads')}>
                        <Inbox className="w-4 h-4" /> Leads Inbox
                      </Link>
                      <Link href="/agent/posts/create" className={toolLinkClass('/agent/posts/create')}>
                        <MessageSquare className="w-4 h-4" /> Create Post
                      </Link>
                      <Link href="/agent/team" className={toolLinkClass('/agent/team')}>
                        <Users className="w-4 h-4" /> Team Management
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

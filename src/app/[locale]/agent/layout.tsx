'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">AgentHub</h1>
          <p className="text-sm text-gray-500">AscentWeb Agent Portal</p>
        </div>
        <nav className="mt-6 flex-1">
          <Link href="/agent" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/agent/create" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Create Listing
          </Link>
          <Link href="/agent/project-manager" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Project Manager (3D)
          </Link>
          <Link href="/agent/marketing" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Marketing Center
          </Link>
          <Link href="/agent/crm" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Smart CRM
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
          <Link href="/agent/tools" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Smart Tools
          </Link>
          <Link href="/agent/team" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            Team Management
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

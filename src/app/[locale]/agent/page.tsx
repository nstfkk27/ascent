'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  lastVerifiedAt: string;
}

interface DashboardStats {
  activeListings: number;
  pendingSubmissions: number;
  freshListings: number;
  needsCheckListings: number;
}

export default function AgentDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    pendingSubmissions: 0,
    freshListings: 0,
    needsCheckListings: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  }, []);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?page=${page}&limit=${limit}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        setProperties(data.data);
        if (data.totalPages) setTotalPages(data.totalPages);
        if (data.count) setTotalItems(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const getFreshnessStatus = (lastVerifiedAt: string) => {
    if (!lastVerifiedAt) return { color: 'bg-gray-100 text-gray-800', label: 'Unknown', dot: '⚪' };
    const date = new Date(lastVerifiedAt);
    if (isNaN(date.getTime())) return { color: 'bg-gray-100 text-gray-800', label: 'Invalid', dot: '⚪' };
    
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (days < 14) return { color: 'bg-green-100 text-green-800', label: 'Fresh', dot: '🟢' };
    if (days < 30) return { color: 'bg-yellow-100 text-yellow-800', label: 'Stale', dot: '🟡' };
    return { color: 'bg-red-100 text-red-800', label: 'Expired', dot: '🔴' };
  };

  const copyVerificationLink = (id: string) => {
    const link = `${window.location.origin}/verify/${id}`;
    navigator.clipboard.writeText(link);
    alert('Verification Link Copied! Send this to the owner.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id));
        fetchStats(); // Refresh stats after deletion
      } else {
        alert('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Listing Management</h1>
        <div className="flex gap-3">
          <Link 
            href="/agent/marketing" 
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>🚀</span> Group Blaster
          </Link>
          <Link 
            href="/agent/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> New Listing
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pending Submissions */}
        <Link href="/agent/submissions" className="block">
          <div className={`p-6 rounded-lg shadow-sm border border-gray-200 transition-colors ${
            stats.pendingSubmissions > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white'
          }`}>
            <h3 className="text-gray-500 text-sm font-medium uppercase">Pending Reviews</h3>
            <p className={`text-2xl md:text-3xl font-bold mt-2 ${stats.pendingSubmissions > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {stats.pendingSubmissions}
            </p>
            {stats.pendingSubmissions > 0 && (
              <p className="text-xs text-orange-600 mt-1 font-medium">Action Required</p>
            )}
          </div>
        </Link>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Active Listings</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{stats.activeListings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Fresh Listings</h3>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">
            {stats.freshListings}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Needs Check</h3>
          <p className="text-2xl md:text-3xl font-bold text-yellow-600 mt-2">
            {stats.needsCheckListings}
          </p>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Inventory Freshness</h2>
          <div className="text-sm text-gray-500">
            Total: {totalItems}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Property</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Freshness</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
              ) : (Array.isArray(properties) ? properties : []).map((property) => {
                const freshness = getFreshnessStatus(property.lastVerifiedAt);
                return (
                  <tr key={property.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{property.title || 'Untitled'}</td>
                    <td className="px-6 py-4 text-gray-900">฿{property.price?.toLocaleString() ?? 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        property.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${freshness.color}`}>
                        {freshness.dot} {freshness.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link 
                        href={`/agent/edit/${property.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => copyVerificationLink(property.id)}
                        className="text-gray-600 hover:underline text-xs"
                      >
                        Link
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t flex items-center justify-between">
            <button 
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
}

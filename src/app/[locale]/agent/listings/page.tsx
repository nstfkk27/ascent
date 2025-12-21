'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Rocket, Building, Clock, CheckCircle, AlertTriangle, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  status: string;
  lastVerifiedAt: string;
}

export default function MyListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

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
    fetchProperties();
  }, [fetchProperties]);

  const getFreshnessStatus = (lastVerifiedAt: string) => {
    if (!lastVerifiedAt) return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    const date = new Date(lastVerifiedAt);
    if (isNaN(date.getTime())) return { color: 'bg-gray-100 text-gray-800', label: 'Invalid' };
    
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (days < 14) return { color: 'bg-green-100 text-green-800', label: 'Fresh' };
    if (days < 30) return { color: 'bg-yellow-100 text-yellow-800', label: 'Stale' };
    return { color: 'bg-red-100 text-red-800', label: 'Expired' };
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
        credentials: 'include', // Ensure authentication cookies are sent
      });
      
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id));
        alert('Property deleted successfully');
      } else {
        const data = await res.json();
        alert(`Failed to delete property: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property: Network error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#49516f]">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your property inventory</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/agent/marketing" 
            className="bg-[#8ea4d2] text-white px-5 py-2.5 rounded-full hover:bg-[#7b93c4] transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <Rocket className="w-4 h-4" /> Group Blaster
          </Link>
          <Link 
            href="/agent/create" 
            className="bg-[#496f5d] text-white px-5 py-2.5 rounded-full hover:bg-[#3d5c4d] transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> New Listing
          </Link>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#49516f]">Inventory Freshness</h2>
          <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {totalItems} listings
          </span>
        </div>
        
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (Array.isArray(properties) ? properties : []).map((property) => {
            const freshness = getFreshnessStatus(property.lastVerifiedAt);
            return (
              <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#49516f] truncate">{property.title || 'Untitled'}</h3>
                    <p className="text-sm font-bold text-[#496f5d]">฿{property.price?.toLocaleString() ?? 'N/A'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${freshness.color}`}>
                    {freshness.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link 
                    href={`/agent/edit/${property.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 text-sm font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button 
                    onClick={() => copyVerificationLink(property.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8ea4d2]/10 hover:bg-[#8ea4d2]/20 rounded-xl text-[#49516f] text-sm font-medium transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Share
                  </button>
                  <button 
                    onClick={() => handleDelete(property.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left font-medium">Property</th>
                <th className="px-6 py-4 text-left font-medium">Price</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Freshness</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : (Array.isArray(properties) ? properties : []).map((property) => {
                const freshness = getFreshnessStatus(property.lastVerifiedAt);
                return (
                  <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#49516f]">{property.title || 'Untitled'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#496f5d]">฿{property.price?.toLocaleString() ?? 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === 'AVAILABLE' ? 'bg-[#8ea4d2]/20 text-[#49516f]' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${freshness.color}`}>
                        {freshness.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link 
                          href={`/agent/edit/${property.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#496f5d] transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => copyVerificationLink(property.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#8ea4d2] transition-colors"
                          title="Copy Link"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(property.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button 
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 text-sm font-medium text-gray-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page <span className="font-semibold text-[#49516f]">{page}</span> of <span className="font-semibold text-[#49516f]">{totalPages}</span>
          </span>
          <button 
            disabled={page >= totalPages || loading}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 text-sm font-medium text-gray-700 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

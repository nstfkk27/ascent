'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Rocket, Building, Clock, CheckCircle, AlertTriangle, Pencil, Trash2, Link as LinkIcon } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  rentPrice?: number;
  status: string;
  listingType: string;
  bedrooms?: number;
  size?: number;
  city?: string;
  lastVerifiedAt: string;
  ownerContactDetails?: string;
}

type PropertyStatus = 'AVAILABLE' | 'PENDING' | 'RENTED' | 'SOLD';

export default function MyListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
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

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/agent/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.data?.agent?.role || null);
        }
      } catch (err) {
        console.error('Failed to fetch role', err);
      }
    };
    fetchRole();
  }, []);

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

  const handleStatusChange = async (id: string, newStatus: PropertyStatus) => {
    setUpdatingStatus(id);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        setProperties(prev => prev.map(p => 
          p.id === id ? { ...p, status: newStatus } : p
        ));
      } else {
        const data = await res.json();
        alert(`Failed to update status: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: Network error');
    } finally {
      setUpdatingStatus(null);
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
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        property.listingType === 'SALE' ? 'bg-blue-100 text-blue-700' : 
                        property.listingType === 'RENT' ? 'bg-purple-100 text-purple-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {property.listingType}
                      </span>
                      <span className="text-xs text-gray-500">{property.bedrooms ? `${property.bedrooms} beds` : ''} {property.size ? `• ${property.size}m²` : ''}</span>
                    </div>
                    {property.listingType === 'BOTH' ? (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-sm font-bold text-[#496f5d]">฿{property.price?.toLocaleString() ?? 'N/A'} <span className="text-xs text-gray-500 font-normal">Sale</span></p>
                        <p className="text-sm font-bold text-[#496f5d]">฿{property.rentPrice?.toLocaleString() ?? 'N/A'}/mo <span className="text-xs text-gray-500 font-normal">Rent</span></p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-[#496f5d] mt-1">฿{(property.listingType === 'RENT' ? property.rentPrice : property.price)?.toLocaleString() ?? 'N/A'}</p>
                    )}
                    {property.city && <p className="text-xs text-gray-500 mt-0.5">{property.city}</p>}
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
                <th className="px-6 py-4 text-left font-medium">Type</th>
                <th className="px-6 py-4 text-left font-medium">Price</th>
                <th className="px-6 py-4 text-left font-medium">Beds</th>
                <th className="px-6 py-4 text-left font-medium">Size</th>
                <th className="px-6 py-4 text-left font-medium">Location</th>
                <th className="px-6 py-4 text-left font-medium">Owner Contact</th>
                <th className="px-6 py-4 text-left font-medium">Status</th>
                <th className="px-6 py-4 text-left font-medium">Freshness</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : (Array.isArray(properties) ? properties : []).map((property) => {
                const freshness = getFreshnessStatus(property.lastVerifiedAt);
                return (
                  <tr key={property.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#49516f]">{property.title || 'Untitled'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        property.listingType === 'SALE' ? 'bg-blue-100 text-blue-700' : 
                        property.listingType === 'RENT' ? 'bg-purple-100 text-purple-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {property.listingType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {property.listingType === 'BOTH' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#496f5d] text-xs">฿{property.price?.toLocaleString() ?? 'N/A'} <span className="text-gray-500 font-normal">Sale</span></span>
                          <span className="font-bold text-[#496f5d] text-xs">฿{property.rentPrice?.toLocaleString() ?? 'N/A'}/mo <span className="text-gray-500 font-normal">Rent</span></span>
                        </div>
                      ) : (
                        <span className="font-bold text-[#496f5d]">฿{(property.listingType === 'RENT' ? property.rentPrice : property.price)?.toLocaleString() ?? 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{property.bedrooms ?? '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{property.size ? `${property.size.toLocaleString()} m²` : '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{property.city || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 text-sm">{property.ownerContactDetails || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {(role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT') ? (
                        <select
                          value={property.status}
                          onChange={(e) => handleStatusChange(property.id, e.target.value as PropertyStatus)}
                          disabled={updatingStatus === property.id}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-colors ${
                            property.status === 'AVAILABLE' ? 'bg-[#8ea4d2]/20 text-[#49516f]' : 
                            property.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            property.status === 'RENTED' ? 'bg-purple-100 text-purple-700' :
                            property.status === 'SOLD' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="PENDING">PENDING</option>
                          <option value="RENTED">RENTED</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.status === 'AVAILABLE' ? 'bg-[#8ea4d2]/20 text-[#49516f]' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {property.status}
                        </span>
                      )}
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

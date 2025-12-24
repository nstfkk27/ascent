'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Filter, Search, Phone, Mail, ExternalLink, Calendar, User, MapPin } from 'lucide-react';

interface Enquiry {
  id: string;
  propertyId: string;
  channel: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  respondedAt: string | null;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEnquiryStatus = async (enquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state
        setEnquiries(prev => 
          prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e)
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = !searchTerm || 
      enquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.phone?.includes(searchTerm) ||
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.propertyId?.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || enquiry.status === statusFilter;
    const matchesChannel = channelFilter === 'ALL' || enquiry.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CONVERTED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'PHONE': return <Phone className="w-4 h-4" />;
      case 'EMAIL': return <Mail className="w-4 h-4" />;
      case 'WHATSAPP': return '💬';
      case 'LINE': return '📱';
      case 'WEBSITE_FORM': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'NEW').length,
    contacted: enquiries.filter(e => e.status === 'CONTACTED').length,
    converted: enquiries.filter(e => e.status === 'CONVERTED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/agent"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Enquiries</span>
          </div>
          <h1 className="text-3xl font-bold text-[#49516f]">Lead Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all property enquiries</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-[#49516f] mt-1">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">New</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.new}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                !
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.contacted}</p>
              </div>
              <Phone className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Converted</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.converted}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xl">
                ✓
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, email, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Channel Filter */}
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">All Channels</option>
                <option value="PHONE">Phone</option>
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="LINE">Line</option>
                <option value="WEBSITE_FORM">Website Form</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#496f5d] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading enquiries...</p>
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No enquiries found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'ALL' || channelFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Enquiries will appear here when buyers contact you'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Enquiry Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getChannelIcon(enquiry.channel)}
                          <span className="font-semibold text-gray-900">
                            {enquiry.name || 'Anonymous'}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        {enquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${enquiry.phone}`} className="hover:text-[#496f5d]">
                              {enquiry.phone}
                            </a>
                          </div>
                        )}
                        {enquiry.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${enquiry.email}`} className="hover:text-[#496f5d]">
                              {enquiry.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      {enquiry.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700">{enquiry.message}</p>
                        </div>
                      )}

                      {/* Property Link */}
                      <Link 
                        href={`/properties/${enquiry.propertyId}`}
                        className="inline-flex items-center gap-2 text-sm text-[#496f5d] hover:text-[#3d5c4d] font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        View Property
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      <select
                        value={enquiry.status}
                        onChange={(e) => updateEnquiryStatus(enquiry.id, e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#496f5d] focus:border-transparent"
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredEnquiries.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {filteredEnquiries.length} of {enquiries.length} enquiries
          </div>
        )}
      </div>
    </div>
  );
}

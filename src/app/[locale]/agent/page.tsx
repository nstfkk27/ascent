'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { 
  Plus, Building, Clock, CheckCircle, AlertTriangle, 
  User, Phone, Mail, Save, X, Briefcase, List, Calculator,
  Home, Rocket, MessageSquare, ChevronRight, Upload, Camera,
  TrendingUp, Users, FileText, BarChart3, Settings, Shield,
  Database, Wrench
} from 'lucide-react';

interface DashboardStats {
  activeListings: number;
  pendingSubmissions: number;
  freshListings: number;
  needsCheckListings: number;
  upcomingAvailable: number;
}

interface UpcomingProperty {
  id: string;
  title: string;
  availableFrom: string;
  rentedUntil: string;
  area?: string;
}

interface AgentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  lineId?: string;
  whatsapp?: string;
  imageUrl?: string;
  role?: string;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    pendingSubmissions: 0,
    freshListings: 0,
    needsCheckListings: 0,
    upcomingAvailable: 0
  });
  const [upcomingProperties, setUpcomingProperties] = useState<UpcomingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<AgentProfile>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/me');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.agent);
        setEditedProfile(data.agent);
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditedProfile({ ...editedProfile, imageUrl: data.url });
      } else {
        alert('Failed to upload image');
        setImagePreview(null);
      }
    } catch (err) {
      console.error('Failed to upload image', err);
      alert('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/agents/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data || editedProfile as AgentProfile);
        setIsEditingProfile(false);
        setImagePreview(null);
      } else {
        alert('Failed to save profile');
      }
    } catch (err) {
      console.error('Failed to save profile', err);
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        
        // Fetch upcoming rental availability (platform agents only)
        if (profile?.role === 'SUPER_ADMIN' || profile?.role === 'PLATFORM_AGENT') {
          try {
            const upcomingRes = await fetch('/api/properties/upcoming-available');
            if (upcomingRes.ok) {
              const upcomingData = await upcomingRes.json();
              setUpcomingProperties(upcomingData.properties || []);
              setStats(prev => ({ ...prev, upcomingAvailable: upcomingData.properties?.length || 0 }));
            }
          } catch (err) {
            console.error('Failed to fetch upcoming properties', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      fetchStats();
    }
  }, [fetchStats, profile]);

  const isInternalAgent = profile?.role === 'SUPER_ADMIN' || profile?.role === 'PLATFORM_AGENT';
  const avatarSrc = imagePreview || editedProfile.imageUrl || profile?.imageUrl;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#496f5d] to-[#3d5c4d] flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt="Profile"
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={Boolean(avatarSrc?.startsWith('data:'))}
                  />
                ) : (
                  profile?.name?.[0]?.toUpperCase() || 'A'
                )}
                {isEditingProfile && (
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                )}
              </div>
              {isEditingProfile && (
                <p className="text-xs text-gray-500 mt-2 text-center">Click to upload</p>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={editedProfile.name || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#496f5d] focus:border-transparent text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                      <input
                        type="text"
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#496f5d] focus:border-transparent text-sm"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={editedProfile.whatsapp || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#496f5d] focus:border-transparent text-sm"
                        placeholder="+66812345678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Line ID</label>
                      <input
                        type="text"
                        value={editedProfile.lineId || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, lineId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#496f5d] focus:border-transparent text-sm"
                        placeholder="@lineid"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={editedProfile.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="px-4 py-2 bg-[#496f5d] text-white rounded-xl text-sm font-medium hover:bg-[#3d5c4d] transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {savingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditedProfile(profile || {});
                        setImagePreview(null);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#49516f]">{profile?.name || 'Agent'}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {profile?.role === 'SUPER_ADMIN' ? 'Super Admin' : profile?.role === 'PLATFORM_AGENT' ? 'Platform Agent' : 'Partner Agent'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3 py-1.5 text-sm text-[#496f5d] hover:bg-[#496f5d]/10 rounded-lg transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    {profile?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {profile.email}
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {profile.phone}
                      </div>
                    )}
                    {profile?.lineId && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        Line: {profile.lineId}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Listings */}
        <Link href="/agent/listings" className="block group">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#496f5d] flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Listings</span>
            </div>
            <p className="text-3xl font-bold text-[#49516f]">{loading ? '-' : stats.activeListings}</p>
            <p className="text-xs text-gray-500 mt-1">Active properties</p>
          </div>
        </Link>

        {/* Fresh Listings */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fresh</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{loading ? '-' : stats.freshListings}</p>
          <p className="text-xs text-gray-500 mt-1">Recently verified</p>
        </div>

        {/* Needs Check */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stale</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{loading ? '-' : stats.needsCheckListings}</p>
          <p className="text-xs text-gray-500 mt-1">Needs verification</p>
        </div>

        {/* Pending Submissions - Only for internal agents */}
        {isInternalAgent && (
          <Link href="/agent/submissions" className="block group">
            <div className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              stats.pendingSubmissions > 0 
                ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stats.pendingSubmissions > 0 ? 'bg-orange-500' : 'bg-gray-100'
                }`}>
                  <Clock className={`w-5 h-5 ${stats.pendingSubmissions > 0 ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</span>
              </div>
              <p className={`text-3xl font-bold ${stats.pendingSubmissions > 0 ? 'text-orange-600' : 'text-[#49516f]'}`}>
                {loading ? '-' : stats.pendingSubmissions}
              </p>
              {stats.pendingSubmissions > 0 ? (
                <p className="text-xs text-orange-600 mt-1 font-medium">Action Required</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Owner submissions</p>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Upcoming Rental Availability - Platform Agents Only */}
      {isInternalAgent && stats.upcomingAvailable > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#49516f]">Upcoming Availability</h3>
                <p className="text-sm text-gray-600">{stats.upcomingAvailable} properties becoming available soon</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {upcomingProperties.slice(0, 5).map((prop) => (
              <Link 
                key={prop.id}
                href={`/agent/listings?id=${prop.id}`}
                className="block bg-white rounded-lg p-3 hover:shadow-md transition-shadow border border-blue-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#49516f] text-sm">{prop.title}</h4>
                    {prop.area && <p className="text-xs text-gray-500 mt-0.5">{prop.area}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-medium text-blue-600">
                      Available: {new Date(prop.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lease ends: {new Date(prop.rentedUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {upcomingProperties.length > 5 && (
            <Link 
              href="/agent/listings?filter=upcoming"
              className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all {upcomingProperties.length} properties →
            </Link>
          )}
        </div>
      )}

      {/* Quick Tools */}
      <div>
        <h3 className="text-lg font-bold text-[#49516f] mb-4">Quick Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            href="/agent/create"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#496f5d] flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">Create Listing</h4>
                <p className="text-sm text-gray-500">Add new property</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link 
            href="/agent/listings"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <List className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">My Listings</h4>
                <p className="text-sm text-gray-500">Manage properties</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link 
            href="/agent/crm"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">CRM</h4>
                <p className="text-sm text-gray-500">Client management</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link 
            href="/agent/management"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">Property Management</h4>
                <p className="text-sm text-gray-500">Track rentals & tenants</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link 
            href="/agent/marketing"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">Marketing Center</h4>
                <p className="text-sm text-gray-500">Blast to groups & channels</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          {isInternalAgent && (
            <Link 
              href="/agent/market-intelligence"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Market Intelligence</h4>
                  <p className="text-sm text-gray-500">Deal finder & analysis</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          )}

          {isInternalAgent && (
            <Link 
              href="/agent/project-manager"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Project Manager</h4>
                  <p className="text-sm text-gray-500">Manage developments</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          )}

          <Link 
            href="/agent/tools"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#49516f]">Tools</h4>
                <p className="text-sm text-gray-500">Calculators & utilities</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Admin Tools - Only for Super Admin */}
      {profile?.role === 'SUPER_ADMIN' && (
        <div>
          <h3 className="text-lg font-bold text-[#49516f] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Admin Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/agent/team"
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-sm border border-red-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Team Management</h4>
                  <p className="text-sm text-gray-600">Manage agents & roles</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link 
              href="/agent/submissions"
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Submissions</h4>
                  <p className="text-sm text-gray-600">Review owner listings</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link 
              href="/agent/import"
              className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl shadow-sm border border-violet-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Bulk Import</h4>
                  <p className="text-sm text-gray-600">Import properties</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link 
              href="/agent/posts/create"
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Create Post</h4>
                  <p className="text-sm text-gray-600">Blog & insights</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link 
              href="/schema"
              className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-500 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">Database Schema</h4>
                  <p className="text-sm text-gray-600">View data structure</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link 
              href="/agent/listings?view=all"
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#49516f]">All Listings</h4>
                  <p className="text-sm text-gray-600">Platform overview</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

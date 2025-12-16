'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Calendar, Phone, MessageCircle, AlertTriangle, 
  CheckCircle, Clock, User, Building, ChevronRight, Filter,
  DollarSign, CalendarDays
} from 'lucide-react';

type DealType = 'SALE' | 'RENT';

interface ManagedProperty {
  id: string;
  clientName: string;
  clientPhone?: string;
  notes?: string;
  dealType: DealType;
  property: {
    title: string;
    address?: string;
  };
  leaseStartDate?: string;
  leaseEndDate?: string;
  monthlyRent?: number;
  depositAmount?: number;
  nextPaymentDue?: string;
  updatedAt: string;
}

export default function PropertyManagementPage() {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'overdue'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<ManagedProperty | null>(null);

  useEffect(() => {
    fetchManagedProperties();
  }, []);

  const fetchManagedProperties = async () => {
    try {
      const res = await fetch('/api/deals?stage=CLOSED&dealType=RENT');
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch managed properties', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilExpiry = (leaseEndDate?: string) => {
    if (!leaseEndDate) return null;
    const end = new Date(leaseEndDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysUntilPayment = (nextPaymentDue?: string) => {
    if (!nextPaymentDue) return null;
    const due = new Date(nextPaymentDue);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getExpiryStatus = (days: number | null) => {
    if (days === null) return { label: 'No date', color: 'text-gray-400', bg: 'bg-gray-100' };
    if (days < 0) return { label: 'Expired', color: 'text-red-700', bg: 'bg-red-100' };
    if (days <= 30) return { label: `${days}d left`, color: 'text-orange-700', bg: 'bg-orange-100' };
    if (days <= 60) return { label: `${days}d left`, color: 'text-yellow-700', bg: 'bg-yellow-100' };
    return { label: `${days}d left`, color: 'text-green-700', bg: 'bg-green-100' };
  };

  const getPaymentStatus = (days: number | null) => {
    if (days === null) return null;
    if (days < 0) return { label: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
    if (days === 0) return { label: 'Due today', color: 'text-orange-600', icon: Clock };
    if (days <= 7) return { label: `Due in ${days}d`, color: 'text-yellow-600', icon: Clock };
    return { label: `Due in ${days}d`, color: 'text-green-600', icon: CheckCircle };
  };

  const handleCall = (phone?: string) => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone?: string, clientName?: string) => {
    if (phone) {
      const message = encodeURIComponent(`Hi ${clientName}, this is a reminder about your rental.`);
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleUpdateLease = async () => {
    if (!editingProperty) return;
    
    try {
      await fetch(`/api/deals/${editingProperty.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseStartDate: editingProperty.leaseStartDate,
          leaseEndDate: editingProperty.leaseEndDate,
          monthlyRent: editingProperty.monthlyRent,
          depositAmount: editingProperty.depositAmount,
          nextPaymentDue: editingProperty.nextPaymentDue,
        })
      });
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? editingProperty : p));
      setShowEditModal(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Failed to update lease', error);
    }
  };

  const filteredProperties = properties.filter(p => {
    if (filter === 'all') return true;
    const days = getDaysUntilExpiry(p.leaseEndDate);
    if (filter === 'expiring') return days !== null && days <= 60 && days >= 0;
    if (filter === 'overdue') {
      const paymentDays = getDaysUntilPayment(p.nextPaymentDue);
      return paymentDays !== null && paymentDays < 0;
    }
    return true;
  });

  const stats = {
    total: properties.length,
    expiringSoon: properties.filter(p => {
      const days = getDaysUntilExpiry(p.leaseEndDate);
      return days !== null && days <= 60 && days >= 0;
    }).length,
    overdue: properties.filter(p => {
      const days = getDaysUntilPayment(p.nextPaymentDue);
      return days !== null && days < 0;
    }).length,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">Property Management</h1>
        <p className="text-sm text-gray-500">Track rentals, leases & payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-xl text-center transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filter === 'all' ? 'text-white' : 'text-gray-900'}`}>
            {stats.total}
          </div>
          <div className={`text-xs ${filter === 'all' ? 'text-blue-100' : 'text-gray-500'}`}>
            Active Rentals
          </div>
        </button>
        <button
          onClick={() => setFilter('expiring')}
          className={`p-3 rounded-xl text-center transition-colors ${
            filter === 'expiring' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filter === 'expiring' ? 'text-white' : 'text-orange-600'}`}>
            {stats.expiringSoon}
          </div>
          <div className={`text-xs ${filter === 'expiring' ? 'text-orange-100' : 'text-gray-500'}`}>
            Expiring Soon
          </div>
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`p-3 rounded-xl text-center transition-colors ${
            filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-white border border-gray-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filter === 'overdue' ? 'text-white' : 'text-red-600'}`}>
            {stats.overdue}
          </div>
          <div className={`text-xs ${filter === 'overdue' ? 'text-red-100' : 'text-gray-500'}`}>
            Payment Overdue
          </div>
        </button>
      </div>

      {/* Property List */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
          <Home className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm text-center">
            {filter === 'all' 
              ? 'No rental properties yet. Close a RENT deal to see it here.'
              : `No ${filter === 'expiring' ? 'expiring leases' : 'overdue payments'}`
            }
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProperties.map((property) => {
            const daysUntilExpiry = getDaysUntilExpiry(property.leaseEndDate);
            const expiryStatus = getExpiryStatus(daysUntilExpiry);
            const paymentDays = getDaysUntilPayment(property.nextPaymentDue);
            const paymentStatus = getPaymentStatus(paymentDays);

            return (
              <div 
                key={property.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* Property & Tenant Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900 truncate">
                        {property.property?.title || 'Unknown Property'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{property.clientName}</span>
                      {property.clientPhone && (
                        <span className="text-gray-400">• {property.clientPhone}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}>
                    {expiryStatus.label}
                  </span>
                </div>

                {/* Lease & Payment Info */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 mb-1">Monthly Rent</div>
                    <div className="font-bold text-gray-900">
                      {property.monthlyRent ? `฿${property.monthlyRent.toLocaleString()}` : '-'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500 mb-1">Lease End</div>
                    <div className="font-bold text-gray-900">
                      {property.leaseEndDate 
                        ? new Date(property.leaseEndDate).toLocaleDateString() 
                        : '-'
                      }
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                {paymentStatus && (
                  <div className={`flex items-center gap-2 mb-3 text-sm ${paymentStatus.color}`}>
                    <paymentStatus.icon className="w-4 h-4" />
                    <span className="font-medium">{paymentStatus.label}</span>
                    {property.nextPaymentDue && (
                      <span className="text-gray-400">
                        ({new Date(property.nextPaymentDue).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {property.clientPhone && (
                    <>
                      <button
                        onClick={() => handleCall(property.clientPhone)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button
                        onClick={() => handleWhatsApp(property.clientPhone, property.clientName)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Remind
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setEditingProperty(property); setShowEditModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Lease Modal */}
      {showEditModal && editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Lease Details</h2>
              <button onClick={() => { setShowEditModal(false); setEditingProperty(null); }}>
                <span className="text-gray-500 text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lease Start</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editingProperty.leaseStartDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      leaseStartDate: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lease End</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editingProperty.leaseEndDate?.split('T')[0] || ''}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      leaseEndDate: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (฿)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editingProperty.monthlyRent || ''}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      monthlyRent: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (฿)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editingProperty.depositAmount || ''}
                    onChange={(e) => setEditingProperty({
                      ...editingProperty,
                      depositAmount: Number(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Payment Due</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={editingProperty.nextPaymentDue?.split('T')[0] || ''}
                  onChange={(e) => setEditingProperty({
                    ...editingProperty,
                    nextPaymentDue: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => { setShowEditModal(false); setEditingProperty(null); }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLease}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

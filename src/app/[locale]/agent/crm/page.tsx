'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, ChevronRight, Plus, X, User, Building, Calendar, StickyNote, Check } from 'lucide-react';

type DealStage = 'NEW_LEAD' | 'VIEWING' | 'OFFER' | 'CONTRACT' | 'CLOSED';

interface Deal {
  id: string;
  clientName: string;
  clientPhone?: string;
  notes?: string;
  property: {
    title: string;
    price: string;
  };
  stage: DealStage;
  updatedAt: string;
}

interface Property {
  id: string;
  title: string;
}

export default function CRMPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DealStage>('NEW_LEAD');
  
  // Property Search State
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertySuggestions, setPropertySuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState('');

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    clientName: '',
    clientPhone: '',
    notes: '',
    propertyId: '',
    amount: 0
  });

  // Edit notes state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const stages: { key: DealStage; label: string; color: string }[] = [
    { key: 'NEW_LEAD', label: 'New', color: 'bg-blue-500' },
    { key: 'VIEWING', label: 'Viewing', color: 'bg-purple-500' },
    { key: 'OFFER', label: 'Offer', color: 'bg-yellow-500' },
    { key: 'CONTRACT', label: 'Contract', color: 'bg-orange-500' },
    { key: 'CLOSED', label: 'Closed', color: 'bg-green-500' }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  // Debounced Property Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (propertySearchQuery.length >= 2) {
        searchProperties(propertySearchQuery);
      } else {
        setPropertySuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [propertySearchQuery]);

  const searchProperties = async (query: string) => {
    try {
      const res = await fetch(`/api/properties?query=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success) setPropertySuggestions(data.data);
    } catch (error) {
      console.error('Failed to search properties', error);
    }
  };

  const selectProperty = (property: Property) => {
    setNewDeal({ ...newDeal, propertyId: property.id });
    setSelectedPropertyTitle(property.title);
    setShowSuggestions(false);
    setPropertySearchQuery('');
  };

  const fetchDeals = async () => {
    try {
      const res = await fetch('/api/deals');
      const data = await res.json();
      if (data.success) setDeals(data.data);
    } catch (error) {
      console.error('Failed to fetch deals', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Removed fetchProperties


  const handleMoveDeal = async (dealId: string, currentStage: DealStage) => {
    const currentIndex = stages.findIndex(s => s.key === currentStage);
    if (currentIndex >= stages.length - 1) return;

    const nextStage = stages[currentIndex + 1].key;

    // Optimistic Update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: nextStage } : d));

    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: nextStage })
      });
      // No need to refetch if optimistic update worked, but maybe good to sync
    } catch (error) {
      console.error('Failed to update deal', error);
      fetchDeals(); // Revert on error
    }
  };

  const handleCreateDeal = async () => {
    if (!newDeal.clientName || !newDeal.propertyId) return;

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      
      if (res.ok) {
        setShowNewDealModal(false);
        setNewDeal({ clientName: '', clientPhone: '', notes: '', propertyId: '', amount: 0 });
        fetchDeals();
      }
    } catch (error) {
      console.error('Failed to create deal', error);
    }
  };

  const getStageColor = (stage: DealStage) => {
    switch (stage) {
      case 'NEW_LEAD': return 'bg-blue-500';
      case 'VIEWING': return 'bg-purple-500';
      case 'OFFER': return 'bg-yellow-500';
      case 'CONTRACT': return 'bg-orange-500';
      case 'CLOSED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredDeals = deals.filter(d => d.stage === activeTab);

  const handleCall = (phone?: string) => {
    if (phone) window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone?: string, clientName?: string) => {
    if (phone) {
      const message = encodeURIComponent(`Hi ${clientName}, following up on your property inquiry.`);
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  const handleSaveNote = async (dealId: string) => {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNoteText })
      });
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, notes: editNoteText } : d));
      setEditingNoteId(null);
      setEditNoteText('');
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">CRM</h1>
            <p className="text-sm text-gray-500">{deals.length} deals</p>
          </div>
          <button 
            onClick={() => setShowNewDealModal(true)}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stage Tabs - Horizontally scrollable */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="flex">
          {stages.map((stage) => {
            const count = deals.filter(d => d.stage === stage.key).length;
            const isActive = activeTab === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => setActiveTab(stage.key)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span>{stage.label}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <User className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No deals in this stage</p>
              <button 
                onClick={() => setShowNewDealModal(true)}
                className="mt-4 text-blue-600 text-sm font-medium"
              >
                + Add a deal
              </button>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div 
                key={deal.id} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                {/* Client Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{deal.clientName}</h4>
                      {deal.clientPhone && (
                        <p className="text-sm text-gray-600">{deal.clientPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {new Date(deal.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Property Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {deal.property?.title || 'Unknown Property'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-blue-600 ml-6">
                    {deal.property?.price ? `฿${Number(deal.property.price).toLocaleString()}` : '-'}
                  </p>
                </div>

                {/* Notes Section */}
                <div className="mb-3">
                  {editingNoteId === deal.id ? (
                    <div className="flex gap-2">
                      <textarea
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none"
                        rows={2}
                        placeholder="Add a note..."
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveNote(deal.id)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingNoteId(null); setEditNoteText(''); }}
                          className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingNoteId(deal.id); setEditNoteText(deal.notes || ''); }}
                      className="w-full text-left p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {deal.notes || <span className="text-gray-400 italic">Add note...</span>}
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {deal.clientPhone && (
                    <>
                      <button
                        onClick={() => handleCall(deal.clientPhone)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm font-medium transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        Call
                      </button>
                      <button
                        onClick={() => handleWhatsApp(deal.clientPhone, deal.clientName)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </>
                  )}
                  {activeTab !== 'CLOSED' && (
                    <button
                      onClick={() => handleMoveDeal(deal.id, deal.stage)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Deal Modal - Mobile friendly full screen */}
      {showNewDealModal && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <button 
              onClick={() => setShowNewDealModal(false)}
              className="p-1 text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold">New Deal</h2>
            <button 
              onClick={handleCreateDeal}
              disabled={!newDeal.clientName || !newDeal.propertyId}
              className="text-blue-600 font-semibold disabled:text-gray-300"
            >
              Save
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                placeholder="Enter client name"
                value={newDeal.clientName}
                onChange={e => setNewDeal({...newDeal, clientName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                className="w-full p-3 border border-gray-300 rounded-lg text-base"
                placeholder="+66 xxx xxx xxxx"
                value={newDeal.clientPhone}
                onChange={e => setNewDeal({...newDeal, clientPhone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg text-base"
                  placeholder="Search property..."
                  value={selectedPropertyTitle || propertySearchQuery}
                  onChange={(e) => {
                    setPropertySearchQuery(e.target.value);
                    setSelectedPropertyTitle('');
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && propertySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                    {propertySuggestions.map(p => (
                      <div 
                        key={p.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectProperty(p)}
                      >
                        <div className="font-medium text-sm">{p.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg text-base resize-none"
                rows={3}
                placeholder="Add any notes about this deal..."
                value={newDeal.notes}
                onChange={e => setNewDeal({...newDeal, notes: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

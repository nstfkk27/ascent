'use client';

import { useState, useEffect } from 'react';

type DealStage = 'NEW_LEAD' | 'VIEWING' | 'OFFER' | 'CONTRACT' | 'CLOSED';

interface Deal {
  id: string;
  clientName: string;
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
  // Removed bulk properties state
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDealModal, setShowNewDealModal] = useState(false);
  
  // Property Search State
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertySuggestions, setPropertySuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPropertyTitle, setSelectedPropertyTitle] = useState('');

  // New Deal Form State
  const [newDeal, setNewDeal] = useState({
    clientName: '',
    clientPhone: '',
    propertyId: '',
    amount: 0
  });

  const stages: { key: DealStage; label: string }[] = [
    { key: 'NEW_LEAD', label: 'New Lead' },
    { key: 'VIEWING', label: 'Viewing' },
    { key: 'OFFER', label: 'Offer' },
    { key: 'CONTRACT', label: 'Contract' },
    { key: 'CLOSED', label: 'Closed' }
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
        setNewDeal({ clientName: '', clientPhone: '', propertyId: '', amount: 0 });
        fetchDeals();
      }
    } catch (error) {
      console.error('Failed to create deal', error);
    }
  };

  const getStageColor = (stage: DealStage) => {
    switch (stage) {
      case 'NEW_LEAD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VIEWING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OFFER': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTRACT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CLOSED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Smart CRM</h1>
          <p className="text-gray-600">Track your deals. Moving a deal verifies property freshness automatically.</p>
        </div>
        <button 
          onClick={() => setShowNewDealModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + New Deal
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading CRM...</div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 min-w-max h-full pb-4">
            {stages.map((stage) => (
              <div key={stage.key} className="w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg border border-gray-200 h-full">
                {/* Column Header */}
                <div className={`p-3 border-b font-semibold flex justify-between items-center ${getStageColor(stage.key)} rounded-t-lg`}>
                  <span>{stage.label}</span>
                  <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded text-xs">
                    {deals.filter(d => d.stage === stage.key).length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {deals.filter(d => d.stage === stage.key).map((deal) => (
                    <div key={deal.id} className="bg-white p-4 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800">{deal.clientName}</h4>
                        <span className="text-xs text-gray-400">
                          {new Date(deal.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 font-medium mb-1 truncate">{deal.property?.title || 'Unknown Property'}</p>
                      <p className="text-sm text-gray-500">{deal.property?.price ? `฿${Number(deal.property.price).toLocaleString()}` : '-'}</p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                        {stage.key !== 'CLOSED' && (
                          <button 
                            onClick={() => handleMoveDeal(deal.id, deal.stage)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            Next Stage &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {deals.filter(d => d.stage === stage.key).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Create New Deal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={newDeal.clientName}
                  onChange={e => setNewDeal({...newDeal, clientName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Property</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Search property..."
                    value={selectedPropertyTitle || propertySearchQuery}
                    onChange={(e) => {
                      setPropertySearchQuery(e.target.value);
                      setSelectedPropertyTitle(''); // Clear selection if user types
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && propertySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b shadow-lg max-h-48 overflow-y-auto mt-1">
                      {propertySuggestions.map(p => (
                        <div 
                          key={p.id}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onClick={() => selectProperty(p)}
                        >
                          <div className="font-medium">{p.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={newDeal.clientPhone}
                  onChange={e => setNewDeal({...newDeal, clientPhone: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setShowNewDealModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateDeal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

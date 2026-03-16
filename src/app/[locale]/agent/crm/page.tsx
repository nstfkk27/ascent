'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2, Save } from 'lucide-react';

type ProcessStatus = 'ON_SENT_LISTING' | 'WAITING_FOR_SCHEDULE' | 'VIEWING' | 'CONTRACT' | 'DONE' | 'NO_FEEDBACK';

interface Lead {
  id: string;
  number: number;
  firstContact: string;
  name: string;
  nationality: string;
  purpose: string;
  budget: string;
  source: string;
  agent: string;
  process: ProcessStatus;
  targetDate: string | null;
  remark: string;
  createdAt: string;
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New Lead Form State
  const [newLead, setNewLead] = useState({
    name: '',
    nationality: '',
    purpose: '',
    budget: '',
    source: '',
    agent: '',
    process: 'ON_SENT_LISTING' as ProcessStatus,
    targetDate: '',
    remark: ''
  });

  const processOptions: { value: ProcessStatus; label: string }[] = [
    { value: 'ON_SENT_LISTING', label: 'On sent listing' },
    { value: 'WAITING_FOR_SCHEDULE', label: 'Waiting for schedule' },
    { value: 'VIEWING', label: 'Viewing' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'DONE', label: 'Done' },
    { value: 'NO_FEEDBACK', label: 'No feedback' }
  ];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.success) setLeads(data.data);
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.name) return;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      
      if (res.ok) {
        setShowNewLeadModal(false);
        setNewLead({
          name: '',
          nationality: '',
          purpose: '',
          budget: '',
          source: '',
          agent: '',
          process: 'ON_SENT_LISTING',
          targetDate: '',
          remark: ''
        });
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to create lead', error);
    }
  };

  const handleUpdateProcess = async (leadId: string, newProcess: ProcessStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, process: newProcess } : l));

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ process: newProcess })
      });
    } catch (error) {
      console.error('Failed to update process', error);
      fetchLeads();
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (error) {
      console.error('Failed to delete lead', error);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">CRM - Lead Management</h1>
            <p className="text-sm text-gray-500">{leads.length} leads</p>
          </div>
          <button 
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-2 bg-[#496f5d] text-white px-4 py-2 rounded-lg hover:bg-[#3d5c4d] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">First Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nationality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Process</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Target Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remark</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                    <p className="text-sm">No leads yet</p>
                    <button 
                      onClick={() => setShowNewLeadModal(true)}
                      className="mt-4 text-[#496f5d] text-sm font-medium hover:underline"
                    >
                      + Add your first lead
                    </button>
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(lead.firstContact).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.nationality}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.purpose}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.budget}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.source}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.agent}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.process}
                        onChange={(e) => handleUpdateProcess(lead.id, e.target.value as ProcessStatus)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                      >
                        {processOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {lead.targetDate ? new Date(lead.targetDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={lead.remark}>
                      {lead.remark}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="Enter name"
                    value={newLead.name}
                    onChange={e => setNewLead({...newLead, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="e.g., Thai, American"
                    value={newLead.nationality}
                    onChange={e => setNewLead({...newLead, nationality: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="e.g., Buy, Rent, Invest"
                    value={newLead.purpose}
                    onChange={e => setNewLead({...newLead, purpose: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="e.g., 5-10M THB"
                    value={newLead.budget}
                    onChange={e => setNewLead({...newLead, budget: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="e.g., Website, Referral, Walk-in"
                    value={newLead.source}
                    onChange={e => setNewLead({...newLead, source: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                    placeholder="Agent name"
                    value={newLead.agent}
                    onChange={e => setNewLead({...newLead, agent: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Process Status</label>
                <select
                  value={newLead.process}
                  onChange={e => setNewLead({...newLead, process: e.target.value as ProcessStatus})}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                >
                  {processOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                  value={newLead.targetDate}
                  onChange={e => setNewLead({...newLead, targetDate: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">When does the client want to move in or close the deal?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                  rows={3}
                  placeholder="Add any additional notes..."
                  value={newLead.remark}
                  onChange={e => setNewLead({...newLead, remark: e.target.value})}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateLead}
                disabled={!newLead.name}
                className="px-4 py-2 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5c4d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

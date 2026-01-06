'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Plus, Trash2 } from 'lucide-react';

export default function TeamManagementPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    imageUrl: '',
    phone: '',
    whatsapp: '',
    lineId: '',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/agents/${editingId}` : '/api/agents';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ name: '', role: '', email: '', imageUrl: '', phone: '', whatsapp: '', lineId: '' });
        setEditingId(null);
        fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (agent: any) => {
    setEditingId(agent.id);
    setFormData({
      name: agent.name || '',
      role: agent.role || '',
      email: agent.email || '',
      imageUrl: agent.imageUrl || '',
      phone: agent.phone || '',
      whatsapp: agent.whatsapp || '',
      lineId: agent.lineId || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this agent?')) return;
    
    try {
      const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create/Edit Form */}
        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" /> {editingId ? 'Edit Agent' : 'Add New Agent'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                placeholder="e.g. Senior Consultant"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                placeholder="+66812345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                placeholder="+66812345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Line ID</label>
              <input
                type="text"
                value={formData.lineId}
                onChange={e => setFormData({...formData, lineId: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                placeholder="@lineid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-600"
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="w-full bg-[#496f5d] text-white py-2 rounded hover:bg-[#3d5c4d]">
              Add Agent
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Current Team</h2>
          {loading ? (
             <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {agent.imageUrl ? (
                      <Image src={agent.imageUrl} alt={agent.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">{agent.name}</h3>
                        <p className="text-sm text-[#496f5d] font-medium">{agent.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(agent)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(agent.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {agent.email && <p className="text-xs text-gray-500 mt-1">{agent.email}</p>}
                    {agent.phone && <p className="text-xs text-gray-500">{agent.phone}</p>}
                  </div>
                </div>
              ))}
              {agents.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">
                  No agents found. Add one to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

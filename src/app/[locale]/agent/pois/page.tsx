'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const POI_TYPES = [
  'BEACH', 'HOSPITAL', 'INTERNATIONAL_SCHOOL', 'THAI_SCHOOL',
  'SHOPPING_MALL', 'SUPERMARKET', 'CONVENIENCE_STORE',
  'BTS_STATION', 'MRT_STATION', 'AIRPORT', 'GOLF_COURSE',
  'PARK', 'RESTAURANT_AREA', 'NIGHTLIFE', 'GYM', 'TEMPLE',
  'IMMIGRATION', 'EMBASSY'
];

const POI_TIERS = ['PRIMARY', 'SECONDARY'];

interface POI {
  id: string;
  name: string;
  nameTh: string | null;
  type: string;
  tier: string;
  latitude: number;
  longitude: number;
  city: string;
  area: string | null;
  isActive: boolean;
}

export default function POIManagementPage() {
  const router = useRouter();
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPoi, setEditingPoi] = useState<POI | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    nameTh: '',
    type: 'BEACH',
    tier: 'PRIMARY',
    latitude: '',
    longitude: '',
    city: 'Pattaya',
    area: ''
  });

  useEffect(() => {
    fetchPOIs();
  }, [filterType, filterCity]);

  const fetchPOIs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCity) params.append('city', filterCity);
      
      const res = await fetch(`/api/pois?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPois(data);
      }
    } catch (error) {
      console.error('Error fetching POIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      const url = editingPoi ? `/api/pois/${editingPoi.id}` : '/api/pois';
      const method = editingPoi ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingPoi(null);
        resetForm();
        fetchPOIs();
        alert(editingPoi ? 'POI updated!' : 'POI created!');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save POI');
      }
    } catch (error) {
      alert('Error saving POI');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (poi: POI) => {
    setEditingPoi(poi);
    setFormData({
      name: poi.name,
      nameTh: poi.nameTh || '',
      type: poi.type,
      tier: poi.tier,
      latitude: String(poi.latitude),
      longitude: String(poi.longitude),
      city: poi.city,
      area: poi.area || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (poi: POI) => {
    if (!confirm(`Deactivate "${poi.name}"?`)) return;

    try {
      const res = await fetch(`/api/pois/${poi.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPOIs();
      }
    } catch (error) {
      alert('Error deleting POI');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameTh: '',
      type: 'BEACH',
      tier: 'PRIMARY',
      latitude: '',
      longitude: '',
      city: 'Pattaya',
      area: ''
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      BEACH: '🏖️',
      HOSPITAL: '🏥',
      INTERNATIONAL_SCHOOL: '🎓',
      THAI_SCHOOL: '📚',
      SHOPPING_MALL: '🛒',
      SUPERMARKET: '🏪',
      CONVENIENCE_STORE: '🏪',
      BTS_STATION: '🚇',
      MRT_STATION: '🚇',
      AIRPORT: '✈️',
      GOLF_COURSE: '⛳',
      PARK: '🌳',
      RESTAURANT_AREA: '🍽️',
      NIGHTLIFE: '🌙',
      GYM: '💪',
      TEMPLE: '🛕',
      IMMIGRATION: '🛂',
      EMBASSY: '🏛️'
    };
    return icons[type] || '📍';
  };

  const uniqueCities = Array.from(new Set(pois.map(p => p.city)));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Points of Interest</h1>
            <p className="text-gray-600 mt-1">
              Manage locations for AI-powered distance search
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPoi(null);
              resetForm();
              setShowForm(true);
            }}
            className="mt-4 md:mt-0 bg-[#496f5d] text-white px-4 py-2 rounded-lg hover:bg-[#3d5a4a] transition"
          >
            + Add POI
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 How POIs Work</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>PRIMARY</strong> tier: Used for search filters (e.g., &quot;near beach &lt; 1km&quot;)</li>
            <li>• <strong>SECONDARY</strong> tier: Display info only (e.g., nearby convenience stores)</li>
            <li>• Get coordinates from Google Maps: Right-click → &quot;What&apos;s here?&quot;</li>
            <li>• After adding POIs, run distance calculation to update properties</li>
          </ul>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="">All Types</option>
              {POI_TYPES.map(type => (
                <option key={type} value={type}>
                  {getTypeIcon(type)} {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <span className="text-gray-500 self-center">
              {pois.length} POIs
            </span>
          </div>
        </div>

        {/* POI List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">City / Area</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Coordinates</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tier</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pois.map((poi) => (
                  <tr key={poi.id} className={!poi.isActive ? 'bg-gray-100 opacity-60' : ''}>
                    <td className="px-4 py-3">
                      <span className="text-xl" title={poi.type}>
                        {getTypeIcon(poi.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{poi.name}</div>
                      {poi.nameTh && (
                        <div className="text-sm text-gray-500">{poi.nameTh}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-900">{poi.city}</div>
                      {poi.area && (
                        <div className="text-sm text-gray-500">{poi.area}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
                      {Number(poi.latitude).toFixed(4)}, {Number(poi.longitude).toFixed(4)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        poi.tier === 'PRIMARY' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {poi.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(poi)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(poi)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {poi.isActive ? 'Deactivate' : 'Deleted'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {editingPoi ? 'Edit POI' : 'Add New POI'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (English) *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Thai)
                      </label>
                      <input
                        type="text"
                        value={formData.nameTh}
                        onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        required
                      >
                        {POI_TYPES.map(type => (
                          <option key={type} value={type}>
                            {getTypeIcon(type)} {type.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tier *
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        required
                      >
                        {POI_TIERS.map(tier => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        placeholder="12.9266"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude *
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        placeholder="100.8688"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area / District
                      </label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-gray-900"
                        placeholder="e.g., Jomtien"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    💡 <strong>Tip:</strong> To get coordinates, open Google Maps, right-click on the location, 
                    and click &quot;What&apos;s here?&quot; The coordinates will appear at the bottom.
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPoi(null);
                      }}
                      className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5a4a] disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : (editingPoi ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

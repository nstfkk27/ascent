'use client';

import { createProject } from '../actions';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl, MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode, searchAddress } from '@/lib/mapbox';
import FileUpload from '@/components/ui/FileUpload';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function CreateProjectPage() {
  const [viewState, setViewState] = useState({
    latitude: 12.9236,
    longitude: 100.8825,
    zoom: 13
  });

  const [marker, setMarker] = useState({
    latitude: 12.9236,
    longitude: 100.8825
  });

  const [addressData, setAddressData] = useState({
    address: '',
    city: 'Pattaya',
    lat: 12.9236,
    lng: 100.8825
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [glbUrl, setGlbUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleMapClick = useCallback(async (event: MapMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setMarker({ latitude: lat, longitude: lng });
    
    // Update form data immediately with coords
    setAddressData(prev => ({ ...prev, lat, lng }));

    // Fetch address
    const result = await reverseGeocode(lat, lng);
    if (result) {
      setAddressData({
        address: result.address,
        city: result.city || 'Pattaya',
        lat,
        lng
      });
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    const results = await searchAddress(searchQuery);
    setIsSearching(false);

    if (results.length > 0) {
      const first = results[0];
      setViewState({
        latitude: first.lat,
        longitude: first.lng,
        zoom: 16
      });
      setMarker({
        latitude: first.lat,
        longitude: first.lng
      });
      setAddressData({
        address: first.address,
        city: first.city || 'Pattaya',
        lat: first.lat,
        lng: first.lng
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/agent/project-manager" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
        <p className="text-gray-600">Start by defining the location and basic details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Map & Location */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Find Location</label>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search place..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 text-gray-600"
              >
                🔍
              </button>
            </form>
            
            <div className="h-64 w-full rounded-lg overflow-hidden relative">
              <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onClick={handleMapClick}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <NavigationControl position="top-right" />
                <Marker 
                  latitude={marker.latitude} 
                  longitude={marker.longitude} 
                  color="red"
                />
              </Map>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Click on map to pinpoint exact location</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-2">
          <form action={createProject} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name (English)</label>
                <input 
                  name="name" 
                  required 
                  placeholder="e.g. The Riviera Ocean Drive"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name (Thai) 
                  <span className="text-gray-400 font-normal ml-1">- Optional</span>
                </label>
                <input 
                  name="nameTh" 
                  placeholder="e.g. เดอะ ริเวียร่า โอเชี่ยน ไดรฟ์"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  name="type" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="CONDO">Condo</option>
                  <option value="HOUSE">House / Villa</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
                <input 
                  name="developer" 
                  placeholder="e.g. Riviera Group"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Completion Year</label>
                  <input 
                    name="completionYear" 
                    type="number"
                    placeholder="e.g. 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                  <input 
                    name="totalUnits" 
                    type="number"
                    placeholder="e.g. 500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                  <input 
                    name="totalFloors" 
                    type="number"
                    placeholder="e.g. 45"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Buildings</label>
                  <input 
                    name="totalBuildings" 
                    type="number"
                    placeholder="e.g. 2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  name="address" 
                  required 
                  value={addressData.address}
                  onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  name="city" 
                  value={addressData.city}
                  onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input 
                    name="lat" 
                    type="number" 
                    step="any" 
                    required 
                    value={addressData.lat}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input 
                    name="lng" 
                    type="number" 
                    step="any" 
                    required 
                    value={addressData.lng}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="col-span-2 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Assets & Facilities</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Cover Image</label>
                  <div className="space-y-2">
                    <input 
                      name="imageUrl" 
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://.../image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
                    />
                    <FileUpload 
                      bucket="facilities" 
                      accept="image/*" 
                      label="Upload Cover Image" 
                      onUploadComplete={(url) => setImageUrl(url)} 
                    />
                  </div>
                  {imageUrl && (
                    <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">3D Model URL (.glb)</label>
                  <div className="space-y-2">
                    <input 
                      name="glbUrl" 
                      value={glbUrl}
                      onChange={(e) => setGlbUrl(e.target.value)}
                      placeholder="https://.../model.glb"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
                    />
                    <FileUpload 
                      bucket="models" 
                      accept=".glb" 
                      label="Or upload .glb file" 
                      onUploadComplete={(url) => setGlbUrl(url)} 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Optional. You can add this later.</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold">Note about Facilities:</p>
                  <p className="mt-1">You can add facilities (Gym, Pool, etc.) and their photos after creating the project.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

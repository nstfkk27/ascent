'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl, MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode, searchAddress } from '@/lib/mapbox';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface ProjectLocationEditorProps {
  defaultLat: number;
  defaultLng: number;
  defaultAddress: string;
  defaultCity: string;
}

export default function ProjectLocationEditor({ 
  defaultLat, 
  defaultLng, 
  defaultAddress, 
  defaultCity 
}: ProjectLocationEditorProps) {
  const [viewState, setViewState] = useState({
    latitude: defaultLat,
    longitude: defaultLng,
    zoom: 15
  });

  const [marker, setMarker] = useState({
    latitude: defaultLat,
    longitude: defaultLng
  });

  const [addressData, setAddressData] = useState({
    address: defaultAddress,
    city: defaultCity,
    lat: defaultLat,
    lng: defaultLng
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleMapClick = useCallback(async (event: MapMouseEvent) => {
    const { lat, lng } = event.lngLat;
    setMarker({ latitude: lat, longitude: lng });
    
    setAddressData(prev => ({ ...prev, lat, lng }));

    const result = await reverseGeocode(lat, lng);
    if (result) {
      setAddressData({
        address: result.address,
        city: result.city || defaultCity,
        lat,
        lng
      });
    }
  }, [defaultCity]);

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
        city: first.city || defaultCity,
        lat: first.lat,
        lng: first.lng
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input 
            name="address" 
            value={addressData.address}
            onChange={(e) => setAddressData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input 
            name="city" 
            value={addressData.city}
            onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input 
            name="lat" 
            type="number" 
            step="any" 
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
            value={addressData.lng}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Update Location</label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search place..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e as any);
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button 
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 text-gray-600"
          >
            🔍
          </button>
        </div>
        
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
        <p className="text-xs text-gray-500 mt-2 text-center">Click on map to update location</p>
      </div>
    </div>
  );
}

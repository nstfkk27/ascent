'use client';

import { useState, useEffect } from 'react';

interface POI {
  poi: {
    id: string;
    name: string;
    nameTh: string | null;
    type: string;
    tier: string;
  };
  distanceKm: number;
  walkingMins: number | null;
  drivingMins: number | null;
}

interface NearbyPOIsProps {
  propertyId: string;
}

// POI type icons and labels
const POI_CONFIG: Record<string, { icon: string; label: string }> = {
  BEACH: { icon: '🏖️', label: 'Beach' },
  HOSPITAL: { icon: '🏥', label: 'Hospital' },
  INTERNATIONAL_SCHOOL: { icon: '🎓', label: 'International School' },
  THAI_SCHOOL: { icon: '🏫', label: 'Thai School' },
  SHOPPING_MALL: { icon: '🛒', label: 'Shopping Mall' },
  SUPERMARKET: { icon: '🏪', label: 'Supermarket' },
  CONVENIENCE_STORE: { icon: '🏪', label: 'Convenience Store' },
  BTS_STATION: { icon: '🚇', label: 'BTS Station' },
  MRT_STATION: { icon: '🚇', label: 'MRT Station' },
  AIRPORT: { icon: '✈️', label: 'Airport' },
  GOLF_COURSE: { icon: '⛳', label: 'Golf Course' },
  PARK: { icon: '🌳', label: 'Park' },
  RESTAURANT_AREA: { icon: '🍽️', label: 'Restaurant Area' },
  NIGHTLIFE: { icon: '🌙', label: 'Nightlife' },
  GYM: { icon: '💪', label: 'Gym' },
  TEMPLE: { icon: '🛕', label: 'Temple' },
  IMMIGRATION: { icon: '🛂', label: 'Immigration' },
  EMBASSY: { icon: '🏛️', label: 'Embassy' },
};

export default function NearbyPOIs({ propertyId }: NearbyPOIsProps) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNearbyPOIs() {
      try {
        setLoading(true);
        const res = await fetch(`/api/pois/distances?propertyId=${propertyId}&maxDistance=10&limit=15`);
        if (res.ok) {
          const data = await res.json();
          setPois(data);
        } else {
          setError('Failed to load nearby places');
        }
      } catch (err) {
        setError('Failed to load nearby places');
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) {
      fetchNearbyPOIs();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-[#49516f] mb-4">Nearby Places</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || pois.length === 0) {
    return null; // Don't show section if no POIs
  }

  // Group POIs by type and show nearest of each type
  const groupedPOIs = pois.reduce((acc, poi) => {
    const type = poi.poi.type;
    if (!acc[type] || poi.distanceKm < acc[type].distanceKm) {
      acc[type] = poi;
    }
    return acc;
  }, {} as Record<string, POI>);

  const sortedPOIs = Object.values(groupedPOIs).sort((a, b) => a.distanceKm - b.distanceKm);

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const formatTime = (mins: number | null) => {
    if (!mins) return null;
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-[#49516f] mb-4">Nearby Places</h3>
      <div className="space-y-3">
        {sortedPOIs.slice(0, 8).map((item) => {
          const config = POI_CONFIG[item.poi.type] || { icon: '📍', label: item.poi.type };
          return (
            <div key={item.poi.id} className="flex items-start gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-lg flex-shrink-0 group-hover:bg-primary-50 transition-colors">
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.poi.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-semibold text-primary-600">
                    {formatDistance(item.distanceKm)}
                  </span>
                  {item.walkingMins && item.walkingMins <= 30 && (
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {formatTime(item.walkingMins)} walk
                    </span>
                  )}
                  {item.drivingMins && item.walkingMins && item.walkingMins > 30 && (
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      {formatTime(item.drivingMins)} drive
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedPOIs.length > 8 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          +{sortedPOIs.length - 8} more places nearby
        </p>
      )}
    </div>
  );
}

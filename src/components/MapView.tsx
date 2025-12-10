'use client';

import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Image from 'next/image';
import Link from 'next/link';

interface MapViewProps {
  properties: any[];
}

export default function MapView({ properties }: MapViewProps) {
  const [popupInfo, setPopupInfo] = useState<any>(null);

  // Default to Bangkok if no properties or token
  const initialViewState = {
    longitude: 100.5018,
    latitude: 13.7563,
    zoom: 10
  };

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Mapbox Token Missing</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {properties.map((property) => (
          property.latitude && property.longitude && (
            <Marker
              key={property.id}
              longitude={Number(property.longitude)}
              latitude={Number(property.latitude)}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(property);
              }}
            >
              <div className="cursor-pointer text-2xl hover:scale-110 transition-transform">
                📍
              </div>
            </Marker>
          )
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
            className="z-50"
          >
            <div className="w-64 p-2">
              <div className="relative h-32 w-full mb-2 rounded overflow-hidden">
                <Image
                  src={popupInfo.images?.[0] || '/placeholder.jpg'}
                  alt={popupInfo.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-bold text-sm mb-1 truncate">{popupInfo.title}</h3>
              <p className="text-green-600 font-bold text-sm mb-1">
                ฿{Number(popupInfo.price).toLocaleString()}
                {popupInfo.listingType === 'RENT' && '/mo'}
              </p>
              <Link 
                href={`/properties/${popupInfo.id}`}
                className="block w-full text-center bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

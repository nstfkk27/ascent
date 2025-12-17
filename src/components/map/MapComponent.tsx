'use client';

import { useState, useCallback, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapPin from './MapPin';

// Types
interface Project {
  id: string;
  name: string;
  type?: string;
  lat: number | string;
  lng: number | string;
  imageUrl?: string | null;
  isStandalone?: boolean;
  units?: Array<{
    price?: number | null;
    rentPrice?: number | null;
    listingType?: string;
  }>;
  modelAsset: {
    glbUrl: string;
    placement: any;
  } | null;
}

interface MapComponentProps {
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  flyToLocation?: { lat: number; lng: number; zoom?: number } | null;
}

// Mapbox Token - Should be in env variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGZ5...'; // Placeholder

export default function MapComponent({ projects, onProjectSelect, flyToLocation }: MapComponentProps) {
  const [viewState, setViewState] = useState({
    latitude: 12.9276, // Pattaya
    longitude: 100.8771,
    zoom: 13,
    pitch: 0, // Default to 2D view (was 45)
    bearing: 0
  });

  useEffect(() => {
    if (flyToLocation) {
      setViewState(prev => ({
        ...prev,
        latitude: flyToLocation.lat,
        longitude: flyToLocation.lng,
        zoom: flyToLocation.zoom || 16,
        transitionDuration: 2000
      }));
    }
  }, [flyToLocation]);


  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Helper to format price for display
  const formatPrice = (project: Project): string => {
    if (!project.units || project.units.length === 0) return '';
    
    // Get min price from all units
    let minPrice: number | null = null;
    let isRent = false;
    
    project.units.forEach(unit => {
      if (unit.price && (minPrice === null || unit.price < minPrice)) {
        minPrice = unit.price;
        isRent = false;
      }
      if (unit.rentPrice && (minPrice === null || unit.rentPrice < minPrice)) {
        minPrice = unit.rentPrice;
        isRent = true;
      }
    });
    
    if (!minPrice) return '';
    
    // Format: 2.5M or 25K
    if (minPrice >= 1000000) {
      return `฿${(minPrice / 1000000).toFixed(1)}M${isRent ? '/mo' : ''}`;
    } else if (minPrice >= 1000) {
      return `฿${Math.round(minPrice / 1000)}K${isRent ? '/mo' : ''}`;
    }
    return `฿${minPrice}${isRent ? '/mo' : ''}`;
  };

  // Get marker color based on category
  const getMarkerColor = (project: Project): string => {
    switch (project.type) {
      case 'CONDO': return '#496f5d'; // Green
      case 'HOUSE': return '#3b82f6'; // Blue
      case 'LAND': return '#f59e0b'; // Orange
      case 'INVESTMENT': return '#8b5cf6'; // Purple
      default: return '#496f5d';
    }
  };

  // Load 3D models into the map style
  useEffect(() => {
    if (!mapInstance || !projects) return;

    // 3D MODELS PAUSED: 
    // We are currently not loading models to improve performance.
    // Uncomment this block to re-enable 3D models.
    
    /*
    projects.forEach(project => {
      if (project.modelAsset?.glbUrl) {
        // Check if model is already added to avoid errors
        // @ts-ignore - hasModel exists in v3
        if (mapInstance.style && !mapInstance.hasModel(project.id)) {
          try {
            // @ts-ignore - addModel exists in v3
            mapInstance.addModel(project.id, project.modelAsset.glbUrl);
          } catch (e) {
            console.error(`Failed to add model for project ${project.id}`, e);
          }
        }
      }
    });
    */
  }, [mapInstance, projects]);

  const onMapLoad = useCallback((e: any) => {
    const map = e.target;
    setMapInstance(map);
    
    // Hide standard POI labels (hotels, restaurants, etc.) to keep the map clean
    // We want to keep road labels ('road-label') and natural features
    const layers = map.getStyle().layers;
    if (layers) {
      layers.forEach((layer: any) => {
        if (layer.id.startsWith('poi-')) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    }
  }, []);

  return (
    <div className="w-full h-full relative bg-gray-100">
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-center p-2 z-50 text-sm">
          Warning: NEXT_PUBLIC_MAPBOX_TOKEN is missing in .env
        </div>
      )}

      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Price Tag Markers */}
        {projects.map((project) => {
          const price = formatPrice(project);
          const color = getMarkerColor(project);
          const isHovered = hoveredId === project.id;
          
          return (
            <Marker
              key={project.id}
              longitude={Number(project.lng)}
              latitude={Number(project.lat)}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onProjectSelect(project);
                setViewState(prev => ({
                  ...prev,
                  latitude: Number(project.lat),
                  longitude: Number(project.lng),
                  zoom: 16,
                  transitionDuration: 1000
                }));
              }}
            >
              <MapPin
                label={project.isStandalone 
                  ? (price || project.name.slice(0, 12)) 
                  : (project.name.length > 15 ? project.name.slice(0, 15) + '...' : project.name)
                }
                color={color}
                isHovered={isHovered}
                tooltipText={project.isStandalone && price ? project.name : undefined}
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}

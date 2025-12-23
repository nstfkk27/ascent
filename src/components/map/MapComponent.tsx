'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import MapPin from './MapPin';
import ClusterMarker from './ClusterMarker';

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
    houseType?: string | null;
    investmentType?: string | null;
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

  // Initialize supercluster
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
    });

    // Convert projects to GeoJSON points
    const points = projects.map(project => ({
      type: 'Feature' as const,
      properties: {
        cluster: false,
        projectId: project.id,
        project: project,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [Number(project.lng), Number(project.lat)],
      },
    }));

    cluster.load(points);
    return cluster;
  }, [projects]);

  // Get clusters for current viewport
  const clusters = useMemo(() => {
    const zoom = Math.floor(viewState.zoom);
    const bounds = [
      viewState.longitude - 1,
      viewState.latitude - 1,
      viewState.longitude + 1,
      viewState.latitude + 1,
    ] as [number, number, number, number];

    return supercluster.getClusters(bounds, zoom);
  }, [supercluster, viewState.zoom, viewState.latitude, viewState.longitude]);

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
        {/* Clustered Markers */}
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          // If it's a cluster, show cluster marker
          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  // Zoom into cluster
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(cluster.id as number),
                    20
                  );
                  setViewState(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    zoom: expansionZoom,
                    transitionDuration: 500,
                  }));
                }}
              >
                <ClusterMarker
                  pointCount={pointCount}
                  isHovered={hoveredId === `cluster-${cluster.id}`}
                  onMouseEnter={() => setHoveredId(`cluster-${cluster.id}`)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </Marker>
            );
          }

          // Individual project marker
          const project = cluster.properties.project as Project;
          const price = formatPrice(project);
          const color = getMarkerColor(project);
          const isHovered = hoveredId === project.id;
          
          // Zoom-based label visibility
          const zoom = viewState.zoom;
          let label = '';
          let showLabel = true;
          
          if (zoom < 13) {
            // Very zoomed out: no label (clustering handles this)
            showLabel = false;
          } else if (zoom >= 13) {
            // Medium to close up: show project name or subtype
            if (project.isStandalone) {
              // Standalone unit: show subtype (houseType or investmentType)
              const unit = project.units?.[0];
              const subtype = unit?.houseType || unit?.investmentType || project.type;
              label = subtype ? subtype.replace(/_/g, ' ') : project.name.slice(0, 12);
            } else {
              // Project: show project name
              label = project.name.length > 15 ? project.name.slice(0, 15) + '...' : project.name;
            }
          }
          
          return (
            <Marker
              key={project.id}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onProjectSelect(project);
                setViewState(prev => ({
                  ...prev,
                  latitude,
                  longitude,
                  zoom: 16,
                  transitionDuration: 1000
                }));
              }}
            >
              <MapPin
                label={showLabel ? label : ''}
                color={color}
                isHovered={isHovered}
                tooltipText={project.name}
                showDot={!showLabel}
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

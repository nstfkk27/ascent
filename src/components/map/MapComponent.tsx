'use client';

import { useState, useCallback, useEffect } from 'react';
import Map, { NavigationControl, Source, Layer, MapMouseEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// Types
interface Project {
  id: string;
  name: string;
  lat: number | string;
  lng: number | string;
  imageUrl?: string | null;
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

  const togglePitch = () => {
    setViewState(prev => ({
      ...prev,
      pitch: prev.pitch === 0 ? 45 : 0,
      transitionDuration: 1000
    }));
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

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

  // Create GeoJSON source from projects
  const projectsGeoJSON = {
    type: 'FeatureCollection',
    features: projects.map(p => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(p.lng), Number(p.lat)]
      },
      properties: {
        id: p.id,
        name: p.name,
        hasModel: !!p.modelAsset,
        modelId: p.modelAsset ? p.id : null
      }
    }))
  };

  const onMouseEnter = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features[0]) {
      setHoveredId(e.features[0].properties?.id);
      // Change cursor
      const canvas = e.target.getCanvas();
      canvas.style.cursor = 'pointer';
    }
  }, []);

  const onMouseLeave = useCallback((e: MapMouseEvent) => {
    setHoveredId(null);
    const canvas = e.target.getCanvas();
    canvas.style.cursor = '';
  }, []);

  const onClick = useCallback((e: MapMouseEvent) => {
    if (e.features && e.features[0]) {
      const projectId = e.features[0].properties?.id;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        onProjectSelect(project);
        // Fly to location
        setViewState(prev => ({
          ...prev,
          latitude: Number(project.lat),
          longitude: Number(project.lng),
          zoom: 16,
          transitionDuration: 1000
        }));
      }
    }
  }, [projects, onProjectSelect]);

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

      {/* Custom Controls */}
      <div className="absolute top-36 right-4 z-10">
        <button
          onClick={togglePitch}
          className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg hover:bg-white text-gray-700 font-medium text-sm border border-gray-200 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          {viewState.pitch === 0 ? '3D View (45°)' : '2D View (90°)'}
        </button>
      </div>
      
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['project-points', 'project-circles']}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        // terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }} // Disabled for performance
      >
        <NavigationControl position="top-right" />

        {/* 3D Buildings Layer - Disabled to improve performance and highlight only our listings */}
        {/* <Layer
          id="3d-buildings"
          source="composite"
          source-layer="building"
          filter={['==', 'extrude', 'true']}
          type="fill-extrusion"
          minzoom={14}
          paint={{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }}
        /> */}

        {/* Project Markers */}
        <Source id="projects" type="geojson" data={projectsGeoJSON as any}>
          {/* 3D Models Layer - PAUSED */}
          {/* <Layer
            id="project-models"
            type="model"
            layout={{
              'model-id': ['get', 'modelId'],
              'model-scale': [1, 1, 1],
              'model-rotation': [0, 0, 0],
              'visibility': 'visible'
            } as any}
            paint={{
              'model-opacity': 1
            } as any}
            filter={['has', 'modelId']}
          /> */}

          {/* Outer Circle (Pulse effect could be added here) */}
          <Layer
            id="project-circles"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 4,
                15, 12
              ],
              'circle-color': '#496f5d',
              'circle-opacity': 0.4,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff'
            }}
          />
          
          {/* Inner Point */}
          <Layer
            id="project-points"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                10, 2,
                15, 6
              ],
              'circle-color': '#496f5d',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }}
          />

          {/* Labels */}
          <Layer
            id="project-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
              'text-radial-offset': 0.5,
              'text-justify': 'auto',
              'text-size': 12
            }}
            paint={{
              'text-color': '#333333',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }}
          />
        </Source>
      </Map>
    </div>
  );
}

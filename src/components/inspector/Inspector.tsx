'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define types locally or import from Prisma
interface Unit {
  id: string;
  title: string;
  price: number | null;
  rentPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number;
  images: string[];
  listingType: string;
}

interface Facility {
  id: string;
  name: string;
  imageUrl: string;
}

interface Project {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  developer: string | null;
  completionYear: number | null;
  totalUnits: number | null;
  totalFloors: number | null;
  totalBuildings: number | null;
  description: string | null;
  modelAsset: {
    glbUrl: string;
    placement: any;
  } | null;
  units: Unit[];
  facilities: Facility[];
}

interface InspectorProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

export default function Inspector({ project, isOpen, onClose }: InspectorProps) {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import model-viewer to avoid SSR issues
    import('@google/model-viewer').catch(console.error);
  }, []);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto border-l border-gray-100">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="bg-white/80 backdrop-blur p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview Section (Image or 3D) */}
      <div className="h-[300px] bg-gray-900 relative border-b border-gray-100 group">
        {project.imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : project.modelAsset ? (
          <model-viewer
            ref={modelViewerRef}
            src={project.modelAsset.glbUrl}
            ios-src=""
            poster=""
            alt={`3D model of ${project.name}`}
            shadow-intensity="1"
            camera-controls
            auto-rotate
            ar
            style={{ width: '100%', height: '100%' }}
            camera-orbit="45deg 55deg 105%"
          >
            <div slot="progress-bar"></div>
          </model-viewer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">No Preview Available</span>
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm pointer-events-auto">
            <h2 className="text-lg font-bold text-gray-900">{project.name}</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{project.type}</p>
          </div>
          
          <Link 
            href={`/project/${encodeURIComponent(project.name.replace(/ /g, '-'))}`}
            className="bg-[#496f5d] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-[#3d5c4d] transition-colors pointer-events-auto flex items-center gap-1"
          >
            Full Page
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-8">
        {/* Project Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Developer</p>
            <p className="font-medium text-gray-900">{project.developer || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-gray-500">Completion</p>
            <p className="font-medium text-gray-900">{project.completionYear || 'Ready to Move'}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Units</p>
            <p className="font-medium text-gray-900">{project.totalUnits || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Floors</p>
            <p className="font-medium text-gray-900">{project.totalFloors || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500">Buildings</p>
            <p className="font-medium text-gray-900">{project.totalBuildings || '-'}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {project.description || 'No description available.'}
          </p>
        </div>

        {/* Facilities */}
        {project.facilities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Facilities</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {project.facilities.map((facility) => (
                <div key={facility.id} className="flex-shrink-0 w-24 space-y-1">
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image 
                      src={facility.imageUrl} 
                      alt={facility.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-600 truncate">{facility.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Units */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
            Available Units ({project.units.length})
          </h3>
          <div className="space-y-3">
            {project.units.map((unit) => (
              <div key={unit.id} className="group flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#496f5d] hover:shadow-md transition-all cursor-pointer bg-white">
                <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {unit.images[0] ? (
                    <Image 
                      src={unit.images[0]} 
                      alt={unit.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 truncate pr-2">{unit.title}</h4>
                    <div className="flex flex-col items-end">
                      {unit.price ? (
                        <span className="text-[#496f5d] font-bold text-sm">
                          ฿{Number(unit.price).toLocaleString()}
                        </span>
                      ) : null}
                      {unit.rentPrice ? (
                        <span className="text-orange-600 font-bold text-xs">
                          ฿{Number(unit.rentPrice).toLocaleString()}/mo
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {unit.bedrooms ? `${unit.bedrooms} Bed` : 'Studio'} • {unit.bathrooms ? `${unit.bathrooms} Bath` : '-'} • {unit.size}m²
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      unit.listingType === 'SALE' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {unit.listingType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {project.units.length === 0 && (
              <p className="text-sm text-gray-500 italic">No units currently listed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
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
  
  // Mobile Drawer State
  const [isMobile, setIsMobile] = useState(false);
  const [snapState, setSnapState] = useState<'peek' | 'mini' | 'full'>('mini');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset to mini when opening new project on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      setSnapState('mini');
      setDragOffset(0);
    }
  }, [isOpen, project?.id, isMobile]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    
    // Calculate current translation based on state
    let baseTranslate = 0;
    const height = drawerRef.current?.offsetHeight || window.innerHeight * 0.85;
    
    if (snapState === 'mini') baseTranslate = height * 0.55;
    if (snapState === 'peek') baseTranslate = height - 100; // 100px peek
    
    currentY.current = baseTranslate;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    const deltaY = e.touches[0].clientY - startY.current;
    const newOffset = deltaY;
    
    // Limit dragging up past full
    if (currentY.current + newOffset < -50) return; 

    setDragOffset(newOffset);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    setIsDragging(false);
    
    const height = drawerRef.current?.offsetHeight || window.innerHeight * 0.85;
    const totalMove = currentY.current + dragOffset;
    
    // Thresholds
    const miniThreshold = height * 0.35;
    const peekThreshold = height * 0.75;

    // Determine nearest snap point
    // Logic: If moved significantly, snap to next state. Else revert.
    // Simple nearest neighbor approach based on position:
    
    if (totalMove < miniThreshold) {
      setSnapState('full');
    } else if (totalMove < peekThreshold) {
      setSnapState('mini');
    } else {
      setSnapState('peek');
    }
    
    setDragOffset(0);
  };

  // Calculate transform for mobile
  const getMobileTransform = () => {
    if (!isMobile) return undefined;
    
    // Base positions
    // Full: 0
    // Mini: 55%
    // Peek: Calc based on height
    
    let base = 0; // full
    const height = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800;
    
    if (snapState === 'mini') base = 55; // percent
    if (snapState === 'peek') base = ((height - 100) / height) * 100; // percent to show 100px

    if (isDragging) {
        return `translateY(calc(${base}% + ${dragOffset}px))`;
    }
    return `translateY(${base}%)`;
  };

  useEffect(() => {
    // Dynamically import model-viewer to avoid SSR issues
    import('@google/model-viewer').catch(console.error);
  }, []);

  if (!isOpen || !project) return null;

  return (
    <>
      {/* Backdrop for mobile (optional, maybe transparent) */}
      {isMobile && isOpen && snapState !== 'peek' && (
        <div 
            className="fixed inset-0 bg-black/20 z-40 transition-opacity" 
            onClick={() => setSnapState('peek')}
        />
      )}

      <div 
        ref={drawerRef}
        className={`fixed z-50 bg-white shadow-2xl transition-transform ease-out
            ${isMobile 
                ? 'bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-2xl border-t border-gray-100' 
                : 'inset-y-0 right-0 w-[500px] border-l border-gray-100 duration-300'
            }
        `}
        style={{ 
            transform: isMobile ? getMobileTransform() : undefined,
            transitionDuration: isDragging ? '0ms' : '300ms',
            touchAction: 'none' // Prevent browser scrolling while dragging
        }}
      >
      {/* Mobile Handle */}
      {isMobile && (
        <div 
            className="w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-gray-50 bg-white rounded-t-2xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* Close Button (Desktop Only or Full State Mobile) */}
      <div className={`absolute top-4 right-4 z-10 ${isMobile && snapState !== 'full' ? 'hidden' : ''}`}>
        <button 
          onClick={onClose}
          className="bg-white/80 backdrop-blur p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Container */}
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
      
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
      </div>
    </>
  );
}

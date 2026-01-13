'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createCompoundSlug } from '@/utils/propertyHelpers';

// Define types locally or import from Prisma
interface Unit {
  id: string;
  slug?: string;
  title: string;
  price: number | null;
  rentPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: number;
  floor?: number | null;
  images: string[];
  listingType: string;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  coAgentCommissionRate?: number | null;
}

interface Facility {
  id: string;
  name: string;
  imageUrl: string;
}

interface Project {
  id: string;
  slug?: string;
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
  isStandalone?: boolean;
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
  
  // Project Details Accordion State
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  
  // Facility Image Modal State
  const [selectedFacilityIndex, setSelectedFacilityIndex] = useState<number | null>(null);
  const selectedFacility = selectedFacilityIndex !== null && project?.facilities[selectedFacilityIndex] ? project.facilities[selectedFacilityIndex] : null;
  
  // Touch swipe state for facility modal
  const facilityStartX = useRef(0);
  const facilityCurrentX = useRef(0);
  const [facilitySwipeOffset, setFacilitySwipeOffset] = useState(0);
  const [isFacilitySwiping, setIsFacilitySwiping] = useState(false);

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

  const handlePreviousFacility = useCallback(() => {
    if (!project || selectedFacilityIndex === null) return;
    const newIndex = selectedFacilityIndex > 0 ? selectedFacilityIndex - 1 : project.facilities.length - 1;
    setSelectedFacilityIndex(newIndex);
  }, [project, selectedFacilityIndex]);

  const handleNextFacility = useCallback(() => {
    if (!project || selectedFacilityIndex === null) return;
    const newIndex = selectedFacilityIndex < project.facilities.length - 1 ? selectedFacilityIndex + 1 : 0;
    setSelectedFacilityIndex(newIndex);
  }, [project, selectedFacilityIndex]);

  // Keyboard navigation for facility modal
  useEffect(() => {
    if (selectedFacilityIndex === null || !project) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousFacility();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextFacility();
      } else if (e.key === 'Escape') {
        setSelectedFacilityIndex(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFacilityIndex, project, handlePreviousFacility, handleNextFacility]);

  const handleFacilityTouchStart = (e: React.TouchEvent) => {
    setIsFacilitySwiping(true);
    facilityStartX.current = e.touches[0].clientX;
    facilityCurrentX.current = facilityStartX.current;
  };

  const handleFacilityTouchMove = (e: React.TouchEvent) => {
    if (!isFacilitySwiping) return;
    facilityCurrentX.current = e.touches[0].clientX;
    const diff = facilityCurrentX.current - facilityStartX.current;
    setFacilitySwipeOffset(diff);
  };

  const handleFacilityTouchEnd = () => {
    if (!isFacilitySwiping) return;
    setIsFacilitySwiping(false);
    
    const diff = facilityCurrentX.current - facilityStartX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handlePreviousFacility();
      } else {
        handleNextFacility();
      }
    }
    
    setFacilitySwipeOffset(0);
  };

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
        {project.imageUrl && project.imageUrl.trim() !== '' ? (
          <div className="relative w-full h-full">
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
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
            href={project.isStandalone 
              ? (project.units[0]?.slug ? `/properties/${createCompoundSlug(project.units[0].slug, project.units[0].id)}` : `/properties/${project.id}`)
              : `/project/${encodeURIComponent(project.name.replace(/ /g, '-'))}`}
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
      <div className="p-6 space-y-6">
        {/* Project/Property Details */}
        {project.isStandalone ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Price</p>
              <div className="font-medium text-gray-900">
                {project.units[0]?.price && Number(project.units[0].price) > 0 && (
                  <>
                    <span className="text-[#496f5d] block">฿{Number(project.units[0].price).toLocaleString()}</span>
                    {project.type === 'LAND' && project.units[0]?.size && Number(project.units[0].size) > 0 && (
                      <span className="text-xs text-gray-500 block mt-1">
                        ฿{Math.round(Number(project.units[0].price) / Number(project.units[0].size)).toLocaleString()}/m²
                      </span>
                    )}
                  </>
                )}
                {project.units[0]?.rentPrice && Number(project.units[0].rentPrice) > 0 && (
                  <span className="text-orange-600 block">฿{Number(project.units[0].rentPrice).toLocaleString()}/mo</span>
                )}
                {(!project.units[0]?.price || Number(project.units[0].price) === 0) && (!project.units[0]?.rentPrice || Number(project.units[0].rentPrice) === 0) && (
                  <span>Contact for Price</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-500">Size</p>
              <p className="font-medium text-gray-900">{project.units[0]?.size || '-'} m²</p>
            </div>
            {project.type === 'LAND' ? (
              <>
                <div>
                  <p className="text-gray-500">Land Zone</p>
                  <p className="font-medium text-gray-900">{(project.units[0] as any)?.landZoneColor || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{project.type.toLowerCase().replace('_', ' ')}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-gray-500">Bedrooms</p>
                  <p className="font-medium text-gray-900">{project.units[0]?.bedrooms || 'Studio'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bathrooms</p>
                  <p className="font-medium text-gray-900">{project.units[0]?.bathrooms || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{project.type.toLowerCase().replace('_', ' ')}</p>
                </div>
              </>
            )}
          </div>

          {/* Agent Commission (Standalone) */}
          {(project.units[0]?.commissionRate || project.units[0]?.commissionAmount || project.units[0]?.coAgentCommissionRate) && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm mt-2">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                <span>🛡️</span> Agent Commission
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {project.units[0]?.commissionRate && (
                  <div>
                    <span className="text-blue-600 block text-xs">Full Rate</span>
                    <span className="font-bold text-blue-900">{project.units[0].commissionRate}%</span>
                  </div>
                )}
                {project.units[0]?.commissionAmount && (
                  <div>
                    <span className="text-blue-600 block text-xs">Fixed Amt</span>
                    <span className="font-bold text-blue-900">฿{project.units[0].commissionAmount.toLocaleString()}</span>
                  </div>
                )}
                {project.units[0]?.coAgentCommissionRate && (
                  <div>
                    <span className="text-blue-600 block text-xs">Co-Agent</span>
                    <span className="font-bold text-blue-900">{project.units[0].coAgentCommissionRate}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Completion</p>
                <p className="font-bold text-gray-900">{project.completionYear || 'Ready'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Total Units</p>
                <p className="font-bold text-gray-900">{project.totalUnits || '-'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Floors</p>
                <p className="font-bold text-gray-900">{project.totalFloors || '-'}</p>
              </div>
            </div>

            {/* More Details Accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDetailsExpanded ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900">More Details</h3>
                </div>
              </button>
              
              {/* Collapsible Content */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isDetailsExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="p-4 space-y-4">
                  {/* Developer & Buildings */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Developer</p>
                      <p className="font-medium text-gray-900">{project.developer || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Buildings</p>
                      <p className="font-medium text-gray-900">{project.totalBuildings || '-'}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">About</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  )}

                  {/* Facilities Section */}
                  {project.facilities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Facilities</h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {project.facilities.map((facility) => (
                          <div key={facility.id} className="flex-shrink-0 w-24 space-y-1">
                            <button
                              onClick={() => setSelectedFacilityIndex(project.facilities.indexOf(facility))}
                              className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#496f5d] transition-all group"
                            >
                              {facility.imageUrl && facility.imageUrl.trim() !== '' ? (
                                <>
                                  <Image 
                                    src={facility.imageUrl} 
                                    alt={facility.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-200"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </button>
                            <p className="text-xs text-center text-gray-600 truncate">{facility.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Units */}
        {!project.isStandalone && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Available Units ({project.units.length})
            </h3>
            <div className="space-y-3">
              {project.units.map((unit) => {
                // Generate property URL - use slug if available, otherwise fall back to ID
                const propertyUrl = unit.slug 
                  ? `/properties/${createCompoundSlug(unit.slug, unit.id)}`
                  : `/properties/${unit.id}`;
                
                return (
                <Link 
                  key={unit.id} 
                  href={propertyUrl}
                  className="group flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-[#496f5d] hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {unit.images && unit.images[0] && unit.images[0].trim() !== '' ? (
                      <Image 
                        src={unit.images[0]} 
                        alt={unit.title}
                        fill
                        className="object-cover"
                        unoptimized
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
                      {unit.bedrooms ? `${unit.bedrooms} Bed` : 'Studio'} • {unit.bathrooms ? `${unit.bathrooms} Bath` : '-'} • {unit.size}m²{unit.floor ? ` • Floor ${unit.floor}` : ''}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        unit.listingType === 'SALE' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {unit.listingType}
                      </span>
                    </div>
                  </div>
                </Link>
              );
              })}
              {project.units.length === 0 && (
                <p className="text-sm text-gray-500 italic">No units currently listed.</p>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Facility Image Modal */}
      {selectedFacility && project && (
        <div 
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedFacilityIndex(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedFacilityIndex(null)}
              className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 backdrop-blur p-2 rounded-full transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute -top-12 left-0 text-white text-sm bg-white/10 backdrop-blur px-3 py-2 rounded-full">
              {selectedFacilityIndex !== null ? selectedFacilityIndex + 1 : 0} / {project.facilities.length}
            </div>

            {/* Previous Button */}
            {project.facilities.length > 1 && (
              <button
                onClick={handlePreviousFacility}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur p-3 rounded-full transition-colors z-10"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {project.facilities.length > 1 && (
              <button
                onClick={handleNextFacility}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur p-3 rounded-full transition-colors z-10"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Image Container */}
            <div 
              className="relative w-full h-[70vh] bg-gray-900 rounded-lg overflow-hidden touch-none"
              onTouchStart={handleFacilityTouchStart}
              onTouchMove={handleFacilityTouchMove}
              onTouchEnd={handleFacilityTouchEnd}
              style={{
                transform: isFacilitySwiping ? `translateX(${facilitySwipeOffset}px)` : undefined,
                transition: isFacilitySwiping ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {selectedFacility.imageUrl && selectedFacility.imageUrl.trim() !== '' ? (
                <Image
                  src={selectedFacility.imageUrl}
                  alt={selectedFacility.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span>No Image Available</span>
                </div>
              )}
            </div>

            {/* Facility Name */}
            <div className="mt-4 text-center">
              <h3 className="text-white text-xl font-semibold">{selectedFacility.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Swipe or use arrow keys to navigate</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

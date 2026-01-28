import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  // Decode the slug to get the project name (e.g., "Riviera-Oceandrive" -> "Riviera Oceandrive")
  // For simplicity, let's assume the slug IS the name or we try to match it loosely.
  // A better approach is to add a 'slug' field to DB, but we'll try to find by name first.
  
  const decodedName = decodeURIComponent(params.slug).replace(/-/g, ' ');

  // Try to find exact match or close match
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: { equals: decodedName, mode: 'insensitive' } },
        { name: { equals: params.slug, mode: 'insensitive' } }
      ]
    },
    include: {
      modelAsset: true,
      facilities: true,
      units: {
        where: { status: 'AVAILABLE' }
      }
    }
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* Hero Section with Image or 3D Model */}
      <div className="bg-gray-900 h-[60vh] relative overflow-hidden group">
        {project.imageUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={project.imageUrl}
              alt={project.name}
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900" />
          </div>
        ) : project.modelAsset ? (
           <div className="w-full h-full">
             {/* We can embed the model viewer here or just a cover image */}
             {/* For now, let's use a placeholder image if no specific cover, or the model */}
             <div className="absolute inset-0 flex items-center justify-center text-white/50">
                <p>3D Model View (Coming Soon to Full Page)</p>
             </div>
           </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
        )}
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block px-3 py-1 bg-[#496f5d] text-white text-xs font-bold rounded-full mb-4">
              {project.type}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{project.name}</h1>
            <p className="text-xl text-gray-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.address}, {project.city}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Description */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {project.name}</h2>
              <div className="prose max-w-none text-gray-600 leading-relaxed">
                {project.description || 'No description available.'}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Developer</p>
                  <p className="font-semibold text-gray-900">{project.developer || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion</p>
                  <p className="font-semibold text-gray-900">{project.completionYear || 'Ready'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Units</p>
                  <p className="font-semibold text-gray-900">{project.totalUnits || project.units.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Floors</p>
                  <p className="font-semibold text-gray-900">{project.totalFloors || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Buildings</p>
                  <p className="font-semibold text-gray-900">{project.totalBuildings || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Type</p>
                  <p className="font-semibold text-gray-900">{project.type}</p>
                </div>
              </div>
            </section>

            {/* Facilities */}
            {project.facilities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Facilities & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.facilities.map((facility) => (
                    <div key={facility.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {facility.imageUrl ? (
                          <Image 
                            src={facility.imageUrl} 
                            alt={facility.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-500">Img</span>
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-700">{facility.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Available Units */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Units</h2>
              <div className="space-y-4">
                {project.units.map((unit) => (
                  <div key={unit.id} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-[#496f5d] transition-all flex flex-col md:flex-row gap-6 group">
                    <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {unit.images[0] ? (
                        <Image 
                          src={unit.images[0]} 
                          alt={unit.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                      )}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                          unit.listingType === 'SALE' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {unit.listingType}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#496f5d] transition-colors">{unit.title}</h3>
                          <p className="text-xl font-bold text-[#496f5d]">
                            ฿{Number(unit.price).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{unit.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            🛏️ {unit.bedrooms || 0} Bed
                          </span>
                          <span className="flex items-center gap-1">
                            🚿 {unit.bathrooms || 0} Bath
                          </span>
                          <span className="flex items-center gap-1">
                            📏 {unit.size} m²
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex justify-end">
                        <Link 
                          href={`/properties/${unit.id}`}
                          className="text-sm font-medium text-[#496f5d] hover:text-[#3d5c4d] flex items-center gap-1"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {project.units.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No units currently available in this project.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enquire Now Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-[#49516f] mb-4">Enquire Now</h3>
              
              <div className="mb-6">
                <p className="text-base font-bold text-[#49516f] mb-1">Ascent Real Estate</p>
                <p className="text-sm text-gray-600">064-679-9050</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <a
                  href="tel:0646799050"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#496f5d] text-white rounded-lg hover:bg-[#3d5a4a] transition-colors text-sm font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
                <a
                  href="https://wa.me/66646799050"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              <a
                href="https://line.me/ti/p/~stefan.asc"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00B900] text-white rounded-lg hover:bg-[#00A000] transition-colors text-sm font-semibold mb-3 w-full"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                Line
              </a>

              <a
                href="mailto:info@estateascent.com"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>

            {/* Project Highlights Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[#49516f] mb-4">Project Highlights</h3>
              
              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏗️</span>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-[#49516f]">
                      {project.completionYear && project.completionYear > new Date().getFullYear() 
                        ? 'Under Construction' 
                        : 'Completed'}
                    </p>
                  </div>
                </div>
                {project.completionYear && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-sm text-gray-600">Completion</p>
                      <p className="font-semibold text-[#49516f]">{project.completionYear}</p>
                    </div>
                  </div>
                )}
                {project.totalUnits && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏠</span>
                    <div>
                      <p className="text-sm text-gray-600">Total Units</p>
                      <p className="font-semibold text-[#49516f]">{project.totalUnits}</p>
                    </div>
                  </div>
                )}
                {project.totalFloors && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className="text-sm text-gray-600">Floors</p>
                      <p className="font-semibold text-[#49516f]">{project.totalFloors}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#496f5d] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{project.address}, {project.city}</p>
                  </div>
                </div>

                {project.lat && project.lng && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#496f5d] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">View on Map</p>
                      <a 
                        href={`https://www.google.com/maps?q=${project.lat},${project.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#496f5d] hover:text-[#3d5a4a] font-semibold inline-block"
                      >
                        Open Google Maps →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

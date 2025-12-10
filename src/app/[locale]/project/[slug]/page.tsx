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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Interested in this project?</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Contact our team to schedule a viewing or get more information about {project.name}.
              </p>
              
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                />
                <textarea 
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#496f5d]"
                ></textarea>
                <button className="w-full bg-[#496f5d] text-white font-bold py-3 rounded-lg hover:bg-[#3d5c4d] transition-colors shadow-lg shadow-[#496f5d]/20">
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

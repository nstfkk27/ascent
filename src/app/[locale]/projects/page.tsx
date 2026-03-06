import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { Building2, MapPin, Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'New Projects | Estate Ascent',
  description: 'Explore our presale and under-construction projects in Pattaya. Invest in your future property today.',
};

export default async function ProjectsPage() {
  // Fetch all projects that are in construction (presale/under construction)
  const currentYear = new Date().getFullYear();
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { completionYear: { gte: currentYear } }, // Completion year is current year or future
        { completionYear: null } // Or no completion year set (still in construction)
      ]
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      imageUrl: true,
      completionYear: true,
      developer: true,
      totalUnits: true,
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 py-24">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#49516f]">New Projects</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Discover presale and under-construction projects in Pattaya. Be the first to invest in these exciting new developments.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectSlug = project.name.replace(/\s+/g, '-');

              return (
                <Link
                  key={project.id}
                  href={`/projects/${projectSlug}-${project.id.substring(0, 8)}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        <Calendar className="w-3 h-3" />
                        {project.completionYear ? `Est. ${project.completionYear}` : 'In Construction'}
                      </span>
                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#49516f] mb-2 group-hover:text-[#496f5d] transition-colors">
                      {project.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{project.city}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {project.type && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Type:</span>
                          <span className="font-medium text-gray-900">{project.type}</span>
                        </div>
                      )}
                      {project.developer && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Developer:</span>
                          <span className="font-medium text-gray-900">{project.developer}</span>
                        </div>
                      )}
                      {project.totalUnits && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total Units:</span>
                          <span className="font-medium text-gray-900">{project.totalUnits}</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Link */}
                    <div className="flex items-center gap-2 text-[#496f5d] font-semibold group-hover:gap-3 transition-all">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Available</h3>
            <p className="text-gray-500">Check back soon for new presale and construction projects.</p>
          </div>
        )}
      </div>
    </main>
  );
}

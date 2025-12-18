import { prisma } from '@/lib/prisma';
import { updateProject, linkMatchingUnits, addFacility, deleteFacility, deleteProject } from '../actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ModelUrlInput from '@/components/agent/ModelUrlInput';
import AddFacilityForm from '@/components/agent/AddFacilityForm';
import ImageUrlInput from '@/components/agent/ImageUrlInput';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      modelAsset: true,
      units: true,
      facilities: true
    }
  });

  if (!project) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <Link href="/agent/project-manager" className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Project: {project.name}</h1>
          <p className="text-gray-600">ID: {project.id}</p>
        </div>
        <a 
          href={`/project/${project.name}`} 
          target="_blank"
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          View Public Page 
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form action={updateProject.bind(null, project.id)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Project Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input 
                name="name" 
                defaultValue={project.name}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                name="description" 
                rows={4}
                defaultValue={project.description || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Year</label>
                <input 
                  name="completionYear" 
                  type="number"
                  defaultValue={project.completionYear || ''}
                  placeholder="e.g. 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                <input 
                  name="totalUnits" 
                  type="number"
                  defaultValue={project.totalUnits || ''}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                <input 
                  name="totalFloors" 
                  type="number"
                  defaultValue={project.totalFloors || ''}
                  placeholder="e.g. 45"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Buildings</label>
                <input 
                  name="totalBuildings" 
                  type="number"
                  defaultValue={project.totalBuildings || ''}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Project Assets</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <ImageUrlInput defaultValue={(project as any).imageUrl || ''} />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-800">
                <p className="font-semibold">How to add a 3D Model:</p>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Upload your <code>.glb</code> file to a public storage (e.g. Supabase Storage, AWS S3).</li>
                  <li>Paste the public URL below.</li>
                  <li>The map will automatically load this model at the project coordinates.</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model URL (.glb)</label>
                <ModelUrlInput defaultValue={project.modelAsset?.glbUrl || ''} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Facilities Management */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Facilities & Amenities</h2>
            
            {/* List Existing Facilities */}
            <div className="space-y-4 mb-8">
              {project.facilities.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No facilities added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.facilities.map((facility: any) => (
                    <div key={facility.id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-800">{facility.name}</h4>
                        {facility.imageUrl && (
                          <a href={facility.imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block max-w-[200px]">
                            View Image
                          </a>
                        )}
                      </div>
                      <form action={deleteFacility.bind(null, facility.id, project.id)}>
                        <button type="submit" className="text-red-500 hover:text-red-700 text-sm px-2 py-1">
                          Delete
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Facility */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Add New Facility</h3>
              <AddFacilityForm projectId={project.id} />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Latitude:</span>
                <span className="font-mono">{Number(project.lat).toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Longitude:</span>
                <span className="font-mono">{Number(project.lng).toFixed(6)}</span>
              </div>
              <div className="pt-2 text-gray-600">
                {project.address}, {project.city}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Units ({project.units.length})</h2>
            {project.units.length === 0 ? (
              <p className="text-gray-500 text-sm">No units linked to this project yet.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {project.units.map((unit: any) => (
                  <li key={unit.id} className="text-sm border-b border-gray-50 last:border-0 pb-2">
                    <div className="font-medium text-gray-800">{unit.title}</div>
                    <div className="text-gray-500 flex justify-between">
                      <span>{unit.listingType}</span>
                      <span>฿{Number(unit.price).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <Link href="/agent/create" className="block text-blue-600 text-sm hover:underline">
                + Add new unit manually
              </Link>
              
              <form action={linkMatchingUnits.bind(null, project.id, project.name)}>
                <button 
                  type="submit" 
                  className="w-full text-center text-xs text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 rounded p-2 hover:border-blue-300 transition-colors"
                  title="Finds standalone properties with matching project name and links them here"
                >
                  Auto-link units matching &quot;{project.name}&quot;
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

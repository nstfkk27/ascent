'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import { addFacility } from '@/app/[locale]/agent/project-manager/actions';

export default function AddFacilityForm({ projectId }: { projectId: string }) {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <form action={async (formData) => {
      await addFacility(projectId, formData);
      setImageUrl(''); // Reset image url after submission
    }} className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input 
            name="name" 
            required 
            placeholder="Facility Name (e.g. Sky Pool)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex-1">
          <input 
            name="imageUrl" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (Optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap h-fit"
        >
          Add Facility
        </button>
      </div>
      <div className="w-full md:w-1/2 ml-auto">
        <FileUpload 
          bucket="facilities" 
          accept="image/*" 
          label="Or upload image" 
          onUploadComplete={(url) => setImageUrl(url)} 
        />
      </div>
    </form>
  );
}

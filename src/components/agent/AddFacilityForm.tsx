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
      <div className="flex flex-col gap-3">
        <div>
          <input 
            name="name" 
            required 
            placeholder="Facility Name (e.g. Sky Pool)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <FileUpload 
            bucket="facilities" 
            accept="image/*" 
            label="Upload facility image (Optional)" 
            onUploadComplete={(url) => setImageUrl(url)} 
          />
          <input type="hidden" name="imageUrl" value={imageUrl} />
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Add Facility
        </button>
      </div>
    </form>
  );
}

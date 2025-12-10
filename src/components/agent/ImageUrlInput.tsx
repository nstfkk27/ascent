'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';

interface ImageUrlInputProps {
  defaultValue?: string;
}

export default function ImageUrlInput({ defaultValue = '' }: ImageUrlInputProps) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <input 
        name="imageUrl" 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://.../image.jpg"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
      />
      <FileUpload 
        bucket="facilities" 
        accept="image/*" 
        label="Or upload image" 
        onUploadComplete={(newUrl) => setUrl(newUrl)} 
      />
      {url && (
        <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

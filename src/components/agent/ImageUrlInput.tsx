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
      <FileUpload 
        bucket="facilities" 
        accept="image/*" 
        label="Upload image" 
        onUploadComplete={(newUrl) => setUrl(newUrl)} 
      />
      <input type="hidden" name="imageUrl" value={url} />
      {url && (
        <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

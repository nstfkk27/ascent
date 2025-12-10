'use client';

import { useState } from 'react';
import FileUpload from '@/components/ui/FileUpload';

interface ModelUrlInputProps {
  defaultValue?: string;
}

export default function ModelUrlInput({ defaultValue = '' }: ModelUrlInputProps) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <input 
        name="glbUrl" 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://.../model.glb"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900"
      />
      <FileUpload 
        bucket="models" 
        accept=".glb" 
        label="Or upload .glb file" 
        onUploadComplete={(newUrl) => setUrl(newUrl)} 
      />
    </div>
  );
}

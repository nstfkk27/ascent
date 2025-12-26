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
      <FileUpload 
        bucket="models" 
        accept=".glb" 
        label="Upload .glb file" 
        onUploadComplete={(newUrl) => setUrl(newUrl)} 
      />
      <input type="hidden" name="glbUrl" value={url} />
    </div>
  );
}

'use client';

import { useState } from 'react';

interface FileUploadProps {
  bucket: string;
  onUploadComplete: (url: string) => void;
  accept?: string;
  label?: string;
  folder?: string;
}

export default function FileUpload({ 
  bucket, 
  onUploadComplete, 
  accept = "image/*", 
  label = "Upload File",
  folder = ""
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(false);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.');
      }

      const file = event.target.files[0];

      // Upload to Cloudinary via our API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder || bucket);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
        {uploading && <span className="text-sm text-blue-600 animate-pulse">Uploading...</span>}
        {success && <span className="text-sm text-green-600 font-medium">✅ Uploaded!</span>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper to generate signed upload URL
export async function getSignedUploadUrl(folder: string = 'properties') {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: `ascent/${folder}`,
      upload_preset: 'unsigned_upload',
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: `ascent/${folder}`,
  };
}

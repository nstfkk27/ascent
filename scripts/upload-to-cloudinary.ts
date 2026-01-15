import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  filename: string;
  url: string;
  publicId: string;
  success: boolean;
  error?: string;
}

async function uploadImagesToCloudinary(folderPath: string, cloudinaryFolder: string = 'properties'): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  // Check if folder exists
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    return results;
  }

  // Get all image files
  const files = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });

  if (files.length === 0) {
    console.log('⚠️  No image files found in folder');
    return results;
  }

  console.log(`📁 Found ${files.length} images to upload\n`);

  // Upload each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(folderPath, file);
    
    try {
      console.log(`[${i + 1}/${files.length}] Uploading: ${file}...`);
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' }, // Max dimensions
          { quality: 'auto:good' }, // Auto quality optimization
          { fetch_format: 'auto' }, // Auto format (WebP when supported)
        ],
      });

      results.push({
        filename: file,
        url: result.secure_url,
        publicId: result.public_id,
        success: true,
      });

      console.log(`✅ Success: ${result.secure_url}\n`);
      
    } catch (error) {
      console.error(`❌ Failed: ${file}`);
      console.error(`   Error: ${error}\n`);
      
      results.push({
        filename: file,
        url: '',
        publicId: '',
        success: false,
        error: String(error),
      });
    }
  }

  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx tsx scripts/upload-to-cloudinary.ts <folder-path> [cloudinary-folder]');
    console.log('Example: npx tsx scripts/upload-to-cloudinary.ts ./downloads/facebook-album properties/my-listing');
    process.exit(1);
  }

  const folderPath = args[0];
  const cloudinaryFolder = args[1] || 'properties';

  console.log('🚀 Starting Cloudinary Upload');
  console.log(`📂 Local folder: ${folderPath}`);
  console.log(`☁️  Cloudinary folder: ${cloudinaryFolder}\n`);

  const results = await uploadImagesToCloudinary(folderPath, cloudinaryFolder);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📝 Total: ${results.length}\n`);

  if (successful.length > 0) {
    console.log('🔗 CLOUDINARY URLS (comma-separated for CSV):');
    console.log('='.repeat(60));
    const urls = successful.map(r => r.url).join(',');
    console.log(urls);
    console.log('\n');
  }

  if (failed.length > 0) {
    console.log('❌ FAILED FILES:');
    failed.forEach(r => {
      console.log(`   - ${r.filename}: ${r.error}`);
    });
  }
}

main().catch(console.error);

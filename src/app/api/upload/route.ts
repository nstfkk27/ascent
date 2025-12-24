import { NextRequest } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const allowedFolders = ['properties', 'agents', 'projects', 'posts'] as const;

const uploadSchema = z.object({
  folder: z.enum(allowedFolders).default('properties'),
});

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folderParam = formData.get('folder') as string;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    const validated = uploadSchema.parse({ folder: folderParam || 'properties' });

    logger.debug('Uploading file', { 
      agentId: agent.id, 
      fileName: file.name,
      fileSize: file.size,
      folder: validated.folder 
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `ascent/${validated.folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    logger.info('File uploaded successfully', { 
      agentId: agent.id,
      url: result.secure_url,
      publicId: result.public_id 
    });

    return successResponse({ 
      url: result.secure_url,
      publicId: result.public_id 
    });
  })
);

const deleteSchema = z.object({
  publicId: z.string().min(1, 'Public ID is required'),
});

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, context, { agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    const body = await req.json();
    const validated = deleteSchema.parse(body);

    logger.debug('Deleting file from Cloudinary', { 
      agentId: agent.id,
      publicId: validated.publicId 
    });

    await cloudinary.uploader.destroy(validated.publicId);

    logger.info('File deleted successfully', { 
      agentId: agent.id,
      publicId: validated.publicId 
    });

    return successResponse({ 
      message: 'File deleted successfully'
    });
  })
);

import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  ValidationError
} from '@/lib/api';
import { logger } from '@/lib/logger';

export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context, { user, agent }) => {
    if (!agent) {
      throw new ValidationError('Agent not found');
    }

    logger.debug('Uploading profile image', { userId: user.id, agentId: agent.id });

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    if (!file.type.startsWith('image/')) {
      throw new ValidationError('File must be an image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('File size must be less than 5MB');
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}-${timestamp}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/profiles/${fileName}`;

    logger.info('Profile image uploaded', { 
      userId: user.id, 
      fileName,
      size: file.size 
    });

    return successResponse({ 
      url: publicUrl,
      message: 'Image uploaded successfully'
    });
  })
);

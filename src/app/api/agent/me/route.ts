import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { withErrorHandler, successResponse, errorResponse } from '@/lib/api';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return errorResponse('Not authenticated', 'UNAUTHORIZED', 401);
  }

  logger.debug('Fetching agent profile', { email: user.email });

  let agent = await prisma.agentProfile.findFirst({
    where: { 
      email: {
        equals: user.email,
        mode: 'insensitive'
      }
    }
  });

  if (!agent) {
    logger.info('Agent profile not found, auto-creating', { email: user.email });
    try {
      const userName = 
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.user_metadata?.user_name ||
        user.email?.split('@')[0] || 
        'Agent';

      agent = await prisma.agentProfile.create({
        data: {
          email: user.email,
          name: userName,
          role: 'AGENT',
          imageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          phone: null,
          whatsapp: null,
          lineId: null,
          languages: [],
        }
      });

      logger.info('Agent profile auto-created', { agentId: agent.id, email: user.email });

      return successResponse({
        authenticated: true,
        agent: {
          id: agent.id,
          role: agent.role,
          name: agent.name,
          email: agent.email,
          imageUrl: agent.imageUrl,
          companyName: agent.companyName,
        },
        autoCreated: true
      });
    } catch (createError) {
      logger.error('Failed to auto-create agent profile', { 
        error: createError, 
        email: user.email,
        metadata: user.user_metadata 
      });
      
      return errorResponse(
        'Failed to create agent profile',
        'PROFILE_CREATION_FAILED',
        500,
        { email: user.email }
      );
    }
  }

  logger.info('Agent profile found', { agentId: agent.id, role: agent.role });

  return successResponse({
    authenticated: true,
    agent: {
      id: agent.id,
      role: agent.role,
      name: agent.name,
      email: agent.email,
      companyName: agent.companyName,
      imageUrl: agent.imageUrl,
      phone: agent.phone,
      whatsapp: agent.whatsapp,
      lineId: agent.lineId,
    }
  });
});

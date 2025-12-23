import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError, ForbiddenError } from './errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';

export interface AuthContext {
  user: {
    id: string;
    email: string;
  };
  agent?: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
}

export interface AuthOptions {
  roles?: UserRole[];
  requireAgent?: boolean;
}

export type AuthenticatedHandler = (
  request: NextRequest,
  context: any,
  authContext: AuthContext
) => Promise<NextResponse>;

export function withAuth(
  handler: AuthenticatedHandler,
  options: AuthOptions = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      logger.warn('Unauthorized access attempt', {
        path: request.nextUrl.pathname,
        error: error?.message,
      });
      throw new UnauthorizedError('Authentication required');
    }

    const authContext: AuthContext = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    if (options.requireAgent !== false) {
      const agent = await prisma.agentProfile.findFirst({
        where: {
          email: {
            equals: user.email,
            mode: 'insensitive',
          },
        },
      });

      if (!agent) {
        logger.warn('Agent profile not found', {
          path: request.nextUrl.pathname,
          email: user.email,
        });
        throw new ForbiddenError('Agent profile not found');
      }

      authContext.agent = {
        id: agent.id,
        role: agent.role,
        name: agent.name,
        email: agent.email || user.email,
      };

      if (options.roles && !options.roles.includes(agent.role)) {
        logger.warn('Insufficient permissions', {
          path: request.nextUrl.pathname,
          userRole: agent.role,
          requiredRoles: options.roles,
        });
        throw new ForbiddenError('Insufficient permissions');
      }
    }

    logger.debug('Authenticated request', {
      path: request.nextUrl.pathname,
      userId: user.id,
      agentRole: authContext.agent?.role,
    });

    return handler(request, context, authContext);
  };
}

export function requireRole(...roles: UserRole[]) {
  return { roles };
}

export function isInternalAgent(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT';
}

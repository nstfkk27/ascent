import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from './errors';
import { errorResponse, ApiErrorResponse } from './response';
import { logger } from '@/lib/logger';

export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

export function withErrorHandler(
  handler: ApiHandler
): ApiHandler {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        logger.warn('API Error', {
          statusCode: error.statusCode,
          message: error.message,
          code: error.code,
          path: request.nextUrl.pathname,
        });

        return errorResponse(
          error.message,
          error.code,
          error.statusCode,
          error.details
        ) as NextResponse;
      }

      if (error instanceof ZodError) {
        logger.warn('Validation Error', {
          path: request.nextUrl.pathname,
          errors: error.issues,
        });

        return errorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          400,
          error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        ) as NextResponse;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma Error', {
          code: error.code,
          path: request.nextUrl.pathname,
          meta: error.meta,
        });

        if (error.code === 'P2002') {
          return errorResponse(
            'A record with this value already exists',
            'DUPLICATE_ENTRY',
            409,
            { field: error.meta?.target }
          );
        }

        if (error.code === 'P2025') {
          return errorResponse(
            'Record not found',
            'NOT_FOUND',
            404
          );
        }

        return errorResponse(
          'Database operation failed',
          'DATABASE_ERROR',
          500
        );
      }

      logger.error('Unhandled Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
      });

      return errorResponse(
        'An unexpected error occurred',
        'INTERNAL_SERVER_ERROR',
        500
      );
    }
  };
}

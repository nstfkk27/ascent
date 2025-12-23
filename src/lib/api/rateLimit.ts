import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitError } from './errors';
import { logger } from '@/lib/logger';

let ratelimit: Ratelimit | null = null;

function getRateLimiter() {
  if (ratelimit) return ratelimit;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    logger.warn('Rate limiting disabled - Upstash Redis not configured');
    return null;
  }

  try {
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    });

    return ratelimit;
  } catch (error) {
    logger.error('Failed to initialize rate limiter', { error });
    return null;
  }
}

export async function withRateLimit(
  request: NextRequest,
  options?: {
    identifier?: string;
    limit?: number;
    window?: string;
  }
): Promise<void> {
  const limiter = getRateLimiter();

  if (!limiter) {
    return;
  }

  const identifier =
    options?.identifier ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'anonymous';

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        path: request.nextUrl.pathname,
        limit,
        remaining,
        reset,
      });

      throw new RateLimitError(
        `Too many requests. Please try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`
      );
    }

    logger.debug('Rate limit check passed', {
      identifier,
      remaining,
      limit,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error;
    }
    logger.error('Rate limit check failed', { error });
  }
}

export function createRateLimiter(limit: number, windowSeconds: number) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return null;
  }

  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds}s`),
    analytics: true,
  });
}

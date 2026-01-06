/**
 * n8n API Authentication Middleware
 * Validates API key for n8n automation endpoints
 */

import { NextRequest } from 'next/server';
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/security/rate-limiter';

export function validateN8nApiKey(request: NextRequest): Response | null {
  const apiKey = request.headers.get('X-N8N-API-Key');
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'API key required. Include X-N8N-API-Key header.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (apiKey !== process.env.N8N_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Invalid API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting for n8n endpoints
  const identifier = `n8n:${apiKey.slice(0, 8)}`;
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.API);
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime);
  }

  return null; // Authentication successful
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  remaining: number,
  resetTime: number
): Response {
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  return response;
}

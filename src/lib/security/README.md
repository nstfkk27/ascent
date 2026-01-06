# Security Utilities

## Usage Examples

### Rate Limiting in API Routes

```typescript
// Example: /app/api/auth/login/route.ts
import { checkRateLimit, RATE_LIMITS, createRateLimitResponse, getRateLimitIdentifier } from '@/lib/security/rate-limiter';

export async function POST(request: Request) {
  // Check rate limit
  const identifier = getRateLimitIdentifier(request, 'login');
  const rateLimit = checkRateLimit(identifier, RATE_LIMITS.LOGIN);
  
  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime);
  }
  
  // Continue with login logic...
  // Add rate limit headers to successful response
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    }
  });
}
```

### Input Validation

```typescript
// Example: Contact form API
import { validateContactData, sanitizeString } from '@/lib/security/input-validation';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Validate input
  const validation = validateContactData(data);
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ errors: validation.errors }),
      { status: 400 }
    );
  }
  
  // Sanitize strings before storing
  const sanitizedData = {
    name: sanitizeString(data.name, 100),
    email: data.email.toLowerCase().trim(),
    message: sanitizeString(data.message, 2000),
  };
  
  // Store in database...
}
```

### File Upload Validation

```typescript
import { validateFileUpload } from '@/lib/security/input-validation';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('image') as File;
  
  const validation = validateFileUpload(file, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });
  
  if (!validation.valid) {
    return new Response(
      JSON.stringify({ error: validation.error }),
      { status: 400 }
    );
  }
  
  // Upload file...
}
```

## Security Headers

Security headers are configured in `next.config.js`:

- **Strict-Transport-Security**: Forces HTTPS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Cookie Security

Cookies are managed by Supabase SSR with secure defaults:

```typescript
{
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only (production)
  sameSite: 'lax',     // CSRF protection
  path: '/',
  maxAge: 3600         // 1 hour session
}
```

## Environment Variables

**Public variables** (exposed to browser):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

**Private variables** (server-only):
- `DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (if needed)
- API keys for external services

⚠️ **Never** put secrets in `NEXT_PUBLIC_*` variables!

## Production Checklist

Before deploying to production:

1. ✅ Security headers configured
2. ✅ Rate limiting implemented on sensitive endpoints
3. ✅ Input validation on all API routes
4. ✅ File upload validation
5. ⚠️ CSRF protection (consider implementing)
6. ⚠️ Cookie consent banner (GDPR/PDPA)
7. ⚠️ Error monitoring (Sentry, LogRocket)
8. ⚠️ Regular security audits

## Recommended Improvements

### 1. Use Redis for Rate Limiting (Production)
Current implementation uses in-memory storage which resets on server restart.

```bash
npm install @upstash/redis @upstash/ratelimit
```

### 2. Add CSRF Protection
For state-changing operations (POST, PUT, DELETE).

### 3. Implement Content Security Policy (CSP)
Add CSP header to prevent XSS attacks.

### 4. Add DOMPurify for HTML Sanitization
If you need to allow rich text content.

```bash
npm install isomorphic-dompurify
```

### 5. Set up Monitoring
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

## Testing Security

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Security scan
npx snyk test
```

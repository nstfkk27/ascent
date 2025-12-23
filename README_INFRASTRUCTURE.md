# Infrastructure Setup Guide

This document explains the foundational infrastructure that has been added to make the platform secure, maintainable, and scalable.

## 🎯 What's Been Added

### 1. **Error Handling System** (`src/lib/api/`)

All API routes now have standardized error handling:

```typescript
import { withErrorHandler, successResponse, NotFoundError } from '@/lib/api';

export const GET = withErrorHandler(async (req) => {
  const data = await fetchData();
  if (!data) throw new NotFoundError();
  return successResponse(data);
});
```

**Benefits:**
- Consistent error responses across all APIs
- Automatic error logging
- Type-safe error handling
- Handles Zod validation errors automatically
- Handles Prisma errors automatically

### 2. **Input Validation** (`src/lib/validation/schemas.ts`)

All inputs are validated using Zod schemas:

```typescript
import { propertyCreateSchema } from '@/lib/validation/schemas';

const body = await req.json();
const validated = propertyCreateSchema.parse(body); // Throws if invalid
```

**Benefits:**
- Type-safe validation
- Clear error messages
- Prevents invalid data from reaching database
- Self-documenting API contracts

### 3. **Authentication Wrapper** (`src/lib/api/auth.ts`)

Protected routes use the auth wrapper:

```typescript
import { withAuth, requireRole } from '@/lib/api';

export const POST = withErrorHandler(
  withAuth(async (req, context, { user, agent }) => {
    // user and agent are guaranteed to exist here
    // agent.role is available for role checks
  }, requireRole('SUPER_ADMIN', 'PLATFORM_AGENT'))
);
```

**Benefits:**
- Automatic authentication checks
- Role-based access control
- Type-safe user/agent context
- Consistent auth flow

### 4. **Rate Limiting** (`src/lib/api/rateLimit.ts`)

Protect APIs from abuse:

```typescript
import { withRateLimit } from '@/lib/api';

export const POST = withErrorHandler(async (req) => {
  await withRateLimit(req);
  // Rest of your code
});
```

**Benefits:**
- Prevents DDoS attacks
- Protects against abuse
- Configurable per route
- Optional (works without Upstash Redis)

### 5. **Structured Logging** (`src/lib/logger.ts`)

Replace `console.log` with proper logging:

```typescript
import { logger } from '@/lib/logger';

logger.info('User created property', { userId, propertyId });
logger.error('Failed to process', { error });
```

**Benefits:**
- Searchable logs in production
- Automatic timestamps
- Colored output in development
- JSON format in production

### 6. **Environment Validation** (`src/lib/env.ts`)

Validates environment variables on startup:

```typescript
import { env } from '@/lib/env';

// Use validated env vars
const dbUrl = env.DATABASE_URL; // Type-safe and validated
```

**Benefits:**
- Catches missing env vars early
- Type-safe environment access
- Clear error messages
- Prevents runtime errors

## 🔒 Security: Row Level Security (RLS)

**CRITICAL:** Run the RLS policies to secure your database:

1. Open Supabase SQL Editor
2. Run `supabase_rls_policies.sql`
3. Verify with: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

**What this does:**
- Blocks direct database access via anon key
- Allows Prisma (service role) full access
- Prevents data leaks
- Zero impact on existing code

## 📝 How to Use in New Features

### Example: Creating a New API Route

```typescript
// src/app/api/my-feature/route.ts
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  NotFoundError 
} from '@/lib/api';
import { myFeatureSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger';

export const POST = withErrorHandler(
  withAuth(async (req, context, { agent }) => {
    // 1. Validate input
    const body = await req.json();
    const validated = myFeatureSchema.parse(body);
    
    // 2. Log action
    logger.info('Creating feature', { agentId: agent.id });
    
    // 3. Business logic
    const result = await createFeature(validated);
    
    // 4. Return success
    return successResponse(result);
  }, { roles: ['SUPER_ADMIN'] })
);
```

**That's it!** You get:
- ✅ Authentication
- ✅ Authorization (role check)
- ✅ Input validation
- ✅ Error handling
- ✅ Logging
- ✅ Consistent responses

## 🚀 Optional: Rate Limiting Setup

If you want rate limiting (recommended for production):

1. Create free Upstash Redis account: https://upstash.com
2. Add to `.env`:
   ```
   UPSTASH_REDIS_REST_URL=your-url
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```
3. Rate limiting automatically activates

## 📊 Response Formats

All API responses follow these formats:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🔄 Migrating Existing Routes

You can migrate routes gradually. The infrastructure works alongside existing code.

**Before:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandler, successResponse } from '@/lib/api';

export const GET = withErrorHandler(async (req) => {
  const data = await fetchData();
  return successResponse(data);
});
```

## 🎓 Best Practices

1. **Always validate input** - Use Zod schemas
2. **Use error classes** - Throw `NotFoundError`, `ValidationError`, etc.
3. **Log important actions** - Use `logger.info()` for audit trail
4. **Use auth wrapper** - Don't manually check auth
5. **Use response helpers** - Don't manually create JSON responses

## 🛠️ Troubleshooting

**"Environment variable not found"**
- Check `.env` file has all required variables
- Restart dev server after adding env vars

**"Rate limit not working"**
- Check Upstash Redis credentials
- Rate limiting is optional - works without it

**"RLS blocking queries"**
- Ensure Prisma uses `DATABASE_URL` (service role)
- Check policies are created correctly

## 📚 Next Steps

1. ✅ RLS policies applied
2. ✅ Environment variables validated
3. 🔄 Gradually migrate existing routes
4. 📝 Add validation schemas for new features
5. 🚀 Deploy with confidence

---

**Questions?** All infrastructure is in `src/lib/api/` and `src/lib/validation/`

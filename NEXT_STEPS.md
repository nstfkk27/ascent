# ✅ RLS Applied - Next Steps

Great! You've applied the Row Level Security policies. Here's what to do next:

## 1️⃣ Verify RLS is Working

Run this in Supabase SQL Editor to confirm RLS is enabled:

```sql
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should show `RLS Enabled = true`

## 2️⃣ Test Your Application

Your application should work **exactly the same** as before because:
- ✅ Prisma uses the service role (bypasses RLS)
- ✅ All your existing code continues working
- ✅ Only direct database access via anon key is blocked

**Test these:**
1. Start dev server: `npm run dev`
2. Log in to your agent portal
3. Create a property listing
4. View properties
5. Edit/delete a property

**Everything should work normally!**

## 3️⃣ Optional: Enable Rate Limiting

Rate limiting is **optional** but recommended for production.

### Without Rate Limiting (Current State)
- ✅ Everything works
- ⚠️ No protection against API abuse
- 📝 Logs warning: "Rate limiting disabled"

### To Enable Rate Limiting:

**Step 1:** Create free Upstash account
- Go to: https://upstash.com
- Sign up (free tier is generous)
- Create a Redis database (select region closest to Singapore)

**Step 2:** Get credentials
- Copy "REST URL"
- Copy "REST Token"

**Step 3:** Add to `.env`
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Step 4:** Restart dev server
```bash
npm run dev
```

Rate limiting will automatically activate!

## 4️⃣ Start Using the New Infrastructure

You have two options:

### Option A: Use in New Features Only (Recommended)
- Keep existing routes as-is
- Use new infrastructure for all new features
- Gradually migrate old routes when you touch them

### Option B: Migrate Existing Routes
- Follow `MIGRATION_GUIDE.md`
- Start with simple routes
- Test thoroughly after each migration

## 5️⃣ Example: Create Your First Protected Route

Let's say you want to add a new "Analytics" endpoint:

```typescript
// src/app/api/analytics/route.ts
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  requireRole 
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandler(
  withAuth(async (req, context, { agent }) => {
    logger.info('Fetching analytics', { agentId: agent.id });

    const stats = await prisma.property.groupBy({
      by: ['status'],
      _count: true,
      where: {
        agentId: agent.id,
      },
    });

    return successResponse({ stats });
  }, requireRole('SUPER_ADMIN', 'PLATFORM_AGENT'))
);
```

**That's it!** You get:
- ✅ Authentication (must be logged in)
- ✅ Authorization (must be SUPER_ADMIN or PLATFORM_AGENT)
- ✅ Error handling (automatic)
- ✅ Logging (structured)
- ✅ Consistent response format

## 6️⃣ Common Tasks

### Add Validation for New Feature

```typescript
// src/lib/validation/schemas.ts
export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// In your route
const params = analyticsQuerySchema.parse({
  startDate: searchParams.get('startDate'),
  endDate: searchParams.get('endDate'),
  groupBy: searchParams.get('groupBy'),
});
```

### Add Rate Limiting to Specific Route

```typescript
import { withRateLimit } from '@/lib/api';

export const POST = withErrorHandler(async (req) => {
  await withRateLimit(req); // Add this line
  
  // Rest of your code
});
```

### Log Important Actions

```typescript
import { logger } from '@/lib/logger';

// Info level (normal operations)
logger.info('Property created', { propertyId, agentId });

// Warning level (unexpected but handled)
logger.warn('Property not found', { propertyId });

// Error level (actual errors)
logger.error('Failed to create property', { error: error.message });

// Debug level (only in development)
logger.debug('Processing request', { data });
```

## 7️⃣ Deployment Checklist

Before deploying to production:

### Vercel Environment Variables
Ensure these are set in Vercel dashboard:

**Required:**
- `DATABASE_URL` - Your Supabase connection string
- `DIRECT_URL` - Your Supabase direct connection (optional)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

**Optional but Recommended:**
- `UPSTASH_REDIS_REST_URL` - For rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - For rate limiting

**Cloudinary (if using):**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Verify Deployment
1. Deploy to Vercel
2. Check build logs for environment validation
3. Test authentication
4. Test creating/editing properties
5. Check Vercel logs for any errors

## 8️⃣ Monitoring (Future)

Consider adding these for production:

**Error Tracking:**
- Sentry (free tier available)
- Catches all errors automatically
- Shows stack traces and context

**Performance Monitoring:**
- Vercel Analytics (built-in)
- Tracks Core Web Vitals
- Shows slow API routes

**Logging:**
- Current setup logs to Vercel console
- For advanced needs: Datadog, LogRocket, etc.

## 🎉 You're All Set!

Your platform now has:
- ✅ Database security (RLS)
- ✅ Error handling infrastructure
- ✅ Input validation system
- ✅ Authentication wrappers
- ✅ Structured logging
- ✅ Consistent API responses

**Every new feature you build will be automatically safer!**

## 📚 Quick Reference

- **Infrastructure Guide:** `README_INFRASTRUCTURE.md`
- **Migration Examples:** `MIGRATION_GUIDE.md`
- **Example Route:** `src/app/api/example-new-route/route.ts`
- **Validation Schemas:** `src/lib/validation/schemas.ts`
- **API Utilities:** `src/lib/api/`

## ❓ Need Help?

**Common questions:**

**Q: Do I need to migrate all routes now?**
A: No! Existing routes work fine. Migrate gradually or only use for new features.

**Q: Is rate limiting required?**
A: No, it's optional. The app works without it (just logs a warning).

**Q: Will this slow down my app?**
A: No. The wrappers add negligible overhead (~1ms) and improve reliability.

**Q: Can I customize the error messages?**
A: Yes! Throw custom `ApiError` with your own messages.

**Q: How do I add a new validation schema?**
A: Add it to `src/lib/validation/schemas.ts` using Zod.

---

**Ready to build! 🚀**

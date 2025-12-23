# Migration Guide: Updating Existing Routes

This guide shows you how to gradually migrate your existing API routes to use the new infrastructure.

## 🎯 Why Migrate?

The new infrastructure provides:
- ✅ Automatic error handling
- ✅ Input validation
- ✅ Authentication/Authorization
- ✅ Rate limiting
- ✅ Structured logging
- ✅ Consistent responses

## 📋 Migration Checklist

For each route, follow these steps:

### Step 1: Add Imports

**Before:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
```

**After:**
```typescript
import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  NotFoundError 
} from '@/lib/api';
import { logger } from '@/lib/logger';
```

### Step 2: Wrap with Error Handler

**Before:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  const data = await fetchData();
  return successResponse(data);
});
```

### Step 3: Add Authentication (if needed)

**Before:**
```typescript
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const agent = await prisma.agentProfile.findFirst({
    where: { email: user.email }
  });
  
  if (!agent || agent.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Your code...
}
```

**After:**
```typescript
export const POST = withErrorHandler(
  withAuth(async (req, context, { agent }) => {
    // agent is guaranteed to exist and have SUPER_ADMIN role
    // Your code...
  }, requireRole('SUPER_ADMIN'))
);
```

### Step 4: Add Input Validation

**Before:**
```typescript
const body = await req.json();

if (!body.title || !body.description) {
  return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
}

if (body.price && body.price < 0) {
  return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
}
```

**After:**
```typescript
import { propertyCreateSchema } from '@/lib/validation/schemas';

const body = await req.json();
const validated = propertyCreateSchema.parse(body); // Throws ValidationError if invalid
```

### Step 5: Replace console.log with Logger

**Before:**
```typescript
console.log('Creating property:', propertyId);
console.error('Failed to create:', error);
```

**After:**
```typescript
logger.info('Creating property', { propertyId });
logger.error('Failed to create', { error: error.message });
```

### Step 6: Use Error Classes

**Before:**
```typescript
if (!property) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

**After:**
```typescript
if (!property) {
  throw new NotFoundError('Property not found');
}
```

## 📝 Complete Example

### Before Migration

```typescript
// src/app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let role = null;
    if (user && user.email) {
      const agent = await prisma.agentProfile.findFirst({
        where: { email: user.email }
      });
      if (agent) role = agent.role;
    }

    const isInternal = role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT';

    if (!isInternal) {
      property.commissionRate = null;
      property.commissionAmount = null;
    }
    
    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent profile not found' },
        { status: 403 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    const isSuperAdmin = agent.role === 'SUPER_ADMIN';
    const isOwner = property.agentId === agent.id;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own listings' },
        { status: 403 }
      );
    }

    await prisma.property.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
```

### After Migration

```typescript
// src/app/api/properties/[id]/route.ts
import { NextRequest } from 'next/server';
import { 
  withErrorHandler, 
  withAuth, 
  successResponse,
  NotFoundError,
  ForbiddenError,
  isInternalAgent,
} from '@/lib/api';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, { params }, { agent }) => {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });
    
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (!isInternalAgent(agent.role)) {
      property.commissionRate = null;
      property.commissionAmount = null;
    }
    
    return successResponse(property);
  }, { requireAgent: true })
);

export const DELETE = withErrorHandler(
  withAuth(async (req: NextRequest, { params }, { agent }) => {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    const isSuperAdmin = agent.role === 'SUPER_ADMIN';
    const isOwner = property.agentId === agent.id;

    if (!isSuperAdmin && !isOwner) {
      throw new ForbiddenError('You can only delete your own listings');
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    logger.info('Property deleted', { 
      propertyId: params.id,
      agentId: agent.id,
    });
    
    return successResponse({ message: 'Property deleted successfully' });
  })
);
```

## 📊 Benefits Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Lines of code | ~120 | ~50 |
| Error handling | Manual try-catch | Automatic |
| Auth checks | Manual, repetitive | Automatic |
| Input validation | Manual if statements | Zod schemas |
| Logging | console.log | Structured logger |
| Type safety | Partial | Full |
| Consistency | Varies by route | Standardized |

## 🚀 Migration Strategy

### Option 1: Gradual (Recommended)
- Migrate routes as you work on them
- New features use new infrastructure
- Old routes continue working
- No rush, no breaking changes

### Option 2: Batch Migration
- Pick a module (e.g., all property routes)
- Migrate all routes in that module
- Test thoroughly
- Move to next module

### Option 3: Big Bang (Not Recommended)
- Migrate everything at once
- High risk of breaking changes
- Only if you have comprehensive tests

## ✅ Testing After Migration

1. **Test authentication:**
   - Try accessing without token
   - Try with wrong role
   - Verify correct role works

2. **Test validation:**
   - Send invalid data
   - Send missing fields
   - Verify error messages

3. **Test error handling:**
   - Trigger database errors
   - Trigger not found errors
   - Verify error format

4. **Check logs:**
   - Verify structured logging works
   - Check log levels are correct
   - Ensure no sensitive data in logs

## 🐛 Common Issues

### Issue: "Cannot find module '@/lib/api'"
**Solution:** TypeScript path alias. Already configured in `tsconfig.json`

### Issue: "Validation error not showing details"
**Solution:** Error handler automatically formats Zod errors. Check response.details

### Issue: "Auth wrapper not working"
**Solution:** Ensure Supabase client is configured correctly

### Issue: "Rate limiting not working"
**Solution:** Rate limiting is optional. Works without Upstash Redis (just logs warning)

## 📚 Next Steps

1. Start with one simple route
2. Test thoroughly
3. Migrate similar routes
4. Update tests if needed
5. Document any custom patterns

---

**Questions?** Check `README_INFRASTRUCTURE.md` or review `src/app/api/example-new-route/route.ts`

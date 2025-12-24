# Deployment & Security Checklist

## 🎉 API Migration Complete

The following routes have been successfully migrated to the new infrastructure:

### ✅ Completed Migrations
- `/api/agents` - GET, POST (with role-based access)
- `/api/agents/[id]` - GET, PUT, DELETE (with authorization checks)
- `/api/deals/[id]` - GET, PATCH, DELETE (with property-agent relationship validation)
- `/api/upload` - POST, DELETE (with folder validation)
- `/api/properties` - All methods (Phase 1)
- `/api/properties/[id]` - All methods (Phase 1)
- `/api/projects` - All methods (Phase 1)
- `/api/enquiries` - GET, POST (Phase 2)
- `/api/deals` - GET, POST (Phase 2)
- `/api/agent/me` - GET (Phase 2)

### 🎯 Migration Benefits
All migrated routes now have:
- ✅ Consistent error handling with proper HTTP status codes
- ✅ Structured logging for debugging and monitoring
- ✅ Input validation using Zod schemas
- ✅ Authentication & authorization checks
- ✅ Consistent response format
- ✅ Decimal serialization for financial data
- ✅ Role-based access control

---

## 🔒 Security Hardening

### 1. Enable Row Level Security (RLS) on Supabase

**Status:** Ready to apply ⚠️

**Why:** Your Supabase tables are currently UNRESTRICTED, meaning anyone with the anon key can directly access the database. Since you use Prisma (service role) for all operations, enabling RLS will block unauthorized access without affecting your application.

**Steps:**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Navigate to: SQL Editor

2. **Run the RLS Script**
   - Copy the entire contents of `supabase_rls_policies.sql`
   - Paste into SQL Editor
   - Click "Run"

3. **Verify RLS is Enabled**
   ```sql
   SELECT tablename, rowsecurity as "RLS Enabled"
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
   All tables should show `RLS Enabled = true`

4. **Test Your Application**
   - Your app should work exactly the same
   - Prisma uses service role (bypasses RLS)
   - Only direct anon key access is blocked

---

## 🚀 Production Deployment Checklist

### 2. Verify Vercel Environment Variables

**Status:** Needs verification ⚠️

**Critical Issue:** Production error indicated missing `DATABASE_URL`

**Required Variables:**

```env
# Database (CRITICAL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." (optional but recommended)

# Supabase Auth (CRITICAL)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# Rate Limiting (Recommended)
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXxxx..."

# Cloudinary (Required for uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="xxxxx"

# Email (Required for enquiries)
RESEND_API_KEY="re_xxxxx"
```

**Steps:**

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Settings → Environment Variables

2. **Add/Verify Each Variable**
   - Add for Production, Preview, and Development
   - Double-check DATABASE_URL is correct
   - Ensure no trailing spaces or quotes

3. **Redeploy**
   - Trigger a new deployment after adding variables
   - Check deployment logs for any errors

---

### 3. Domain & SSL Configuration

**Status:** Needs attention ⚠️

**Issues Noted:**
- SSL error on `www.estateascent.com`
- Certificate common name invalid

**Steps:**

1. **Verify Domain in Vercel**
   - Go to: Settings → Domains
   - Ensure `www.estateascent.com` is added
   - Check SSL certificate status

2. **If Certificate is Pending**
   - Wait 24-48 hours for DNS propagation
   - Verify DNS records point to Vercel

3. **Recommended Setup**
   - Primary: `estateascent.com`
   - Redirect: `www.estateascent.com` → `estateascent.com`

---

### 4. Regional Configuration

**Status:** ✅ Configured (verify in Vercel)

**Important:** Your Supabase database is in Singapore (ap-southeast-1)

**Vercel Configuration:**
- Ensure `vercel.json` has correct region settings
- All serverless functions should deploy to `sin1`

**Verify:**
```json
{
  "regions": ["sin1"]
}
```

---

### 5. Rate Limiting Setup (Optional but Recommended)

**Status:** Optional

**Current State:** App works without rate limiting (logs warning)

**To Enable:**

1. **Create Upstash Account**
   - Go to: https://upstash.com
   - Create free account
   - Create Redis database (select Singapore region)

2. **Get Credentials**
   - Copy REST URL
   - Copy REST Token

3. **Add to Environment Variables**
   - Add to Vercel (all environments)
   - Redeploy

4. **Benefits:**
   - Protects against API abuse
   - Prevents spam on enquiry forms
   - Limits upload requests

---

## 📊 Testing Checklist

### After Deployment, Test:

**Authentication:**
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Password reset flow
- [ ] Session persistence

**Agent Management:**
- [ ] Create new agent (SUPER_ADMIN only)
- [ ] View agent list
- [ ] Update agent profile
- [ ] Deactivate agent

**Property Management:**
- [ ] Create property listing
- [ ] Upload images
- [ ] Edit property
- [ ] View properties (role-based commission visibility)

**Deals:**
- [ ] Create deal
- [ ] Update deal stage
- [ ] View deal details
- [ ] Delete deal

**Enquiries:**
- [ ] Submit enquiry form
- [ ] Verify email sent to agent
- [ ] View enquiries (role-based filtering)

**Security:**
- [ ] Verify RLS blocks direct database access
- [ ] Test rate limiting (if enabled)
- [ ] Verify unauthorized access is blocked

---

## 🔍 Monitoring & Logs

### Where to Check Logs:

1. **Vercel Logs**
   - Dashboard → Your Project → Logs
   - Filter by function, time, status

2. **Structured Logging**
   - All migrated routes log to Vercel console
   - Search by: `agentId`, `propertyId`, `dealId`
   - Log levels: `debug`, `info`, `warn`, `error`

3. **Error Tracking**
   - Check Vercel logs for 500 errors
   - Look for validation errors (400)
   - Monitor authentication failures (401, 403)

---

## 🎯 Post-Deployment Actions

### Immediate:
1. ✅ Enable RLS on Supabase
2. ✅ Verify all environment variables
3. ✅ Test critical user flows
4. ✅ Check SSL certificate status

### Within 24 Hours:
1. Monitor error logs
2. Test email delivery
3. Verify rate limiting (if enabled)
4. Check performance metrics

### Within 1 Week:
1. Review structured logs for patterns
2. Optimize slow queries (if any)
3. Set up alerts for critical errors
4. Document any production issues

---

## 📝 Remaining Optional Migrations

These routes still use old patterns but are functional:

- `/api/agent/stats` - Agent statistics
- `/api/wishlist` - User wishlist
- `/api/comparison` - Property comparison
- `/api/price-alerts` - Price alerts

**Recommendation:** Migrate these gradually as you work on related features.

---

## 🆘 Troubleshooting

### App Not Working After RLS?
- **Check:** Prisma uses `DATABASE_URL` with service role credentials
- **Verify:** Service role policies are created
- **Test:** Run verification query in Supabase SQL Editor

### Environment Variable Errors?
- **Check:** No trailing spaces in values
- **Verify:** Variables are set for correct environment
- **Redeploy:** After adding/changing variables

### SSL Certificate Issues?
- **Wait:** 24-48 hours for DNS propagation
- **Verify:** DNS records point to Vercel
- **Check:** Domain is added in Vercel settings

### Rate Limiting Not Working?
- **Check:** Upstash credentials are correct
- **Verify:** Redis database is in same region
- **Test:** Make 6+ requests to `/api/enquiries`

---

## 📚 Documentation References

- **Infrastructure Guide:** `README_INFRASTRUCTURE.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Phase 1 Summary:** `PHASE1_DEPLOYMENT_COMPLETE.md`
- **Phase 2 Summary:** `PHASE2_COMPLETE.md`
- **Next Steps:** `NEXT_STEPS.md`
- **RLS Policies:** `supabase_rls_policies.sql`

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ All environment variables are set
2. ✅ RLS is enabled on all tables
3. ✅ SSL certificate is valid
4. ✅ Authentication works (email + Google)
5. ✅ Properties can be created/edited
6. ✅ Images upload successfully
7. ✅ Enquiry emails are delivered
8. ✅ No errors in Vercel logs
9. ✅ Application loads in < 2 seconds
10. ✅ All API routes return proper responses

---

**Last Updated:** December 24, 2024
**Migration Status:** Phase 3 Complete - 10 major routes migrated
**Security Status:** Ready for RLS enablement

# Security Checklist for Production

## 🔴 Critical Issues to Fix

### 1. Missing Security Headers
**Status**: ❌ Not Implemented  
**Risk**: High - Vulnerable to XSS, clickjacking, MIME sniffing attacks

**Action Required**: Add security headers to `next.config.js`

### 2. No Rate Limiting
**Status**: ❌ Not Implemented  
**Risk**: High - Vulnerable to brute force attacks, API abuse

**Action Required**: Implement rate limiting for:
- Login attempts
- API endpoints
- Form submissions (contact, enquiry)

### 3. Missing Input Validation & Sanitization
**Status**: ⚠️ Partial  
**Risk**: Medium-High - Vulnerable to XSS, SQL injection

**Action Required**: 
- Validate all user inputs on API routes
- Sanitize HTML content before storing
- Use Prisma parameterized queries (already doing this ✓)

### 4. No CSRF Protection
**Status**: ❌ Not Implemented  
**Risk**: Medium - Vulnerable to cross-site request forgery

**Action Required**: Implement CSRF tokens for state-changing operations

### 5. Environment Variables Exposure
**Status**: ⚠️ Needs Review  
**Risk**: Medium - Sensitive data might be exposed

**Action Required**:
- Audit all `NEXT_PUBLIC_*` variables
- Ensure no secrets are in public variables
- Add `.env.local` to `.gitignore` (should already be there)

## 🟡 Important Improvements

### 6. Cookie Security Settings
**Status**: ⚠️ Needs Verification  
**Current**: Supabase handles cookie flags automatically

**Verify in Production**:
```javascript
// Cookies should have these flags:
{
  httpOnly: true,      // Prevent JS access
  secure: true,        // HTTPS only (production)
  sameSite: 'lax',     // CSRF protection
  path: '/',
  maxAge: 3600         // Session timeout
}
```

### 7. File Upload Security
**Status**: ⚠️ Needs Review  
**Risk**: Medium - Malicious file uploads

**Action Required**:
- Validate file types (images only)
- Check file size limits
- Scan for malware (consider Cloudinary's security features)
- Use unique filenames to prevent overwrites

### 8. API Authentication
**Status**: ⚠️ Partial  
**Risk**: Medium - Unauthorized API access

**Action Required**:
- Verify all API routes check authentication
- Implement role-based access control consistently
- Add API key rotation mechanism

### 9. Database Security
**Status**: ✅ Good (using Prisma)  
**Current**: Parameterized queries via Prisma

**Maintain**:
- Never use raw SQL with user input
- Keep Prisma updated
- Use row-level security in Supabase

### 10. Password Policy
**Status**: ⚠️ Depends on Supabase Settings  

**Verify in Supabase Dashboard**:
- Minimum password length (8+ characters)
- Password complexity requirements
- Account lockout after failed attempts
- Password reset token expiration

## 🟢 Additional Best Practices

### 11. Logging & Monitoring
- Log authentication events
- Monitor failed login attempts
- Track suspicious API usage
- Set up error alerting (Sentry, LogRocket)

### 12. Data Privacy (GDPR/PDPA)
- Cookie consent banner
- Privacy policy
- Data deletion mechanism
- User data export feature

### 13. SSL/TLS
- Force HTTPS in production
- Use HSTS headers
- Valid SSL certificate (Vercel handles this ✓)

### 14. Dependency Security
- Regular `npm audit` checks
- Keep dependencies updated
- Use Dependabot or Snyk

### 15. Backup & Recovery
- Database backups (Supabase handles this)
- Disaster recovery plan
- Test restore procedures

## Priority Implementation Order

1. **Immediate (This Week)**:
   - Add security headers
   - Implement rate limiting on login
   - Audit environment variables

2. **Short Term (This Month)**:
   - Add CSRF protection
   - Implement comprehensive input validation
   - File upload security review
   - Set up monitoring/logging

3. **Medium Term (Next 2 Months)**:
   - Cookie consent banner
   - GDPR compliance features
   - Security audit
   - Penetration testing

4. **Ongoing**:
   - Dependency updates
   - Security monitoring
   - Regular audits

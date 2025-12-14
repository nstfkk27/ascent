-- Enable Row Level Security (RLS) on all tables to prevent direct client-side access
-- Since the application uses Prisma (Server-Side) for all data operations, 
-- we should block the Supabase 'anon' and 'authenticated' roles from accessing tables directly.

-- 1. Enable RLS
ALTER TABLE "AgentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Facility" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertySubmission" ENABLE ROW LEVEL SECURITY;

-- 2. (Optional) Explicit Deny Policy
-- By default, enabling RLS without creating any policies denies all access to 'anon' and 'authenticated' roles.
-- However, Prisma (connected via DATABASE_URL) usually connects as 'postgres' or a privileged user, bypassing RLS.
-- Therefore, no further action is needed to allow Prisma to work, while Supabase Client (browser) is now blocked.

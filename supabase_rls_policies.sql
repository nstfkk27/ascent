-- ============================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================
-- This file enables RLS and creates policies to secure your database
-- Run this in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE "AgentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertySubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Post" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModelAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Facility" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enquiry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SoldProperty" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AreaStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comparison" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PremiumFeature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SERVICE ROLE POLICIES (Prisma Access)
-- ============================================
-- Allow service role (used by Prisma) full access to all tables

CREATE POLICY "Service role has full access to AgentProfile" ON "AgentProfile"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Contact" ON "Contact"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Property" ON "Property"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to PropertySubmission" ON "PropertySubmission"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Post" ON "Post"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Deal" ON "Deal"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Project" ON "Project"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to ModelAsset" ON "ModelAsset"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Facility" ON "Facility"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to PriceHistory" ON "PriceHistory"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Enquiry" ON "Enquiry"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to SoldProperty" ON "SoldProperty"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to AreaStats" ON "AreaStats"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Wishlist" ON "Wishlist"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Comparison" ON "Comparison"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to PriceAlert" ON "PriceAlert"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to PremiumFeature" ON "PremiumFeature"
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to Notification" ON "Notification"
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- BLOCK ANONYMOUS ACCESS
-- ============================================
-- Prevent direct database access via the anon key

CREATE POLICY "Block anonymous access to AgentProfile" ON "AgentProfile"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Contact" ON "Contact"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Property" ON "Property"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to PropertySubmission" ON "PropertySubmission"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Post" ON "Post"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Deal" ON "Deal"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Project" ON "Project"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to ModelAsset" ON "ModelAsset"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Facility" ON "Facility"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to PriceHistory" ON "PriceHistory"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Enquiry" ON "Enquiry"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to SoldProperty" ON "SoldProperty"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to AreaStats" ON "AreaStats"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Wishlist" ON "Wishlist"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Comparison" ON "Comparison"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to PriceAlert" ON "PriceAlert"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to PremiumFeature" ON "PremiumFeature"
  FOR ALL
  USING (auth.role() != 'anon');

CREATE POLICY "Block anonymous access to Notification" ON "Notification"
  FOR ALL
  USING (auth.role() != 'anon');

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

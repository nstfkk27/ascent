-- ============================================
-- SIMPLE VERSION: Only the most critical indexes
-- ============================================
-- This version avoids any potential column name issues
-- Run this in Supabase SQL Editor

-- ============================================
-- PROPERTY TABLE - Performance Indexes
-- ============================================

-- Sorting indexes (DESC for recent-first queries)
CREATE INDEX IF NOT EXISTS idx_property_created_desc ON "Property"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_property_updated_desc ON "Property"("updatedAt" DESC);

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_property_price ON "Property"(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_rent_price ON "Property"("rentPrice") WHERE "rentPrice" IS NOT NULL;

-- Size and bedroom filters
CREATE INDEX IF NOT EXISTS idx_property_size ON "Property"(size);
CREATE INDEX IF NOT EXISTS idx_property_bedrooms ON "Property"(bedrooms) WHERE bedrooms IS NOT NULL;

-- Project relationship
CREATE INDEX IF NOT EXISTS idx_property_project ON "Property"("projectId") WHERE "projectId" IS NOT NULL;

-- ============================================
-- COMPOSITE INDEXES - Most Important
-- ============================================

-- Status + Category (most common search combination)
CREATE INDEX IF NOT EXISTS idx_property_status_category ON "Property"(status, category);

-- City + Status (location-based searches)
CREATE INDEX IF NOT EXISTS idx_property_city_status ON "Property"(city, status);

-- Category + Listing Type (sale vs rent)
CREATE INDEX IF NOT EXISTS idx_property_category_listing ON "Property"(category, "listingType");

-- Status + Created (recent available listings)
CREATE INDEX IF NOT EXISTS idx_property_status_created ON "Property"(status, "createdAt" DESC);

-- ============================================
-- AGENT PROFILE
-- ============================================

-- Email lookups (authentication)
CREATE INDEX IF NOT EXISTS idx_agent_email ON "AgentProfile"(email);

-- Role filtering
CREATE INDEX IF NOT EXISTS idx_agent_role ON "AgentProfile"(role);

-- Active agents only
CREATE INDEX IF NOT EXISTS idx_agent_active ON "AgentProfile"("isActive") WHERE "isActive" = true;

-- ============================================
-- DEAL TABLE
-- ============================================

-- Deal stage filtering
CREATE INDEX IF NOT EXISTS idx_deal_stage ON "Deal"(stage);

-- Recent deals
CREATE INDEX IF NOT EXISTS idx_deal_created ON "Deal"("createdAt" DESC);

-- ============================================
-- PROJECT TABLE
-- ============================================

-- Completion year (for "new project" filters)
CREATE INDEX IF NOT EXISTS idx_project_completion ON "Project"("completionYear") WHERE "completionYear" IS NOT NULL;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check what indexes were created:
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('Property', 'AgentProfile', 'Deal', 'Project')
ORDER BY tablename, indexname;

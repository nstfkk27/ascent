-- ============================================
-- PERFORMANCE OPTIMIZATION: DATABASE INDEXES
-- ============================================
-- Run this in Supabase SQL Editor to dramatically improve query performance
-- NOTE: Some indexes already exist from Prisma schema - we only add NEW ones

-- ============================================
-- PROPERTY TABLE INDEXES (New ones only)
-- ============================================

-- These indexes are NEW (not in Prisma schema)
CREATE INDEX IF NOT EXISTS idx_property_created_desc ON "Property"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_property_updated_desc ON "Property"("updatedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_property_price ON "Property"(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_rent_price ON "Property"("rentPrice") WHERE "rentPrice" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_size ON "Property"(size);
CREATE INDEX IF NOT EXISTS idx_property_bedrooms ON "Property"(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_project ON "Property"("projectId") WHERE "projectId" IS NOT NULL;

-- ============================================
-- COMPOSITE INDEXES (Multiple columns)
-- ============================================

-- Status + Category (most common filter combo)
CREATE INDEX IF NOT EXISTS idx_property_status_category ON "Property"(status, category);

-- City + Status (location-based searches)
CREATE INDEX IF NOT EXISTS idx_property_city_status ON "Property"(city, status);

-- Agent + Status (agent dashboard)
CREATE INDEX IF NOT EXISTS idx_property_agent_status ON "Property"("agentId", status);

-- Category + Listing Type (sale vs rent filtering)
CREATE INDEX IF NOT EXISTS idx_property_category_listing ON "Property"(category, "listingType");

-- Status + Created (recent available listings)
CREATE INDEX IF NOT EXISTS idx_property_status_created ON "Property"(status, "createdAt" DESC);

-- ============================================
-- AGENT PROFILE INDEXES
-- ============================================

-- Email lookups (used in every auth check)
CREATE INDEX IF NOT EXISTS idx_agent_email ON "AgentProfile"(email);

-- Role-based queries
CREATE INDEX IF NOT EXISTS idx_agent_role ON "AgentProfile"(role);

-- Active agents
CREATE INDEX IF NOT EXISTS idx_agent_active ON "AgentProfile"("isActive") WHERE "isActive" = true;

-- ============================================
-- DEAL INDEXES
-- ============================================

-- Property relationships (already exists in Prisma, but add if missing)
CREATE INDEX IF NOT EXISTS idx_deal_property ON "Deal"("propertyId");

-- Agent relationships
CREATE INDEX IF NOT EXISTS idx_deal_agent ON "Deal"("agentId");

-- Deal stage filtering
CREATE INDEX IF NOT EXISTS idx_deal_stage ON "Deal"(stage);

-- Recent deals
CREATE INDEX IF NOT EXISTS idx_deal_created ON "Deal"("createdAt" DESC);

-- ============================================
-- PROJECT INDEXES (Most already exist in Prisma)
-- ============================================

-- Completion year (for "new project" filters)
CREATE INDEX IF NOT EXISTS idx_project_completion ON "Project"("completionYear") WHERE "completionYear" IS NOT NULL;

-- ============================================
-- PRICE HISTORY INDEXES
-- ============================================

-- Property price tracking (composite for time-series queries)
CREATE INDEX IF NOT EXISTS idx_price_history_property_time ON "PriceHistory"("propertyId", "changedAt" DESC);

-- Agent activity tracking
CREATE INDEX IF NOT EXISTS idx_price_history_agent ON "PriceHistory"("changedBy");

-- ============================================
-- ENQUIRY INDEXES
-- ============================================

-- Property enquiries
CREATE INDEX IF NOT EXISTS idx_enquiry_property ON "Enquiry"("propertyId");

-- Agent enquiries
CREATE INDEX IF NOT EXISTS idx_enquiry_agent ON "Enquiry"("agentId");

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_enquiry_status ON "Enquiry"(status);

-- Recent enquiries
CREATE INDEX IF NOT EXISTS idx_enquiry_created ON "Enquiry"("createdAt" DESC);

-- ============================================
-- SOLD PROPERTY INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sold_property ON "SoldProperty"("propertyId");
CREATE INDEX IF NOT EXISTS idx_sold_date ON "SoldProperty"("soldDate" DESC);
CREATE INDEX IF NOT EXISTS idx_sold_city ON "SoldProperty"(city);

-- ============================================
-- WISHLIST INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON "Wishlist"("userId");
CREATE INDEX IF NOT EXISTS idx_wishlist_property ON "Wishlist"("propertyId");
CREATE INDEX IF NOT EXISTS idx_wishlist_user_property ON "Wishlist"("userId", "propertyId");

-- ============================================
-- COMPARISON INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_comparison_user ON "Comparison"("userId");
CREATE INDEX IF NOT EXISTS idx_comparison_created ON "Comparison"("createdAt" DESC);

-- ============================================
-- PRICE ALERT INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_alert_user ON "PriceAlert"("userId");
CREATE INDEX IF NOT EXISTS idx_alert_property ON "PriceAlert"("propertyId");
CREATE INDEX IF NOT EXISTS idx_alert_active ON "PriceAlert"("isActive") WHERE "isActive" = true;

-- ============================================
-- NOTIFICATION INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS idx_notification_read ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS idx_notification_created ON "Notification"("createdAt" DESC);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to see all indexes:
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check index usage (after some time):
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

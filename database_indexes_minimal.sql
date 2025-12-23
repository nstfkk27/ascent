-- ============================================
-- MINIMAL VERSION: Core Performance Indexes Only
-- ============================================
-- This avoids ALL potentially problematic columns
-- Just the essential performance boosters

-- Property table - sorting and filtering
CREATE INDEX IF NOT EXISTS idx_property_created_desc ON "Property"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_property_price_filter ON "Property"(price) WHERE price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_rent_filter ON "Property"("rentPrice") WHERE "rentPrice" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_size_filter ON "Property"(size);

-- Composite indexes for common searches
CREATE INDEX IF NOT EXISTS idx_property_status_category ON "Property"(status, category);
CREATE INDEX IF NOT EXISTS idx_property_city_status ON "Property"(city, status);
CREATE INDEX IF NOT EXISTS idx_property_status_created ON "Property"(status, "createdAt" DESC);

-- Agent profile
CREATE INDEX IF NOT EXISTS idx_agent_email_lookup ON "AgentProfile"(email);
CREATE INDEX IF NOT EXISTS idx_agent_role_filter ON "AgentProfile"(role);

-- Verify
SELECT 'Indexes created successfully!' as status;

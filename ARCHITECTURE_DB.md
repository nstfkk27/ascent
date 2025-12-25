# Database Architecture: PUBLIC vs INTELLIGENCE Data

## 🎯 Core Philosophy

Estate Ascent separates property data into two distinct layers:

1. **PUBLIC DATA** - Information visible to all users (buyers, renters, public website)
2. **INTELLIGENCE DATA** - Strategic insights visible only to internal agents (SUPER_ADMIN, PLATFORM_AGENT)

This separation provides:
- **Security**: Prevents competitive intelligence leakage
- **Flexibility**: Easy to add new intelligence features without affecting public API
- **Performance**: Optimized queries for different user types
- **Scalability**: Intelligence can be computed/updated independently

---

## 📊 Data Layer Breakdown

### **PUBLIC DATA**
Information that appears on the public website and is visible to all users.

**Categories:**
- **Basic Info**: title, description, referenceId, slug
- **Pricing**: price, rentPrice (asking prices only)
- **Location**: address, city, area, latitude, longitude
- **Property Details**: category, bedrooms, bathrooms, size, floor
- **Features**: amenities, furnished, petFriendly, parking
- **Media**: images
- **Status**: status, listingType, featured
- **Timestamps**: createdAt, updatedAt

**Visibility**: ✅ Everyone (public website, all API consumers)

---

### **INTELLIGENCE DATA**
Strategic insights and competitive intelligence visible only to internal agents.

**Categories:**

#### 1. **Calculated Metrics** (Auto-computed)
- `pricePerSqm` - Price per square meter
- `estimatedRentalYield` - Annual rental yield percentage

#### 2. **Market Intelligence** (Computed from AreaStats + SoldProperty)
- `fairValueEstimate` - AI-calculated fair market value
- `priceDeviation` - Percentage above/below market average
- `dealQuality` - Classification (SUPER_DEAL, GOOD_VALUE, FAIR, OVERPRICED, HIGH_YIELD)

#### 3. **Commission Structure** (Role-based visibility)
- `commissionRate` - Platform commission from owner (SUPER_ADMIN, PLATFORM_AGENT only)
- `agentCommissionRate` - Shared commission offered to agents (visible to ALL agents)
- `coAgentCommissionRate` - Co-agent split percentage
- `commissionAmount` - Fixed commission amount

#### 4. **Lead Intelligence**
- `viewCount` - Number of times property was viewed
- `enquiryCount` - Number of inquiries received
- `leadScore` - Predicted conversion probability (0-100)

#### 5. **Internal Operations**
- `internalNotes` - Private notes for agents
- `lastIntelligenceUpdate` - When intelligence was last recalculated
- `rentedUntil` - Lease end date (for rental tracking)
- `availableFrom` - When property becomes available

**Visibility**: 🔒 SUPER_ADMIN, PLATFORM_AGENT only (except agentCommissionRate which is visible to all agents)

---

## 🗄️ Storage Strategy

### **Why NOT JSON?**

❌ **Avoid storing intelligence as JSON:**
```prisma
// BAD APPROACH
intelligence Json? // { fairValue: 4200000, dealQuality: "GOOD_VALUE" }
```

**Problems:**
- Can't index JSON fields efficiently in PostgreSQL
- Can't query/filter on nested values easily
- Prisma has poor JSON type safety
- Hard to migrate/evolve schema
- Performance degrades at scale

### **✅ Use Separate Columns**

```prisma
// GOOD APPROACH
fairValueEstimate     Decimal?  @db.Decimal(12, 2)
dealQuality           DealQuality?
priceDeviation        Decimal?  @db.Decimal(5, 2)

@@index([dealQuality])  // Can index for fast queries
```

**Benefits:**
- Full type safety
- Efficient indexing
- Easy to query: `WHERE dealQuality = 'SUPER_DEAL'`
- Simple to add/remove fields
- Better performance

---

## 🔐 API Visibility Control

### **Public Endpoint** (`/api/properties`)
```typescript
// Returns PUBLIC DATA only
{
  id: "...",
  title: "Sea View Condo",
  price: 4500000,
  bedrooms: 2,
  agentCommissionRate: 3.0,  // Visible to all agents
  // Intelligence fields excluded
}
```

### **Internal Endpoint** (`/api/agent/properties`)
```typescript
// Returns PUBLIC + INTELLIGENCE (role-based)
{
  id: "...",
  title: "Sea View Condo",
  price: 4500000,
  bedrooms: 2,
  
  // INTELLIGENCE (internal only)
  commissionRate: 5.0,           // Platform commission
  agentCommissionRate: 3.0,      // Agent commission
  fairValueEstimate: 4200000,
  priceDeviation: 7.1,           // 7.1% overpriced
  dealQuality: "OVERPRICED",
  leadScore: 65,
  internalNotes: "Owner motivated to sell"
}
```

---

## 📈 Intelligence Calculation Flow

### **When Intelligence is Computed:**

1. **On Property Create/Update**
   - Calculate `pricePerSqm` = price / size
   - Calculate `estimatedRentalYield` = (rentPrice × 12 / price) × 100

2. **Periodic Background Job** (Daily/Weekly)
   - Fetch AreaStats for property location
   - Calculate `fairValueEstimate` based on comparable sales
   - Calculate `priceDeviation` = ((price - fairValue) / fairValue) × 100
   - Classify `dealQuality` based on deviation and yield
   - Update `leadScore` based on views, enquiries, time on market

3. **On-Demand** (When viewing property details)
   - Real-time calculations for latest market data
   - Compare against recent sales

---

## 🎯 DealQuality Classification

```typescript
enum DealQuality {
  SUPER_DEAL      // >15% below fair value
  GOOD_VALUE      // 5-15% below fair value  
  FAIR            // Within ±5% of fair value
  OVERPRICED      // >5% above fair value
  HIGH_YIELD      // Rental yield > 6% (regardless of price)
}
```

**Calculation Logic:**
```typescript
function calculateDealQuality(property, fairValue) {
  const deviation = ((property.price - fairValue) / fairValue) * 100;
  const rentalYield = (property.rentPrice * 12 / property.price) * 100;
  
  if (rentalYield > 6) return 'HIGH_YIELD';
  if (deviation < -15) return 'SUPER_DEAL';
  if (deviation < -5) return 'GOOD_VALUE';
  if (deviation > 5) return 'OVERPRICED';
  return 'FAIR';
}
```

---

## 🚀 Future Intelligence Features (Roadmap)

### **Phase 1: Foundation** (Current)
- ✅ Basic calculated metrics (pricePerSqm, rentalYield)
- ✅ Commission structure with role-based visibility
- ✅ View/enquiry tracking

### **Phase 2: Market Intelligence** (Q2 2025)
- 🔜 Fair value estimation
- 🔜 Deal quality classification
- 🔜 Price deviation analysis
- 🔜 Lead scoring

### **Phase 3: Predictive Analytics** (Q3 2025)
- 🔜 Days-to-sell prediction
- 🔜 Optimal pricing recommendations
- 🔜 Demand forecasting
- 🔜 Seasonal trend analysis

### **Phase 4: AI-Powered Insights** (Q4 2025)
- 🔜 Natural language search summaries
- 🔜 Automated property descriptions
- 🔜 Chatbot with market intelligence
- 🔜 Investment opportunity alerts

---

## 🔄 Related Tables

Intelligence data also leverages these supporting tables:

### **AreaStats** - Market aggregates by location
```prisma
model AreaStats {
  avgPricePerSqm      Decimal?
  medianPricePerSqm   Decimal?
  avgRentalYield      Decimal?
  activeListings      Int
  soldLast30Days      Int
  avgDaysOnMarket     Int?
  priceChange30Days   Decimal?
}
```

### **SoldProperty** - Historical transaction data
```prisma
model SoldProperty {
  finalPrice          Decimal?
  soldAt              DateTime
  daysOnMarket        Int?
  // Used to calculate fair value
}
```

### **PriceHistory** - Track price changes
```prisma
model PriceHistory {
  propertyId          String
  price               Decimal?
  changeType          PriceChangeType
  changedAt           DateTime
  // Used for price trend analysis
}
```

### **Enquiry** - Lead tracking
```prisma
model Enquiry {
  propertyId          String
  channel             EnquiryChannel
  status              EnquiryStatus
  createdAt           DateTime
  // Used to calculate lead score
}
```

---

## 💡 Best Practices

### **When Adding New Intelligence Fields:**

1. **Ask**: Is this data public or strategic?
   - Public → Add to PUBLIC section
   - Strategic → Add to INTELLIGENCE section

2. **Use proper data types** (not JSON)
   - Numbers → `Decimal`, `Int`
   - Categories → `enum`
   - Text → `String`

3. **Add indexes** for frequently queried fields
   ```prisma
   @@index([dealQuality])
   @@index([leadScore])
   ```

4. **Update API visibility logic** in route handlers

5. **Document calculation logic** in code comments

### **When Querying Data:**

```typescript
// ✅ GOOD: Explicit field selection
const properties = await prisma.property.findMany({
  select: {
    // Public fields
    id: true,
    title: true,
    price: true,
    
    // Intelligence (conditional)
    fairValueEstimate: isInternalAgent,
    dealQuality: isInternalAgent,
  }
});

// ❌ BAD: Select all fields
const properties = await prisma.property.findMany();
// Leaks intelligence data to public API
```

---

## 🎯 Summary

**PUBLIC DATA** = What customers see
**INTELLIGENCE DATA** = What gives you competitive advantage

This architecture ensures:
- Clear separation of concerns
- Easy to extend with new intelligence features
- Secure by design (no accidental data leaks)
- Performant (proper indexing, no JSON queries)
- Scalable (intelligence computed independently)

---

**Last Updated**: December 25, 2025
**Version**: 1.0

# AI-Readiness Strategy for Estate Ascent
## Building a Billion-THB Proptech with AI-Powered Search

**Goal:** Enable users to input natural language queries like:
> "Cheap condo near beach, less than 1 km and cheaper than the market, and can rent out higher yield"

And receive accurate, data-driven answers.

---

## 📊 Current State Assessment

### ✅ What You Already Have (Strong Foundation)
| Data Category | Current Implementation | AI-Ready? |
|--------------|------------------------|-----------|
| **Basic Property Data** | title, description, price, size, bedrooms, bathrooms | ✅ Yes |
| **Location** | lat/lng coordinates, city, address, area | ✅ Yes |
| **Market Intelligence** | pricePerSqm, estimatedRentalYield, fairValueEstimate, priceDeviation, dealQuality | ✅ Yes |
| **Property Highlights** | NEAR_BEACH, NEAR_HOSPITAL, etc. (manual tags) | ⚠️ Partial |
| **Engagement Data** | viewCount, enquiryCount, leadScore | ✅ Yes |
| **Price History** | PriceHistory model with change tracking | ✅ Yes |
| **Area Statistics** | AreaStats with avgPricePerSqm, trends, etc. | ✅ Yes |
| **Transaction History** | SoldProperty archive | ✅ Yes |

### ❌ Critical Data Gaps for AI

| Missing Data | Why It Matters | Priority |
|-------------|----------------|----------|
| **POI Distance Data** | "1km from beach" requires actual measured distances | 🔴 Critical |
| **Semantic Embeddings** | Natural language search requires vector similarity | 🔴 Critical |
| **User Behavior Tracking** | Personalization requires search/click history | 🟡 High |
| **Structured Location Tags** | "Jomtien Beach area" vs just coordinates | 🟡 High |
| **Market Comparison Context** | "Cheaper than market" needs project/area baselines | 🟡 High |
| **Image Analysis Tags** | Sea view verification, interior quality scoring | 🟠 Medium |

---

## 🏗️ Phase 1: Data Infrastructure (Do This NOW)

### 1.1 Points of Interest (POI) System

Create a POI database to enable distance-based queries.

```prisma
// Add to schema.prisma

model PointOfInterest {
  id          String      @id @default(uuid())
  name        String
  nameTh      String?
  type        POIType
  latitude    Decimal     @db.Decimal(10, 8)
  longitude   Decimal     @db.Decimal(11, 8)
  city        String
  area        String?
  metadata    Json?       // Additional info (hospital beds, school rating, etc.)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  
  @@index([type])
  @@index([city])
  @@index([latitude, longitude])
}

enum POIType {
  BEACH
  HOSPITAL
  INTERNATIONAL_SCHOOL
  THAI_SCHOOL
  SHOPPING_MALL
  SUPERMARKET
  CONVENIENCE_STORE
  BTS_STATION
  MRT_STATION
  AIRPORT
  GOLF_COURSE
  PARK
  RESTAURANT_AREA
  NIGHTLIFE
  GYM
  TEMPLE
  IMMIGRATION
  EMBASSY
}

// Pre-calculated distances (updated on property create/update)
model PropertyPOIDistance {
  id          String           @id @default(uuid())
  propertyId  String
  poiId       String
  poiType     POIType
  distanceKm  Decimal          @db.Decimal(6, 3)
  walkingMins Int?
  drivingMins Int?
  
  @@unique([propertyId, poiId])
  @@index([propertyId])
  @@index([poiType])
  @@index([distanceKm])
}
```

**Why Pre-calculate?**
- Query "< 1km from beach" becomes a simple index scan
- No real-time distance calculations = fast search
- Enables ranking by proximity

### 1.2 Semantic Search Infrastructure

```prisma
// Vector embeddings for natural language search
model PropertyEmbedding {
  id            String    @id @default(uuid())
  propertyId    String    @unique
  embedding     Bytes     // Store as pgvector or serialized float array
  embeddingText String    // The text that was embedded
  model         String    // "text-embedding-3-small" etc.
  updatedAt     DateTime  @updatedAt
  
  @@index([propertyId])
}

// Search query logs for ML training
model SearchLog {
  id            String    @id @default(uuid())
  query         String
  queryEmbedding Bytes?
  userId        String?
  sessionId     String
  resultsCount  Int
  clickedIds    String[]  // Which properties user clicked
  convertedId   String?   // Which property led to enquiry
  createdAt     DateTime  @default(now())
  
  @@index([createdAt])
  @@index([userId])
}
```

### 1.3 Enhanced Property Model

Add these fields to your existing Property model:

```prisma
// Add to Property model
model Property {
  // ... existing fields ...
  
  // ============================================
  // AI-READY DATA (Phase 1)
  // ============================================
  
  // Structured location context
  subArea           String?             // "Jomtien Beach", "Walking Street Area"
  nearestBeachKm    Decimal?            @db.Decimal(5, 2)
  nearestBtsKm      Decimal?            @db.Decimal(5, 2)
  nearestMallKm     Decimal?            @db.Decimal(5, 2)
  nearestHospitalKm Decimal?            @db.Decimal(5, 2)
  nearestSchoolKm   Decimal?            @db.Decimal(5, 2)
  
  // Market context (for "cheaper than market" queries)
  projectAvgPricePerSqm   Decimal?      @db.Decimal(12, 2)
  areaAvgPricePerSqm      Decimal?      @db.Decimal(12, 2)
  priceVsProjectAvg       Decimal?      @db.Decimal(5, 2)  // -15% = 15% below
  priceVsAreaAvg          Decimal?      @db.Decimal(5, 2)
  
  // Quality scoring (0-100)
  locationScore     Int?                // Based on POI proximity
  valueScore        Int?                // Based on price vs market
  investmentScore   Int?                // Based on yield + appreciation
  overallScore      Int?                // Weighted composite
  
  // AI-generated content
  searchSummary     String?             // Already exists - expand it
  keyFeatures       String[]            // ["Sea view", "Below market price", "High rental yield"]
  targetBuyer       String[]            // ["Investor", "Retiree", "Family"]
  
  // Indexes for fast filtering
  @@index([nearestBeachKm])
  @@index([nearestBtsKm])
  @@index([priceVsAreaAvg])
  @@index([overallScore])
  @@index([investmentScore])
}
```

---

## 🏗️ Phase 2: Data Collection & Enrichment

### 2.1 POI Data Sources (Thailand)

| Source | Data Type | How to Get |
|--------|-----------|------------|
| **Google Places API** | All POI types | API calls, ~$5/1000 requests |
| **OpenStreetMap** | Free POI data | Overpass API, free |
| **Manual Entry** | Key landmarks | Admin UI for staff |
| **Thailand GIS** | Government data | Public datasets |

**Recommended: Start with Pattaya/Jomtien**
```json
// Example POI seed data
[
  {"name": "Jomtien Beach", "type": "BEACH", "lat": 12.8886, "lng": 100.8742},
  {"name": "Pattaya Beach", "type": "BEACH", "lat": 12.9266, "lng": 100.8688},
  {"name": "Central Pattaya", "type": "SHOPPING_MALL", "lat": 12.9358, "lng": 100.8847},
  {"name": "Bangkok Hospital Pattaya", "type": "HOSPITAL", "lat": 12.9292, "lng": 100.8987}
]
```

### 2.2 Distance Calculation Service

```typescript
// src/lib/services/poi-distance.ts

import { Decimal } from '@prisma/client/runtime/library';

interface Coordinate {
  lat: number;
  lng: number;
}

// Haversine formula for distance calculation
export function calculateDistanceKm(point1: Coordinate, point2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Call this when property is created/updated
export async function updatePropertyPOIDistances(
  propertyId: string,
  propertyLat: number,
  propertyLng: number
) {
  const pois = await prisma.pointOfInterest.findMany({
    where: { isActive: true }
  });
  
  const distances = pois.map(poi => ({
    propertyId,
    poiId: poi.id,
    poiType: poi.type,
    distanceKm: calculateDistanceKm(
      { lat: propertyLat, lng: propertyLng },
      { lat: Number(poi.latitude), lng: Number(poi.longitude) }
    )
  }));
  
  // Upsert all distances
  await prisma.$transaction(
    distances.map(d => 
      prisma.propertyPOIDistance.upsert({
        where: { propertyId_poiId: { propertyId: d.propertyId, poiId: d.poiId } },
        create: d,
        update: { distanceKm: d.distanceKm }
      })
    )
  );
  
  // Update convenience fields on Property
  const nearestBeach = distances.filter(d => d.poiType === 'BEACH')
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
  
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      nearestBeachKm: nearestBeach?.distanceKm || null,
      // ... other nearest distances
    }
  });
}
```

### 2.3 Automated Scoring System

```typescript
// src/lib/services/property-scoring.ts

interface PropertyScores {
  locationScore: number;    // 0-100
  valueScore: number;       // 0-100
  investmentScore: number;  // 0-100
  overallScore: number;     // 0-100
}

export function calculatePropertyScores(property: {
  nearestBeachKm?: number;
  nearestMallKm?: number;
  nearestHospitalKm?: number;
  priceDeviation?: number;
  estimatedRentalYield?: number;
}): PropertyScores {
  
  // Location Score (40% weight)
  let locationScore = 100;
  if (property.nearestBeachKm) {
    if (property.nearestBeachKm > 5) locationScore -= 40;
    else if (property.nearestBeachKm > 2) locationScore -= 20;
    else if (property.nearestBeachKm > 1) locationScore -= 10;
  }
  if (property.nearestMallKm && property.nearestMallKm > 3) locationScore -= 15;
  if (property.nearestHospitalKm && property.nearestHospitalKm > 5) locationScore -= 10;
  
  // Value Score (30% weight) - based on price vs market
  let valueScore = 50; // neutral
  if (property.priceDeviation) {
    // Negative deviation = below market = good value
    valueScore = Math.min(100, Math.max(0, 50 - (property.priceDeviation * 3)));
  }
  
  // Investment Score (30% weight)
  let investmentScore = 50;
  if (property.estimatedRentalYield) {
    if (property.estimatedRentalYield >= 8) investmentScore = 100;
    else if (property.estimatedRentalYield >= 6) investmentScore = 80;
    else if (property.estimatedRentalYield >= 4) investmentScore = 60;
    else investmentScore = 40;
  }
  
  const overallScore = Math.round(
    locationScore * 0.4 + 
    valueScore * 0.3 + 
    investmentScore * 0.3
  );
  
  return {
    locationScore: Math.round(locationScore),
    valueScore: Math.round(valueScore),
    investmentScore: Math.round(investmentScore),
    overallScore
  };
}
```

---

## 🏗️ Phase 3: AI Integration

### 3.1 Query Understanding (NLU)

Transform natural language to structured query:

```typescript
// src/lib/ai/query-parser.ts

interface ParsedQuery {
  category?: 'CONDO' | 'HOUSE' | 'LAND' | 'INVESTMENT';
  listingType?: 'SALE' | 'RENT' | 'BOTH';
  priceRange?: { min?: number; max?: number };
  bedrooms?: { min?: number; max?: number };
  location?: {
    nearPOI?: { type: string; maxDistanceKm: number }[];
    area?: string;
    city?: string;
  };
  marketPosition?: 'BELOW_MARKET' | 'FAIR' | 'ANY';
  yieldRequirement?: { minYield?: number };
  features?: string[];
  sortBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'YIELD' | 'SCORE' | 'NEWEST';
}

// Example: "Cheap condo near beach, less than 1 km and cheaper than the market, high yield"
// Becomes:
{
  category: 'CONDO',
  location: {
    nearPOI: [{ type: 'BEACH', maxDistanceKm: 1 }]
  },
  marketPosition: 'BELOW_MARKET',
  yieldRequirement: { minYield: 6 },
  sortBy: 'YIELD'
}
```

### 3.2 Vector Search with Supabase

Supabase has native pgvector support:

```sql
-- Enable vector extension (run in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column to properties (1536 dimensions for OpenAI embeddings)
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS 
  embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON "Property" 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

```typescript
// src/lib/ai/semantic-search.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function semanticPropertySearch(query: string, limit = 20) {
  // 1. Generate embedding for user query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Search using Supabase RPC
  const { data: results } = await supabase.rpc('match_properties', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit
  });
  
  return results;
}
```

### 3.3 Hybrid Search (Best Approach)

Combine semantic + structured filters:

```typescript
// src/lib/ai/hybrid-search.ts

export async function intelligentSearch(naturalQuery: string) {
  // Step 1: Parse intent with GPT
  const parsedQuery = await parseQueryWithGPT(naturalQuery);
  
  // Step 2: Build Prisma filters from parsed query
  const filters = buildPrismaFilters(parsedQuery);
  
  // Step 3: If query is complex, also do semantic search
  const semanticResults = await semanticPropertySearch(naturalQuery);
  
  // Step 4: Combine and rank results
  const structuredResults = await prisma.property.findMany({
    where: filters,
    orderBy: { overallScore: 'desc' },
    take: 50
  });
  
  // Merge and deduplicate
  return mergeAndRankResults(structuredResults, semanticResults);
}

async function parseQueryWithGPT(query: string): Promise<ParsedQuery> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a real estate search query parser for Thailand.
        Extract structured filters from natural language queries.
        Return JSON with these possible fields:
        - category: CONDO, HOUSE, LAND, INVESTMENT
        - listingType: SALE, RENT, BOTH
        - priceMax, priceMin (in THB)
        - bedroomsMin, bedroomsMax
        - nearBeachKm, nearBtsKm, nearMallKm (max distance)
        - belowMarket: true if user wants deals
        - minYield: minimum rental yield percentage
        - city, area
        - features: array of desired features`
      },
      { role: 'user', content: query }
    ]
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 🏗️ Phase 4: User Behavior & Personalization

### 4.1 Track Everything

```prisma
model UserActivity {
  id          String         @id @default(uuid())
  userId      String?        // Supabase auth user
  sessionId   String         // For anonymous users
  eventType   UserEventType
  propertyId  String?
  searchQuery String?
  metadata    Json?          // Additional context
  createdAt   DateTime       @default(now())
  
  @@index([userId])
  @@index([sessionId])
  @@index([eventType])
  @@index([createdAt])
}

enum UserEventType {
  SEARCH
  VIEW_LISTING
  VIEW_GALLERY
  CLICK_CONTACT
  ADD_WISHLIST
  COMPARE
  SHARE
  ENQUIRY_SUBMIT
  FILTER_APPLY
  SORT_CHANGE
}
```

### 4.2 User Preferences Model

```prisma
model UserPreference {
  id              String    @id @default(uuid())
  userId          String    @unique
  
  // Inferred preferences (updated by ML)
  preferredCategory    PropertyCategory?
  preferredCities      String[]
  preferredPriceMin    Decimal?    @db.Decimal(12, 2)
  preferredPriceMax    Decimal?    @db.Decimal(12, 2)
  preferredBedrooms    Int?
  preferredAmenities   String[]
  buyerType            BuyerType?
  
  // Explicit preferences (user-set)
  alertsEnabled        Boolean     @default(false)
  
  updatedAt       DateTime  @updatedAt
}

enum BuyerType {
  INVESTOR          // Focuses on yield, market value
  END_USER          // Focuses on lifestyle, amenities
  RETIREE           // Focuses on healthcare, quiet areas
  FAMILY            // Focuses on schools, space
  DIGITAL_NOMAD     // Focuses on coworking, internet
}
```

---

## 📋 Implementation Roadmap

### Month 1-2: Data Foundation
- [ ] Add POI models to schema
- [ ] Seed POI data for Pattaya/Jomtien (50-100 key locations)
- [ ] Implement distance calculation service
- [ ] Add distance fields to Property model
- [ ] Create cron job to update distances on property changes

### Month 3-4: Scoring & Intelligence
- [ ] Implement property scoring algorithm
- [ ] Add score fields and indexes
- [ ] Create admin dashboard to view/adjust scoring weights
- [ ] Backfill scores for all existing properties
- [ ] Add "Deal Score" badge to listing cards

### Month 5-6: Search Enhancement
- [ ] Add pgvector extension to Supabase
- [ ] Create embedding generation pipeline
- [ ] Implement GPT query parser
- [ ] Build hybrid search API
- [ ] Create "AI Search" UI component

### Month 7-8: Behavior Tracking
- [ ] Add UserActivity tracking
- [ ] Implement event logging on frontend
- [ ] Create user preference extraction
- [ ] Build recommendation engine
- [ ] Add "Recommended for You" section

### Month 9-12: AI Features
- [ ] Train/fine-tune query understanding model
- [ ] Implement conversational search
- [ ] Add property comparison AI
- [ ] Create investment analysis AI
- [ ] Build market prediction models

---

## 💰 Cost Estimates

| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| **OpenAI Embeddings** | ~500 THB | ~5000 properties × monthly updates |
| **OpenAI GPT-4o-mini** | ~1,500 THB | Query parsing, ~10K queries/month |
| **Supabase Pro** | ~900 THB | Already using, includes pgvector |
| **Google Places API** | ~3,000 THB | Initial POI data, then minimal |
| **Total Initial** | ~6,000 THB/month | Scales with usage |

---

## 🎯 Success Metrics

| Metric | Current | Target (6 months) | Target (12 months) |
|--------|---------|-------------------|-------------------|
| Search → Enquiry Rate | ? | 5% | 10% |
| Average Session Duration | ? | 3 min | 5 min |
| Return User Rate | ? | 20% | 40% |
| "AI Search" Usage | 0% | 30% | 60% |
| User Satisfaction Score | ? | 4.0/5.0 | 4.5/5.0 |

---

## 🔑 Key Differentiators for Billion-THB Valuation

1. **Data Moat**: Pre-calculated POI distances no competitor has
2. **Market Intelligence**: Real-time fair value estimates
3. **AI-Native Search**: Natural language that actually works
4. **Personalization**: "Knows" what each user wants
5. **Transaction Data**: SoldProperty archive for market analysis
6. **Agent Network**: Platform effect with commission structure

---

## Next Steps

1. **Immediate**: Add POI and PropertyPOIDistance models
2. **This Week**: Seed 50 key POIs in Pattaya
3. **This Month**: Implement distance calculation on property save
4. **Review**: Schedule bi-weekly reviews of data quality

---

*Document created: December 2024*
*Last updated: December 2024*
*Author: AI Architecture Review*

---

## 📍 POI Management Guide

### Accessing POI Admin
Navigate to: **`/agent/pois`** (SUPER_ADMIN only)

### How to Add a New POI

1. **Get Coordinates from Google Maps:**
   - Open Google Maps
   - Right-click on the exact location
   - Click "What's here?"
   - Copy the coordinates (e.g., `12.9266, 100.8688`)

2. **Add via Admin UI:**
   - Go to `/agent/pois`
   - Click "+ Add POI"
   - Fill in:
     - **Name** (English): e.g., "Jomtien Beach"
     - **Name (Thai)**: e.g., "หาดจอมเทียน"
     - **Type**: Select from dropdown (BEACH, HOSPITAL, etc.)
     - **Tier**: PRIMARY (for search) or SECONDARY (display only)
     - **Latitude/Longitude**: From Google Maps
     - **City**: e.g., "Pattaya"
     - **Area**: e.g., "Jomtien" (optional sub-district)

### POI Types Available
| Type | Icon | Use For |
|------|------|---------|
| BEACH | 🏖️ | Beaches, waterfront |
| HOSPITAL | 🏥 | Major hospitals |
| INTERNATIONAL_SCHOOL | 🎓 | International schools |
| THAI_SCHOOL | 📚 | Thai schools |
| SHOPPING_MALL | 🛒 | Malls, shopping centers |
| SUPERMARKET | 🏪 | Big C, Makro, etc. |
| BTS_STATION | 🚇 | BTS/MRT stations |
| AIRPORT | ✈️ | Airports |
| GOLF_COURSE | ⛳ | Golf courses |
| PARK | 🌳 | Parks, gardens |
| NIGHTLIFE | 🌙 | Entertainment areas |
| IMMIGRATION | 🛂 | Immigration offices |
| TEMPLE | 🛕 | Temples, religious sites |

### Tier System
- **PRIMARY**: Major landmarks used for search filters
  - Example: "Find condos < 1km from beach"
  - These affect `nearestBeachKm`, `nearestMallKm`, etc.
  
- **SECONDARY**: Convenience info only
  - Example: "7-Eleven nearby"
  - Not used in search filters

### API Endpoints
```
GET    /api/pois          - List all POIs (with filters)
POST   /api/pois          - Create new POI (SUPER_ADMIN)
GET    /api/pois/[id]     - Get single POI
PUT    /api/pois/[id]     - Update POI (SUPER_ADMIN)
DELETE /api/pois/[id]     - Deactivate POI (SUPER_ADMIN)
```

### Current POIs Seeded (32 locations)
- 5 Beaches (Jomtien, Pattaya, Wong Amat, Na Jomtien, Dongtan)
- 4 Hospitals (Bangkok Hospital, Memorial, International, Queen Sirikit)
- 5 Shopping Malls (Central Festival, Terminal 21, Central Marina, Big C, Lotus)
- 4 International Schools (Regents, St. Andrews, Rugby, ISE)
- 3 Supermarkets (Makro, Big C Extra, Foodland)
- 3 Golf Courses (Siam Country Club, Laem Chabang, Phoenix)
- 2 Parks (Nong Nooch, Pattaya Viewpoint)
- 2 Nightlife (Walking Street, Soi Buakhao)
- 2 Temples (Sanctuary of Truth, Big Buddha)
- 1 Airport (U-Tapao)
- 1 Immigration Office

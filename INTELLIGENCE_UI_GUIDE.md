# Intelligence Stats UI Guide

## 🎯 Overview

This guide shows what intelligence stats to display on your platform and how to implement them when you have enough listings for accurate calculations.

---

## 📊 Stats Available from Intelligence System

### **Calculated Automatically:**
1. **Price per Sqm** - `pricePerSqm`
2. **Rental Yield %** - `estimatedRentalYield`
3. **Fair Value Estimate** - `fairValueEstimate`
4. **Price Deviation %** - `priceDeviation`
5. **Deal Quality** - `dealQuality` (SUPER_DEAL, GOOD_VALUE, FAIR, OVERPRICED, HIGH_YIELD)
6. **View Count** - `viewCount`
7. **Enquiry Count** - `enquiryCount`
8. **Lead Score** - `leadScore` (0-100)

---

## 🎨 PROPERTY CARD DESIGN

### **Public Search Results (Everyone Sees)**

```
┌─────────────────────────────────────────────┐
│ [Image]                    🔥 HIGH YIELD    │ ← Deal Quality Badge
│                                             │
│ Sea View Condo - Jomtien                    │
│ ฿3,200,000                                  │
│                                             │
│ 📐 35 sqm  🛏️ 1 bed  🚿 1 bath             │
│                                             │
│ ฿91,429/sqm                                 │ ← Price per sqm
│ 7.5% Rental Yield                           │ ← Rental yield (if RENT/BOTH)
│                                             │
│ 👁️ 127 views                                │ ← Social proof
└─────────────────────────────────────────────┘
```

### **Internal Agent View (SUPER_ADMIN, PLATFORM_AGENT)**

```
┌─────────────────────────────────────────────┐
│ [Image]                    🔥 HIGH YIELD    │
│                            ⭐ Lead Score: 78 │ ← Lead priority
│                                             │
│ Sea View Condo - Jomtien                    │
│ ฿3,200,000  💰 ฿91,429/sqm                  │
│                                             │
│ 📊 MARKET INTELLIGENCE                      │
│ Fair Value:    ฿3,400,000                   │ ← Internal only
│ Deviation:     -5.9% (Good Deal!)           │ ← Internal only
│ Rental Yield:  7.5%                         │
│                                             │
│ 📈 ACTIVITY                                 │
│ Views:         127                          │
│ Enquiries:     8                            │
│ Commission:    3% (฿96,000)                 │ ← Internal only
└─────────────────────────────────────────────┘
```

---

## 🏷️ DEAL QUALITY BADGES

### **Badge Colors & Icons**

```tsx
const dealBadges = {
  SUPER_DEAL: {
    icon: '🔥',
    text: 'Super Deal',
    color: 'bg-red-500 text-white',
    description: '>15% below market'
  },
  GOOD_VALUE: {
    icon: '✨',
    text: 'Good Value',
    color: 'bg-green-500 text-white',
    description: '5-15% below market'
  },
  HIGH_YIELD: {
    icon: '💰',
    text: 'High Yield',
    color: 'bg-purple-500 text-white',
    description: '>6% rental return'
  },
  FAIR: {
    icon: '✓',
    text: 'Fair Price',
    color: 'bg-gray-400 text-white',
    description: 'Market price'
  },
  OVERPRICED: {
    icon: '⚠️',
    text: 'Above Market',
    color: 'bg-orange-500 text-white',
    description: '>5% above market'
  }
};
```

### **When to Show:**
- **Public**: Show SUPER_DEAL, GOOD_VALUE, HIGH_YIELD only (positive badges)
- **Internal Agents**: Show all badges including OVERPRICED (helps with pricing strategy)

---

## 🔍 SEARCH FILTERS & SORTING

### **New Filter Options**

```
┌─────────────────────────────────────────────┐
│ FILTERS                                     │
├─────────────────────────────────────────────┤
│                                             │
│ 💰 Deal Quality                             │
│ ☐ Super Deals (>15% off)                    │
│ ☐ Good Value (5-15% off)                    │
│ ☐ High Yield (>6% return)                   │
│                                             │
│ 📊 Rental Yield                             │
│ ○ Any                                       │
│ ○ 5-6%                                      │
│ ○ 6-7%                                      │
│ ○ 7-8%                                      │
│ ○ 8%+                                       │
│                                             │
│ 💵 Price per Sqm                            │
│ Min: [____] - Max: [____]                   │
│                                             │
└─────────────────────────────────────────────┘
```

### **Sorting Options**

```
Sort by:
- Best Value (lowest priceDeviation)
- Highest Yield (highest estimatedRentalYield)
- Price: Low to High
- Price: High to Low
- Newest First
- Most Popular (highest viewCount)
- Hot Leads (highest leadScore) [Internal only]
```

---

## 📍 PROPERTY DETAIL PAGE

### **Public View**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Image Gallery]                                        │
│                                                         │
│  Sea View Condo, Jomtien                   🔥 HIGH YIELD│
│  ฿3,200,000                                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 KEY METRICS                                         │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ Price/Sqm    │ Rental Yield │ Views        │        │
│  │ ฿91,429      │ 7.5%         │ 127          │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  💡 INVESTMENT HIGHLIGHTS                               │
│  • High rental yield (7.5% vs 5.2% area average)       │
│  • Popular listing (127 views in 7 days)               │
│  • Competitive price per sqm                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Internal Agent View**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Image Gallery]                                        │
│                                                         │
│  Sea View Condo, Jomtien          🔥 HIGH YIELD ⭐ 78/100│
│  ฿3,200,000                                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 MARKET INTELLIGENCE (Internal Only)                 │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ Fair Value   │ Deviation    │ Deal Quality │        │
│  │ ฿3,400,000   │ -5.9%        │ GOOD VALUE   │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  💰 COMMISSION BREAKDOWN                                │
│  • Platform Commission: 5% (฿160,000)                   │
│  • Agent Commission: 3% (฿96,000)                       │
│  • Co-agent Split: 50%                                  │
│                                                         │
│  📈 LEAD INTELLIGENCE                                   │
│  • Lead Score: 78/100 (High Priority)                  │
│  • Views: 127 (15 today)                               │
│  • Enquiries: 8 (2 pending response)                   │
│  • Days on Market: 12 days                             │
│                                                         │
│  💡 AGENT INSIGHTS                                      │
│  ✓ Priced 5.9% below fair value - likely to sell fast  │
│  ✓ High rental yield - great for investors             │
│  ✓ Strong interest (8 enquiries) - follow up urgently  │
│  ⚠️ Similar unit sold for ฿3.1M last month             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 SEARCH RESULTS PAGE

### **Header Stats Bar (Public)**

```
┌─────────────────────────────────────────────────────────┐
│ Found 47 properties in Jomtien                          │
│                                                         │
│ 🔥 12 Super Deals  ✨ 18 Good Value  💰 8 High Yield   │
│                                                         │
│ Avg Price/Sqm: ฿85,230  |  Avg Yield: 5.8%             │
└─────────────────────────────────────────────────────────┘
```

### **Internal Agent View - Additional Stats**

```
┌─────────────────────────────────────────────────────────┐
│ Found 47 properties in Jomtien                          │
│                                                         │
│ 🔥 12 Super Deals  ✨ 18 Good Value  💰 8 High Yield   │
│ ⚠️ 5 Overpriced                                         │
│                                                         │
│ 📊 Market Overview:                                     │
│ • Avg Price/Sqm: ฿85,230 (↑ 3.2% vs last month)        │
│ • Avg Yield: 5.8%                                       │
│ • Hot Leads: 14 properties (lead score >70)            │
│ • Total Enquiries: 156 (last 7 days)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 VISUAL INDICATORS

### **Price Deviation Indicator**

```tsx
// Show visual indicator of price vs market
{priceDeviation && (
  <div className="flex items-center gap-2">
    {priceDeviation < -15 && (
      <span className="text-red-500 font-bold">
        ↓ {Math.abs(priceDeviation)}% below market
      </span>
    )}
    {priceDeviation < -5 && priceDeviation >= -15 && (
      <span className="text-green-500">
        ↓ {Math.abs(priceDeviation)}% below market
      </span>
    )}
    {priceDeviation > 5 && (
      <span className="text-orange-500">
        ↑ {priceDeviation}% above market
      </span>
    )}
  </div>
)}
```

### **Rental Yield Color Coding**

```tsx
const getYieldColor = (yield: number) => {
  if (yield >= 8) return 'text-purple-600 font-bold'; // Excellent
  if (yield >= 6) return 'text-green-600 font-bold';  // Good
  if (yield >= 4) return 'text-blue-600';             // Fair
  return 'text-gray-600';                             // Low
};
```

---

## 📱 MOBILE CARD DESIGN

### **Compact View**

```
┌─────────────────────────────┐
│ [Image]        🔥 HIGH YIELD│
│                             │
│ Sea View Condo              │
│ ฿3.2M  •  ฿91k/sqm          │
│ 1 bed  •  35 sqm            │
│                             │
│ 💰 7.5% yield  •  👁️ 127    │
└─────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION PRIORITY

### **Phase 1: Basic Stats (Implement Now)**
- ✅ Price per sqm on all cards
- ✅ Rental yield % (for RENT/BOTH listings)
- ✅ Deal quality badges (SUPER_DEAL, GOOD_VALUE, HIGH_YIELD)

### **Phase 2: Social Proof (After 100+ listings)**
- View count on property cards
- "Popular" badge for high-view properties
- "New" badge for listings <7 days old

### **Phase 3: Advanced Intelligence (After 500+ listings)**
- Fair value estimates
- Price deviation indicators
- Market comparison stats
- Lead scoring for agents

### **Phase 4: Search Filters (After 1000+ listings)**
- Filter by deal quality
- Filter by rental yield range
- Sort by best value
- Sort by highest yield

---

## 💡 SMART DEFAULTS

### **When to Show Each Stat:**

| Stat | Show When | Why |
|------|-----------|-----|
| Price/Sqm | Always | Universal comparison metric |
| Rental Yield | listingType = RENT or BOTH | Only relevant for rentals |
| Deal Quality Badge | dealQuality exists | Requires AreaStats data |
| Fair Value | Internal agents only | Competitive intelligence |
| View Count | viewCount > 10 | Social proof (hide low numbers) |
| Lead Score | Internal agents only | Sales prioritization |

### **Minimum Data Requirements:**

```typescript
// Only show intelligence if we have enough data
const canShowIntelligence = {
  dealQuality: areaStats?.activeListings >= 10, // Need 10+ comps
  fairValue: areaStats?.soldLast90Days >= 5,    // Need 5+ sales
  marketAverage: areaStats?.activeListings >= 20 // Need 20+ listings
};
```

---

## 🎯 EXAMPLE IMPLEMENTATIONS

### **Property Card Component**

```tsx
interface PropertyCardProps {
  property: Property;
  isInternalAgent?: boolean;
}

export function PropertyCard({ property, isInternalAgent }: PropertyCardProps) {
  return (
    <div className="property-card">
      {/* Image */}
      <div className="relative">
        <Image src={property.images[0]} />
        
        {/* Deal Quality Badge */}
        {property.dealQuality && (
          <Badge className={getDealBadgeStyle(property.dealQuality)}>
            {getDealBadgeIcon(property.dealQuality)} {property.dealQuality}
          </Badge>
        )}
        
        {/* Lead Score (Internal Only) */}
        {isInternalAgent && property.leadScore && (
          <Badge className="absolute top-2 right-2">
            ⭐ {property.leadScore}/100
          </Badge>
        )}
      </div>

      {/* Title & Price */}
      <h3>{property.title}</h3>
      <p className="text-2xl font-bold">
        ฿{property.price?.toLocaleString()}
      </p>

      {/* Basic Info */}
      <div className="flex gap-4">
        <span>📐 {property.size} sqm</span>
        <span>🛏️ {property.bedrooms} bed</span>
      </div>

      {/* Intelligence Stats */}
      <div className="mt-2 space-y-1">
        {/* Price per Sqm - Always show */}
        {property.pricePerSqm && (
          <div className="text-sm text-gray-600">
            ฿{property.pricePerSqm.toLocaleString()}/sqm
          </div>
        )}

        {/* Rental Yield - Show for RENT/BOTH */}
        {property.estimatedRentalYield && (
          <div className="text-sm font-semibold text-green-600">
            💰 {property.estimatedRentalYield}% Rental Yield
          </div>
        )}

        {/* View Count - Social proof */}
        {property.viewCount > 10 && (
          <div className="text-sm text-gray-500">
            👁️ {property.viewCount} views
          </div>
        )}

        {/* Internal Agent Stats */}
        {isInternalAgent && (
          <>
            {property.fairValueEstimate && (
              <div className="text-sm">
                Fair Value: ฿{property.fairValueEstimate.toLocaleString()}
              </div>
            )}
            {property.priceDeviation && (
              <div className={getPriceDeviationColor(property.priceDeviation)}>
                {property.priceDeviation > 0 ? '↑' : '↓'} 
                {Math.abs(property.priceDeviation)}% vs market
              </div>
            )}
            {property.enquiryCount > 0 && (
              <div className="text-sm text-blue-600">
                📧 {property.enquiryCount} enquiries
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 STATS SUMMARY

### **What to Show on Each View:**

**Public Property Card:**
- ✅ Price per sqm
- ✅ Rental yield (if applicable)
- ✅ Deal quality badge (positive only)
- ✅ View count (if >10)

**Internal Agent Card:**
- ✅ Everything above, PLUS:
- ✅ Fair value estimate
- ✅ Price deviation
- ✅ Lead score
- ✅ Enquiry count
- ✅ Commission breakdown

**Search Results Summary:**
- ✅ Count of deals by quality
- ✅ Average price/sqm for search
- ✅ Average rental yield

**Property Detail Page:**
- ✅ All relevant stats in organized sections
- ✅ Investment highlights
- ✅ Market comparison
- ✅ Agent insights (internal only)

---

## 🎯 NEXT STEPS

1. **Keep adding listings** - Need 50-100 properties per area for accurate stats
2. **Populate AreaStats** - Run aggregation to calculate market averages
3. **Implement Phase 1** - Add basic stats (price/sqm, yield, badges)
4. **Test with real data** - Verify calculations are accurate
5. **Iterate based on feedback** - See what agents and users find most useful

---

**Last Updated**: December 25, 2025

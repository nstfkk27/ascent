# SEO Implementation Guide for Estate Ascent

## PHASE 1: CRITICAL TECHNICAL SEO (Week 1)

### 1. Dynamic Meta Tags for Property Pages

**Current Issue:** Property detail pages don't have unique meta tags
**Impact:** Google can't properly index your listings

**Implementation:**

```typescript
// src/app/[locale]/properties/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const propertyId = extractIdFromSlug(params.id) || params.id;
  const property = await fetchProperty(propertyId);
  
  if (!property) {
    return {
      title: 'Property Not Found | Estate Ascent',
    };
  }

  const priceText = property.listingType === 'RENT' 
    ? `฿${property.rentPrice?.toLocaleString()}/month`
    : `฿${property.price?.toLocaleString()}`;

  return {
    title: `${property.title} - ${priceText} | ${property.city} Property for ${property.listingType}`,
    description: `${property.description?.substring(0, 155)}... ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.size}sqm in ${property.city}, ${property.state}. Contact us for viewing.`,
    keywords: [
      property.category.toLowerCase(),
      property.city.toLowerCase(),
      property.state.toLowerCase(),
      property.listingType.toLowerCase(),
      'pattaya real estate',
      'thailand property',
      `${property.bedrooms} bedroom`,
    ],
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images.slice(0, 3),
      type: 'website',
      locale: 'en_US',
      siteName: 'Estate Ascent',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: property.description,
      images: [property.images[0]],
    },
  };
}
```

### 2. Add Structured Data (Schema.org)

**Why:** Google shows rich snippets (star ratings, price, availability) in search results
**Impact:** 30-40% higher click-through rate

```typescript
// Add to property detail page
const propertySchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": property.title,
  "description": property.description,
  "url": `https://estateascent.com/properties/${property.slug}-${property.id}`,
  "image": property.images,
  "offers": {
    "@type": "Offer",
    "price": property.price,
    "priceCurrency": "THB",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": property.address,
    "addressLocality": property.city,
    "addressRegion": property.state,
    "postalCode": property.zipCode,
    "addressCountry": "TH"
  },
  "numberOfRooms": property.bedrooms,
  "floorSize": {
    "@type": "QuantitativeValue",
    "value": property.size,
    "unitCode": "MTK"
  }
};

// Add to page:
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(propertySchema) }} />
```

### 3. Sitemap Generation

**Why:** Helps Google discover all your properties
**Impact:** Faster indexing

```typescript
// src/app/sitemap.ts
import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const properties = await prisma.property.findMany({
    where: { status: 'AVAILABLE' },
    select: { id: true, slug: true, updatedAt: true },
  });

  const propertyUrls = properties.map((property) => ({
    url: `https://estateascent.com/properties/${property.slug}-${property.id.substring(0, 8)}`,
    lastModified: property.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://estateascent.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://estateascent.com/properties',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://estateascent.com/search',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
```

### 4. robots.txt

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /agent/
Disallow: /api/

Sitemap: https://estateascent.com/sitemap.xml
```

---

## PHASE 2: CONTENT SEO (Week 2-3)

### 1. **Location Pages** (CRITICAL for Local SEO)

Create dedicated pages for each area:
- `/properties/pattaya`
- `/properties/jomtien`
- `/properties/naklua`
- `/properties/pratumnak`

**Template:**
```
Title: "Properties for Sale & Rent in [Area] | Estate Ascent"
H1: "Find Your Dream Property in [Area], Pattaya"
Content: 500-800 words about the area, amenities, lifestyle
Include: Map, property listings, area statistics
```

### 2. **Property Type Pages**

- `/condos-for-sale-pattaya`
- `/houses-for-rent-pattaya`
- `/land-for-sale-pattaya`
- `/investment-properties-pattaya`

### 3. **Blog Content** (HUGE for SEO)

Write 2-3 articles per month:
- "Complete Guide to Buying Property in Pattaya 2025"
- "Best Areas to Live in Pattaya for Expats"
- "Pattaya Real Estate Investment Guide"
- "Condo vs House: What to Buy in Pattaya"
- "Property Taxes in Thailand: Complete Guide"

**SEO Writing Tips:**
- Use target keyword in first 100 words
- Include keyword in H2 headings
- Add internal links to property listings
- Use images with alt text
- Aim for 1500+ words for pillar content

---

## PHASE 3: TECHNICAL OPTIMIZATIONS (Week 3-4)

### 1. **Image Optimization**

```typescript
// All images should use Next.js Image component with:
<Image
  src={imageUrl}
  alt="3 bedroom condo for sale in Jomtien, Pattaya - ฿4.5M"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  placeholder="blur"
/>
```

**Alt Text Formula:**
`[Property Type] for [Sale/Rent] in [Area], [City] - [Price]`

### 2. **Core Web Vitals**

Current issues to fix:
- ✅ Already using Next.js Image (good!)
- ⚠️ Reduce JavaScript bundle size
- ⚠️ Implement lazy loading for property cards
- ⚠️ Add loading skeletons

### 3. **Mobile Optimization**

- Ensure all pages work on mobile (already done ✅)
- Test with Google Mobile-Friendly Test
- Optimize touch targets (buttons 44x44px minimum)

---

## PHASE 4: OFF-PAGE SEO (Ongoing)

### 1. **Google Business Profile**

Create profile for Estate Ascent:
- Add office location
- Upload photos
- Collect reviews
- Post weekly updates

### 2. **Backlinks Strategy**

Get links from:
- **Thailand expat forums** (ThaiVisa, Pattaya Addicts)
- **Property portals** (DDProperty, Hipflat - list your properties)
- **Local directories** (Google Maps, Yelp Thailand)
- **Guest posts** on expat blogs
- **Press releases** for new developments

### 3. **Social Signals**

- Facebook page with property posts
- Instagram with property photos
- YouTube virtual tours (HUGE for SEO)
- Line Official Account

---

## PHASE 5: LOCAL SEO (Critical for Thailand Market)

### 1. **Thai Language Content**

Add Thai translations:
- Property descriptions
- Area guides
- Meta tags in Thai

### 2. **Local Keywords**

Target:
- "คอนโดพัทยา" (Condo Pattaya)
- "บ้านเช่าพัทยา" (House rent Pattaya)
- "ที่ดินขายพัทยา" (Land sale Pattaya)

### 3. **Google Maps Integration**

- Embed maps on property pages
- Add business to Google Maps
- Encourage check-ins

---

## QUICK WINS (Do Today!)

1. ✅ **Update metadataBase** in layout.tsx to `https://estateascent.com`
2. **Add favicon and app icons**
3. **Create Google Search Console account**
4. **Submit sitemap to Google**
5. **Set up Google Analytics 4**
6. **Add canonical URLs** to prevent duplicate content

---

## KEYWORD STRATEGY

### Primary Keywords (Target First)
- "Pattaya property for sale"
- "Pattaya condo for rent"
- "Jomtien real estate"
- "Pattaya investment property"
- "Thailand property for foreigners"

### Long-Tail Keywords (Easier to Rank)
- "2 bedroom condo for sale Jomtien beach"
- "luxury villa for rent Pratumnak Hill"
- "cheap studio apartment Pattaya"
- "beachfront property Pattaya"
- "retirement home Pattaya"

### Local Intent Keywords
- "property near Pattaya beach"
- "condo near Walking Street"
- "house near International School Pattaya"

---

## MEASUREMENT & TRACKING

### Tools to Use (All Free)

1. **Google Search Console** - Track rankings, clicks, impressions
2. **Google Analytics 4** - Track user behavior
3. **Google PageSpeed Insights** - Monitor performance
4. **Ahrefs Webmaster Tools** - Free backlink checker
5. **Ubersuggest** - Keyword research (free tier)

### KPIs to Track

- Organic traffic (goal: +20% monthly)
- Keyword rankings (track top 20 keywords)
- Conversion rate (property inquiries)
- Bounce rate (should be <50%)
- Average session duration (goal: 2+ minutes)

---

## COMPETITIVE ANALYSIS

Your main competitors in Pattaya:
- DDProperty
- Hipflat
- Thailand Property
- Fazwaz

**Their Strengths:**
- Established brand
- Large property inventory
- Strong backlink profile

**Your Advantages:**
- Modern, fast website
- Better UX (map search)
- Agent tools
- Niche focus (can target specific areas)

**Strategy:** Don't compete head-on. Target long-tail keywords and specific neighborhoods.

---

## TIMELINE & BUDGET

### Month 1 (Free)
- Implement technical SEO
- Create sitemap
- Set up Google tools
- Write 3 blog posts

### Month 2-3 ($0-500)
- Create location pages
- Guest posting ($100-200)
- Social media setup
- Directory submissions

### Month 4-6 ($500-1000)
- Paid backlinks (quality sites)
- Content marketing
- Video production
- Local advertising

### Expected Results

- **Month 1-2:** Indexed by Google, 50-100 visitors/day
- **Month 3-4:** 200-300 visitors/day, first inquiries
- **Month 6:** 500-1000 visitors/day, 5-10 inquiries/day
- **Month 12:** 2000+ visitors/day, established authority

---

## CONTENT CALENDAR (First 3 Months)

### Month 1
- Week 1: "Complete Guide to Buying Property in Pattaya"
- Week 2: "Best Areas to Live in Pattaya for Expats"
- Week 3: "Pattaya Condo Market Report 2025"
- Week 4: "Property Investment ROI in Pattaya"

### Month 2
- Week 1: "Jomtien vs Pattaya: Where Should You Buy?"
- Week 2: "Thailand Property Taxes Explained"
- Week 3: "Financing Options for Foreign Buyers"
- Week 4: "Top 10 Luxury Condos in Pattaya"

### Month 3
- Week 1: "Rental Yield Analysis: Pattaya Properties"
- Week 2: "Legal Guide: Buying Property as a Foreigner"
- Week 3: "Pratumnak Hill Property Guide"
- Week 4: "Pattaya Property Market Forecast 2025"

---

## RED FLAGS TO AVOID

❌ **Don't:**
- Buy cheap backlinks from Fiverr
- Stuff keywords unnaturally
- Copy content from competitors
- Hide text or links
- Use automated content
- Ignore mobile users
- Forget to update old listings

✅ **Do:**
- Write for humans first, SEO second
- Update content regularly
- Remove sold properties
- Respond to comments
- Build genuine relationships
- Focus on user experience
- Be patient (SEO takes 3-6 months)

---

## EMERGENCY CHECKLIST

If you do NOTHING else, do these 5 things:

1. ✅ Add dynamic meta tags to property pages
2. ✅ Create and submit sitemap
3. ✅ Set up Google Search Console
4. ✅ Write 1 blog post per week
5. ✅ Get 5 backlinks from quality sites

This alone will get you 70% of the results.

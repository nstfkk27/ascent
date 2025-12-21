# Property Reference ID & Slug Migration Guide

This guide explains the new dual-ID system for properties with SEO-optimized URLs.

## Overview

Properties now have three identifiers:
1. **UUID (`id`)**: Internal database primary key (e.g., `a1b2c3d4-5678-90ab-cdef-1234567890ab`)
2. **Reference ID (`referenceId`)**: Human-friendly ID for agents (e.g., `ASC-847392`)
3. **Slug (`slug`)**: SEO-friendly URL identifier (e.g., `luxury-pool-villa-jomtien`)

## URL Structure

**Recommended format:**
```
/properties/{slug}-{uuid-fragment}
```

**Example:**
```
/properties/luxury-pool-villa-jomtien-a1b2c3d4
```

This combines SEO benefits with guaranteed uniqueness.

## Reference ID Format

- **Pattern**: `ASC-XXXXXX` (6 random digits)
- **Range**: `ASC-100000` to `ASC-999999`
- **Total capacity**: 900,000 unique IDs
- **Use cases**:
  - Agent communication: "Check out listing ASC-847392"
  - Property cards and listings
  - Search functionality
  - Print materials
  - Internal tracking

## Migration Steps

### 1. Run Prisma Migration

```bash
npx prisma migrate dev --name add_reference_id_and_slug
```

This will:
- Add `referenceId` field (unique, indexed)
- Add `slug` field (unique, indexed)
- Create database indexes for fast lookups

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This updates TypeScript types to include the new fields.

### 3. Migrate Existing Properties

```bash
npx tsx src/scripts/migrate-add-reference-ids.ts
```

This script will:
- Find all properties without `referenceId` or `slug`
- Generate unique random reference IDs (ASC-XXXXXX)
- Generate SEO-friendly slugs from titles
- Update all properties in the database

## API Changes

### Creating Properties

The API automatically generates both fields:

```typescript
// POST /api/properties
const response = await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Luxury Pool Villa in Jomtien',
    // ... other fields
  })
});

// Response includes:
// {
//   id: "a1b2c3d4-...",
//   referenceId: "ASC-847392",
//   slug: "luxury-pool-villa-jomtien",
//   ...
// }
```

### Updating Properties

When title is updated, slug is automatically regenerated:

```typescript
// PUT /api/properties/[id]
await fetch(`/api/properties/${id}`, {
  method: 'PUT',
  body: JSON.stringify({
    title: 'Updated Title',
    // ... other fields
  })
});
// Slug will be regenerated: "updated-title"
```

## Search Functionality

Properties can be searched by:
- UUID: `a1b2c3d4-...`
- Reference ID: `ASC-847392` or just `847392`
- Slug: `luxury-pool-villa-jomtien`

## UI Display Recommendations

### Property Cards
```
┌─────────────────────────────┐
│ [Image]                     │
│                             │
│ Luxury Pool Villa  ASC-847392│
│ ฿5,000,000                  │
│ Jomtien, Pattaya            │
└─────────────────────────────┘
```

### Property Details Page
```
ASC-847392                    [Share] [Edit]

Luxury Pool Villa in Jomtien
฿5,000,000 | 3 bed | 2 bath | 150 sqm
```

### Agent Dashboard
```
Ref ID      | Title                    | Price      | Status
---------------------------------------------------------------
ASC-847392  | Luxury Pool Villa        | ฿5,000,000 | Available
ASC-102847  | Modern Condo Central     | ฿3,500,000 | Pending
```

## Benefits

### For Agents
- **Easy communication**: "Show me ASC-847392"
- **Professional appearance**: Organized numbering system
- **Memorable**: 6 digits are easy to remember
- **Searchable**: Quick lookup by reference ID

### For SEO
- **Keyword-rich URLs**: `/properties/luxury-pool-villa-jomtien-a1b2c3d4`
- **Readable**: Users can understand the URL
- **Shareable**: Clean URLs for social media
- **Flexible**: Can change title without breaking links (UUID ensures uniqueness)

### For System
- **Scalable**: Supports 900,000 properties
- **Unique**: No collisions with random generation
- **Indexed**: Fast database lookups
- **Privacy**: Hides total listing count from competitors

## Utility Functions

Available in `src/utils/propertyHelpers.ts`:

```typescript
// Generate random reference ID
const refId = await generateReferenceId();
// Returns: "ASC-847392"

// Generate slug from title
const slug = generateSlugFromTitle("Luxury Pool Villa");
// Returns: "luxury-pool-villa"

// Generate unique slug (handles duplicates)
const uniqueSlug = await generateUniqueSlug("Luxury Villa");
// Returns: "luxury-villa" or "luxury-villa-2" if exists

// Create compound URL slug
const urlSlug = createCompoundSlug(slug, uuid);
// Returns: "luxury-villa-a1b2c3d4"

// Extract ID from compound slug
const id = extractIdFromSlug("luxury-villa-a1b2c3d4");
// Returns: "a1b2c3d4"
```

## Troubleshooting

### Duplicate Reference IDs
The system automatically retries up to 10 times if a collision occurs. With 900,000 possible IDs, collisions are extremely rare.

### Slug Conflicts
If a slug already exists, the system appends a number:
- `luxury-villa`
- `luxury-villa-2`
- `luxury-villa-3`

### Migration Errors
If the migration script fails:
1. Check database connection
2. Ensure Prisma migration was run first
3. Check for any existing data conflicts
4. Run with `--verbose` flag for detailed logs

## Next Steps

After migration:
1. Update frontend components to display `referenceId`
2. Update search functionality to support reference ID lookup
3. Update property detail pages to use compound slug URLs
4. Add reference ID to property cards and listings
5. Update print/export templates to include reference ID

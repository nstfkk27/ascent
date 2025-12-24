# Property Schema Comprehensive Review

## 🔍 ISSUES IDENTIFIED

### 1. **Inconsistent Field Usage Across Categories**

#### **Problem: `petFriendly` and `furnished` are global fields but only relevant for HOUSE/CONDO**

**Current Schema (Prisma):**
```prisma
model Property {
  petFriendly  Boolean?  // Line 107 - Global field
  furnished    Boolean?  // Line 109 - Global field
  // ... other fields
}
```

**Issue:**
- These fields appear for ALL property categories (HOUSE, CONDO, LAND, INVESTMENT)
- They don't make sense for LAND or most INVESTMENT types
- Creates confusion in forms and data validation

**Where it's used:**
- ✅ HOUSE: Makes sense (furnished house, pet-friendly house)
- ✅ CONDO: Makes sense (furnished condo, pet-friendly condo)
- ❌ LAND: Doesn't make sense (you can't furnish land)
- ❌ INVESTMENT (Hotel/Restaurant/etc): Partially makes sense but should be in amenities

---

### 2. **Field Organization Issues**

#### **Mixed Category-Specific Fields**

**Current Schema:**
```prisma
bedrooms              Int?         // Line 103 - For HOUSE/CONDO only
bathrooms             Int?         // Line 104 - For HOUSE/CONDO only
isStudio              Boolean?     // Line 105 - For CONDO only
size                  Int          // Line 106 - For ALL
petFriendly           Boolean?     // Line 107 - For HOUSE/CONDO only
parking               Int?         // Line 108 - For ALL
furnished             Boolean?     // Line 109 - For HOUSE/CONDO only
garden                Boolean?     // Line 110 - For HOUSE only (private garden)
pool                  Boolean?     // Line 111 - For HOUSE/INVESTMENT
floors                Int?         // Line 112 - For HOUSE/INVESTMENT
amenities             Json?        // Line 113 - For ALL
```

**Problems:**
1. No clear separation between category-specific and universal fields
2. `garden` and `pool` have different meanings:
   - For HOUSE: Private garden/pool
   - For CONDO: Should be in project facilities (communal)
   - For INVESTMENT: Business amenity
3. `floors` means different things:
   - For HOUSE: Number of floors in the house
   - For INVESTMENT: Number of floors in the building

---

### 3. **Amenities JSON Field Confusion**

**Current Implementation:**
- `amenities` is a JSON field that stores different things for different categories
- No clear schema or validation
- Mixes unit-specific features with project facilities

**Example from constants.ts:**
```typescript
HOUSE_UNIT_FEATURES = [
  { id: 'westernKitchen', label: 'Western Kitchen' },
  { id: 'privatePool', label: 'Private Pool' },
  { id: 'privateGarden', label: 'Private Garden' },
  // ...
]

PROJECT_FACILITIES = [
  { id: 'swimmingPool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Gym / Fitness' },
  // ...
]
```

**Issues:**
- `privatePool` vs `pool` boolean field (duplicate)
- `privateGarden` vs `garden` boolean field (duplicate)
- No validation on what goes into `amenities` JSON

---

### 4. **Category-Specific Fields Not Properly Isolated**

#### **HOUSE-specific fields scattered:**
- `houseType` (line 94) ✅ Correct
- `garden` (line 110) - Should be in amenities or separate
- `pool` (line 111) - Shared with INVESTMENT
- `floors` (line 112) - Shared with INVESTMENT

#### **CONDO-specific fields:**
- `floor` (line 96) ✅ Correct (which floor the unit is on)
- `isStudio` (line 105) ✅ Correct
- Views (seaView, cityView, etc.) - Only in amenities JSON ✅

#### **INVESTMENT-specific fields:**
- `investmentType` (line 97) ✅ Correct
- `openForYears` (line 98) ✅ Correct
- `equipmentIncluded` (line 99) ✅ Correct
- `numberOfStaff` (line 100) ✅ Correct
- `monthlyRevenue` (line 101) ✅ Correct
- `license` (line 102) ✅ Correct
- `conferenceRoom` (line 127) ✅ Correct

#### **LAND-specific fields:**
- `landZoneColor` (line 130) ✅ Correct

---

## 📋 RECOMMENDATIONS

### **Option 1: Keep Current Schema, Add Validation (Easiest)**

**Pros:**
- No database migration needed
- Quick to implement
- Backward compatible

**Cons:**
- Still has conceptual issues
- Confusing for developers

**Implementation:**
1. Add field visibility logic in forms based on category
2. Add validation in API to reject inappropriate fields
3. Update PropertyCard to only show relevant fields

```typescript
// Example validation
if (category === 'LAND' && (petFriendly || furnished)) {
  throw new Error('petFriendly and furnished not applicable to LAND');
}
```

---

### **Option 2: Restructure Schema with Category-Specific Tables (Best Practice)**

**Pros:**
- Clean separation of concerns
- Type-safe
- No confusion

**Cons:**
- Requires database migration
- More complex queries
- Breaking change

**Schema Design:**
```prisma
model Property {
  // Universal fields only
  id          String
  title       String
  price       Decimal?
  size        Int
  // ...
  
  // Relations to category-specific data
  houseDetails      HouseDetails?
  condoDetails      CondoDetails?
  investmentDetails InvestmentDetails?
  landDetails       LandDetails?
}

model HouseDetails {
  propertyId   String @unique
  property     Property @relation(fields: [propertyId], references: [id])
  houseType    HouseType
  bedrooms     Int
  bathrooms    Int
  floors       Int?
  petFriendly  Boolean?
  furnished    Boolean?
  privatePool  Boolean?
  privateGarden Boolean?
}

model CondoDetails {
  propertyId   String @unique
  property     Property @relation(fields: [propertyId], references: [id])
  floor        Int
  bedrooms     Int
  bathrooms    Int
  isStudio     Boolean?
  petFriendly  Boolean?
  furnished    Boolean?
  views        Json? // seaView, cityView, etc.
}

model InvestmentDetails {
  propertyId        String @unique
  property          Property @relation(fields: [propertyId], references: [id])
  investmentType    InvestmentType
  openForYears      Int?
  numberOfStaff     Int?
  equipmentIncluded EquipmentLevel?
  monthlyRevenue    Decimal?
  license           Boolean?
  conferenceRoom    Boolean?
}

model LandDetails {
  propertyId    String @unique
  property      Property @relation(fields: [propertyId], references: [id])
  landZoneColor LandZoneColor?
}
```

---

### **Option 3: Hybrid Approach (Recommended)**

**Keep current schema but:**
1. Move `petFriendly` and `furnished` to `amenities` JSON
2. Standardize `pool` and `garden` usage:
   - Remove boolean fields
   - Use `amenities.privatePool` and `amenities.privateGarden` for HOUSE
   - Use project facilities for CONDO
3. Add clear validation rules
4. Update forms to show/hide fields based on category

**Migration Steps:**
1. Add migration to move existing `petFriendly`/`furnished` data to amenities JSON
2. Update API validation
3. Update create/edit forms
4. Update PropertyCard display logic
5. Test thoroughly

---

## 🎯 IMMEDIATE ACTION ITEMS

### **Quick Wins (Do Now):**

1. **Update Create Listing Form**
   - Hide `petFriendly` and `furnished` for LAND category
   - Hide `petFriendly` and `furnished` for INVESTMENT category
   - Show them only for HOUSE and CONDO

2. **Update PropertyCard Component**
   - Don't display `petFriendly`/`furnished` badges for LAND
   - Don't display bedroom/bathroom for LAND
   - Add category-specific display logic

3. **Add API Validation**
   - Reject `petFriendly`/`furnished` for LAND in POST/PUT
   - Reject `bedrooms`/`bathrooms` for LAND
   - Add clear error messages

### **Medium Term (This Week):**

1. **Standardize Amenities Usage**
   - Document what goes in `amenities` JSON for each category
   - Create TypeScript types for amenities structure
   - Add validation for amenities JSON

2. **Update Constants**
   - Clearly separate HOUSE_UNIT_FEATURES from PROJECT_FACILITIES
   - Remove duplicate fields (privatePool vs pool)

### **Long Term (Future):**

1. **Consider Schema Restructure**
   - Evaluate if category-specific tables make sense
   - Plan migration strategy
   - Test performance impact

---

## 📊 FIELD USAGE MATRIX

| Field | HOUSE | CONDO | LAND | INVESTMENT | Notes |
|-------|-------|-------|------|------------|-------|
| `bedrooms` | ✅ | ✅ | ❌ | ⚠️ | Some investments have rooms |
| `bathrooms` | ✅ | ✅ | ❌ | ⚠️ | Some investments have bathrooms |
| `size` | ✅ | ✅ | ✅ | ✅ | Universal |
| `petFriendly` | ✅ | ✅ | ❌ | ❌ | **ISSUE: Should not be global** |
| `furnished` | ✅ | ✅ | ❌ | ❌ | **ISSUE: Should not be global** |
| `parking` | ✅ | ✅ | ❌ | ✅ | Number of spaces |
| `garden` | ✅ | ❌ | ❌ | ⚠️ | Private garden for house |
| `pool` | ✅ | ❌ | ❌ | ⚠️ | Private pool for house |
| `floors` | ✅ | ❌ | ❌ | ✅ | Different meaning |
| `floor` | ❌ | ✅ | ❌ | ❌ | Which floor unit is on |
| `houseType` | ✅ | ❌ | ❌ | ❌ | Category-specific |
| `investmentType` | ❌ | ❌ | ❌ | ✅ | Category-specific |
| `landZoneColor` | ❌ | ❌ | ✅ | ❌ | Category-specific |
| `isStudio` | ❌ | ✅ | ❌ | ❌ | Condo-specific |
| `projectName` | ✅ | ✅ | ❌ | ⚠️ | Optional for house, required for condo |

**Legend:**
- ✅ = Should be used
- ❌ = Should NOT be used
- ⚠️ = Conditional/depends on subtype

---

## 🔧 PROPOSED CHANGES

### **1. Update Create Form Validation**

```typescript
// src/app/[locale]/agent/create/page.tsx
const validateForm = () => {
  const errors: string[] = [];
  
  // Category-specific validation
  if (formData.category === 'LAND') {
    if (formData.bedrooms || formData.bathrooms) {
      errors.push('Land cannot have bedrooms or bathrooms');
    }
    if (formData.petFriendly || formData.furnished) {
      errors.push('Pet-friendly and furnished options not applicable to land');
    }
  }
  
  if (formData.category === 'HOUSE' || formData.category === 'CONDO') {
    // These fields ARE required
    if (!formData.bedrooms && !formData.isStudio) {
      errors.push('Bedrooms required (or mark as Studio)');
    }
  }
  
  return errors;
};
```

### **2. Update PropertyCard Display**

```typescript
// src/components/PropertyCard.tsx
const shouldShowBedBath = () => {
  return property.category === 'HOUSE' || property.category === 'CONDO';
};

const shouldShowPetFriendly = () => {
  return (property.category === 'HOUSE' || property.category === 'CONDO') 
    && property.petFriendly;
};
```

### **3. Update API Validation**

```typescript
// src/app/api/properties/route.ts
const validateCategoryFields = (body: any) => {
  if (body.category === 'LAND') {
    const invalidFields = ['bedrooms', 'bathrooms', 'petFriendly', 'furnished', 'floors'];
    for (const field of invalidFields) {
      if (body[field]) {
        throw new Error(`${field} is not applicable to LAND category`);
      }
    }
  }
  
  if (body.category === 'INVESTMENT') {
    const invalidFields = ['petFriendly', 'furnished'];
    for (const field of invalidFields) {
      if (body[field]) {
        throw new Error(`${field} is not applicable to INVESTMENT category`);
      }
    }
  }
};
```

---

## 📝 SUMMARY

**Main Issues:**
1. ❌ `petFriendly` and `furnished` are global but only make sense for HOUSE/CONDO
2. ❌ Duplicate fields: `pool`/`privatePool`, `garden`/`privateGarden`
3. ❌ No validation preventing inappropriate field usage
4. ❌ PropertyCard shows irrelevant fields for some categories

**Recommended Immediate Fix:**
1. Add form-level hiding of inappropriate fields
2. Add API validation to reject inappropriate fields
3. Update PropertyCard to conditionally display fields
4. Document field usage in code comments

**Long-term Solution:**
Consider restructuring schema with category-specific tables for better type safety and clarity.

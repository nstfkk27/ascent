# Bulk Import Guide

## Overview

The bulk import system allows you to import projects, facilities, and property units from CSV files. This is ideal for migrating data from other systems or adding multiple listings at once.

## Key Features

### 1. **Optional Project Association**
- Properties can be imported **with or without** a project
- Standalone properties (villas, land plots, etc.) can be imported without a project
- You can add or change the project association later through:
  - The property edit page in the UI
  - The `/api/properties/update-project` API endpoint

### 2. **Category-Specific Templates**
Different property categories have different relevant fields:

- **Condo Units**: bedrooms, bathrooms, floor, project (usually required)
- **House/Villa**: bedrooms, bathrooms, houseType, floors, pool, garden (project optional)
- **Land**: landZoneColor, size (project optional)
- **Business/Investment**: investmentType, monthlyRevenue, numberOfStaff, equipmentIncluded (project optional)

## CSV Templates

### Projects Template
**Required fields:**
- `project_name` - Unique project name
- `type` - CONDO, HOUSE, LAND, or INVESTMENT
- `address` - Full address
- `city` - City name
- `latitude` - Decimal latitude
- `longitude` - Decimal longitude

**Optional fields:**
- `project_name_th` - Thai name
- `developer` - Developer name
- `completion_year` - Year (e.g., 2024)
- `description` - Project description
- `total_units` - Number of units
- `total_buildings` - Number of buildings
- `total_floors` - Number of floors
- `project_image_url` - Main project image URL

### Facilities Template
**Required fields:**
- `project_name` - Must match an existing project
- `facility_name` - Name of facility (e.g., "Swimming Pool")

**Optional fields:**
- `facility_image_url` - Facility image URL

### Units Templates (Category-Specific)

#### Condo Units
**Required fields:**
- `unit_title` - Property title
- `description` - Property description
- `size` - Size in square meters (integer)
- `listing_type` - SALE, RENT, or BOTH
- `status` - AVAILABLE, SOLD, RENTED, etc.

**Recommended fields:**
- `project_name` - Project name (usually required for condos)
- `price` - Sale price
- `rent_price` - Monthly rent price
- `bedrooms` - Number of bedrooms (0 for studio)
- `bathrooms` - Number of bathrooms
- `floor` - Floor number

**Optional fields:**
- `pet_friendly` - TRUE or FALSE
- `furnished` - TRUE or FALSE
- `parking` - Number of parking spaces
- `agent_commission_rate` - Commission % (e.g., 3.0)
- `commission_amount` - Fixed commission amount
- `images` - Comma-separated image URLs
- `area` - Sub-area name
- `latitude`, `longitude` - Coordinates
- `owner_contact` - Owner contact info

#### House/Villa Units
**Required fields:**
- Same as Condo Units

**Additional fields:**
- `house_type` - DETACHED, SEMI_DETACHED, TOWNHOUSE, VILLA
- `floors` - Number of floors in the house
- `pool` - TRUE or FALSE (private pool)
- `garden` - TRUE or FALSE (private garden)

**Note:** `project_name` is **optional** for standalone villas

#### Land Units
**Required fields:**
- `unit_title`, `description`, `size`, `listing_type`, `status`
- `price` - Sale price

**Important fields:**
- `land_zone_color` - YELLOW, GREEN, PURPLE, etc.

**Note:** `project_name` is **optional** for land plots

#### Business/Investment Units
**Required fields:**
- `unit_title`, `description`, `size`, `listing_type`, `status`
- `price` - Sale price

**Important fields:**
- `investment_type` - HOTEL, RESTAURANT, BAR, SHOP, etc.
- `equipment_included` - NONE, PARTIAL, FULL
- `number_of_staff` - Number of staff
- `monthly_revenue` - Monthly revenue amount
- `license` - TRUE or FALSE
- `conference_room` - TRUE or FALSE

**Note:** `project_name` is **optional** for businesses

## Import Process

1. **Download Templates**
   - Go to `/agent/import`
   - Download the appropriate CSV template(s)

2. **Fill in Data**
   - Use Excel, Google Sheets, or any CSV editor
   - Follow the field requirements for your category
   - For standalone properties, leave `project_name` empty

3. **Upload & Import**
   - Upload your CSV file(s)
   - Click "Start Import"
   - Review the results

4. **Handle Errors**
   - If a project is not found, the unit will be created as standalone
   - Check the error messages for any validation issues

## Updating Properties Later

### Adding a Project to Standalone Properties

**Via API:**
```bash
POST /api/properties/update-project
{
  "propertyIds": ["prop-id-1", "prop-id-2"],
  "projectName": "The Riviera Jomtien"
}
```

**Via UI:**
- Edit the property in the agent dashboard
- Select the project from the dropdown
- Save changes

### Removing Project Association

Send `projectName: null` or empty string to remove the project association.

## Field Formats

- **Size**: Integer (square meters)
- **Prices**: Decimal numbers (e.g., 3500000, 25000.50)
- **Boolean**: TRUE or FALSE (case-insensitive)
- **Images**: Comma-separated URLs (e.g., "url1.jpg,url2.jpg,url3.jpg")
- **Coordinates**: Decimal degrees (e.g., 12.8965432, 100.8876543)

## Tips

1. **Start with Projects**: Import projects first, then facilities and units
2. **Batch by Category**: Use category-specific templates for cleaner data
3. **Standalone First**: Import standalone properties without projects, add projects later if needed
4. **Test Small**: Test with a few rows first before importing large datasets
5. **Image URLs**: Ensure all image URLs are publicly accessible
6. **Validation**: The system will auto-detect category from fields if not specified

## Auto-Detection

The system can auto-detect the property category:
- If `house_type` is present → HOUSE
- If `investment_type` is present → INVESTMENT
- If `land_zone_color` is present → LAND
- Otherwise → CONDO (default)

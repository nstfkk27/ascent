export const PROPERTY_CATEGORIES = {
  HOUSE: 'House',
  CONDO: 'Condo',
  LAND: 'Land',
  INVESTMENT: 'Investment',
} as const;

export const PROPERTY_SUBTYPES = {
  // House Types
  SINGLE_HOUSE: 'Single House',
  POOL_VILLA: 'Pool Villa',
  TOWNHOUSE: 'Townhouse',
  SHOPHOUSE: 'Shophouse',
  
  // Condo Types
  CONDO: 'Condo', // Added explicit subtype for Condo

  // Investment Types
  HOTEL: 'Hotel',
  CLUB_BAR: 'Club/Bar',
  MASSAGE: 'Massage Shop',
  RESTAURANT: 'Restaurant',
  WELLNESS: 'Wellness/Spa',
  COMMERCIAL_BUILDING: 'Commercial Building',
  
  // Land Types (Now a primary category, but keeping subtype for compatibility if needed)
  LAND: 'Land',
} as const;

export const CATEGORY_SUBTYPES = {
  HOUSE: ['SINGLE_HOUSE', 'POOL_VILLA', 'TOWNHOUSE', 'SHOPHOUSE'],
  CONDO: ['CONDO'], 
  LAND: ['LAND'],
  INVESTMENT: ['HOTEL', 'CLUB_BAR', 'MASSAGE', 'RESTAURANT', 'WELLNESS', 'COMMERCIAL_BUILDING'],
} as const;

export const LISTING_TYPES = {
  SALE: 'For Sale',
  RENT: 'For Rent',
  BOTH: 'Sale & Rent',
} as const;

export const PROPERTY_CONDITIONS = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  NEED_RENOVATION: 'Need Renovation',
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'Available',
  PENDING: 'Pending',
  SOLD: 'Sold',
  RENTED: 'Rented',
} as const;

export const EQUIPMENT_LEVELS = {
  FULLY: 'Fully Equipped',
  PARTIAL: 'Partially Equipped',
  JUST_STRUCTURE: 'Structure Only',
} as const;

// Helper arrays for features
const HOUSE_ALL_IDS = [
  'bedrooms', 'bathrooms', 'size', 'floors', 'parking', 'furnished', 'petFriendly', 'garden', 'pool',
  'westernKitchen', 'thaiKitchen', 'maidsRoom', 'storage', 'laundryRoom', 'walkInCloset', 'bathtub',
  'wifi', 'gym', 'sauna', 'communalPool', 'security', 'library', 'coworking', 'playground'
];

const CONDO_ALL_IDS = [
  'bedrooms', 'bathrooms', 'size', 'floor', 'projectName', 'furnished', 'petFriendly',
  'seaView', 'cityView', 'poolView', 'gardenView',
  'wifi', 'gym', 'sauna', 'communalPool', 'security', 'library', 'coworking'
];

// Features by subtype (Columns & Logic)
export const SUBTYPE_FEATURES = {
  // HOUSE
  SINGLE_HOUSE: [...HOUSE_ALL_IDS, 'projectName'],
  POOL_VILLA: [...HOUSE_ALL_IDS, 'pool', 'projectName'], // Pool Villa has private pool
  TOWNHOUSE: [...HOUSE_ALL_IDS, 'projectName'],
  SHOPHOUSE: [...HOUSE_ALL_IDS, 'projectName'],
  
  // CONDO
  CONDO: [...CONDO_ALL_IDS],
  
  // INVESTMENT
  HOTEL: ['bedrooms', 'bathrooms', 'size', 'floors', 'openForYears', 'numberOfStaff', 'equipmentIncluded', 'conferenceRoom', 'pool', 'elevator', 'wifi', 'cctv'],
  COMMERCIAL_BUILDING: ['bedrooms', 'bathrooms', 'size', 'floors', 'elevator', 'cctv'],
  LAND: ['size', 'landZoneColor'],
  CLUB_BAR: ['size', 'openForYears', 'numberOfStaff', 'equipmentIncluded', 'wifi', 'cctv'],
  RESTAURANT: ['size', 'openForYears', 'numberOfStaff', 'equipmentIncluded', 'wifi', 'cctv'],
  WELLNESS: ['size', 'openForYears', 'numberOfStaff', 'equipmentIncluded', 'wifi', 'cctv'],
  MASSAGE: ['size', 'openForYears', 'numberOfStaff', 'equipmentIncluded', 'wifi', 'cctv'],
} as const;

// ============================================
// UNIT FEATURES (stored on Property.unitFeatures)
// These are specific to the individual unit/listing
// ============================================

// --- HOUSE UNIT FEATURES ---
export const HOUSE_UNIT_FEATURES = [
  { id: 'westernKitchen', label: 'Western Kitchen' },
  { id: 'thaiKitchen', label: 'Thai Kitchen' },
  { id: 'maidsRoom', label: "Maid's Room" },
  { id: 'storage', label: 'Storage Room' },
  { id: 'laundryRoom', label: 'Laundry Room' },
  { id: 'walkInCloset', label: 'Walk-in Closet' },
  { id: 'bathtub', label: 'Bathtub' },
  { id: 'privatePool', label: 'Private Pool' },
  { id: 'privateGarden', label: 'Private Garden' },
] as const;

// --- CONDO UNIT FEATURES ---
export const CONDO_UNIT_FEATURES = [
  { id: 'seaView', label: 'Sea View' },
  { id: 'cityView', label: 'City View' },
  { id: 'poolView', label: 'Pool View' },
  { id: 'gardenView', label: 'Garden View' },
  { id: 'bathtub', label: 'Bathtub' },
  { id: 'walkInCloset', label: 'Walk-in Closet' },
  { id: 'balcony', label: 'Balcony' },
  { id: 'washer', label: 'Washing Machine' },
] as const;

// ============================================
// PROJECT FACILITIES (stored on Project.facilities)
// These are shared amenities for the entire building/village
// Inherited by all units in the project - DO NOT re-enter per listing
// ============================================

export const PROJECT_FACILITIES = [
  { id: 'swimmingPool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Gym / Fitness' },
  { id: 'sauna', label: 'Sauna' },
  { id: 'security', label: '24/7 Security' },
  { id: 'parking', label: 'Parking' },
  { id: 'library', label: 'Library' },
  { id: 'coworking', label: 'Co-working Space' },
  { id: 'playground', label: 'Kids Playground' },
  { id: 'garden', label: 'Garden' },
  { id: 'clubhouse', label: 'Clubhouse' },
  { id: 'wifi', label: 'Common Area Wifi' },
  { id: 'elevator', label: 'Elevator' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'keycard', label: 'Keycard Access' },
] as const;

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
export const HOUSE_AMENITIES = HOUSE_UNIT_FEATURES;
export const HOUSE_FACILITIES = PROJECT_FACILITIES;
export const CONDO_VIEWS = CONDO_UNIT_FEATURES.filter(f => f.id.includes('View'));
export const CONDO_FACILITIES = PROJECT_FACILITIES;
export const INVESTMENT_AMENITIES = [
  { id: 'elevator', label: 'Elevator' },
] as const;

// Helper to get all unit features for search
export const ALL_UNIT_FEATURES = [
  ...HOUSE_UNIT_FEATURES,
  ...CONDO_UNIT_FEATURES,
] as const;

// Helper to get all amenities for search (legacy)
export const ALL_AMENITIES = [
  ...HOUSE_UNIT_FEATURES,
  ...CONDO_UNIT_FEATURES,
  ...PROJECT_FACILITIES,
];

export const YEARS_OPERATIONAL_RANGES = [
  { value: '0-1', label: '0 - 1 Year' },
  { value: '1-3', label: '1 - 3 Years' },
  { value: '3-5', label: '3 - 5 Years' },
  { value: '5-10', label: '5 - 10 Years' },
  { value: '10+', label: '10+ Years' },
] as const;

export const STAFF_COUNT_RANGES = [
  { value: '1-5', label: '1 - 5 Staff' },
  { value: '5-10', label: '5 - 10 Staff' },
  { value: '10-20', label: '10 - 20 Staff' },
  { value: '20+', label: '20+ Staff' },
] as const;

export const PATTAYA_AREAS = [
  'Jomtien',
  'Central Pattaya',
  'Wongamat',
  'Pratumnak',
  'Naklua',
  'Thepprasit',
  'Khao Talo',
  'Khao Noi',
  'Bang Saray',
  'Sattahip',
  'Najomtien',
  'Siam Country',
  'Huay Yai',
  'Nongprue',
  'Tungklom-Talman',
  'Mabprachan',
  'etc.'
] as const;


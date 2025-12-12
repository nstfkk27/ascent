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

// --- HOUSE CONSTANTS ---
export const HOUSE_AMENITIES = [
  { id: 'westernKitchen', label: 'Western Kitchen' },
  { id: 'thaiKitchen', label: 'Thai Kitchen' },
  { id: 'maidsRoom', label: "Maid's Room" },
  { id: 'storage', label: 'Storage Room' },
  { id: 'laundryRoom', label: 'Laundry Room' },
  { id: 'walkInCloset', label: 'Walk-in Closet' },
  { id: 'bathtub', label: 'Bathtub' },
] as const;

export const HOUSE_FACILITIES = [
  { id: 'wifi', label: 'Wifi' },
  { id: 'gym', label: 'Gym / Fitness' },
  { id: 'sauna', label: 'Sauna' },
  { id: 'communalPool', label: 'Pool (Communal)' },
  { id: 'security', label: '24/7 Security' },
  { id: 'library', label: 'Library' },
  { id: 'coworking', label: 'Co-working Space' },
  { id: 'playground', label: 'Kids Playground' },
] as const;

// --- CONDO CONSTANTS ---
export const CONDO_VIEWS = [
  { id: 'seaView', label: 'Sea View' },
  { id: 'cityView', label: 'City View' },
  { id: 'poolView', label: 'Pool View' },
  { id: 'gardenView', label: 'Garden View' },
] as const;

export const CONDO_FACILITIES = [
  { id: 'wifi', label: 'Wifi' },
  { id: 'gym', label: 'Gym / Fitness' },
  { id: 'sauna', label: 'Sauna' },
  { id: 'communalPool', label: 'Pool (Communal)' },
  { id: 'security', label: '24/7 Security' },
  { id: 'library', label: 'Library' },
  { id: 'coworking', label: 'Co-working Space' },
] as const;

// --- INVESTMENT CONSTANTS ---
// These are mostly columns, but some are amenities (JSON)
export const INVESTMENT_AMENITIES = [
  { id: 'elevator', label: 'Elevator' }, // Hotel, Commercial
] as const;

// Helper to get all amenities for search
export const ALL_AMENITIES = [
  ...HOUSE_AMENITIES,
  ...HOUSE_FACILITIES,
  ...CONDO_VIEWS,
  ...CONDO_FACILITIES,
  ...INVESTMENT_AMENITIES
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


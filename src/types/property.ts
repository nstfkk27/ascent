export type PropertyCategory = 'HOUSE' | 'CONDO' | 'INVESTMENT';

export type HouseType = 'SINGLE_HOUSE' | 'POOL_VILLA' | 'TOWNHOUSE' | 'SHOPHOUSE';

export type InvestmentType = 'HOTEL' | 'CLUB_BAR' | 'MASSAGE' | 'RESTAURANT' | 'WELLNESS';

export type EquipmentLevel = 'FULLY' | 'PARTIAL' | 'JUST_STRUCTURE';

export type ListingType = 'SALE' | 'RENT';

export type PropertyStatus = 'AVAILABLE' | 'PENDING' | 'SOLD' | 'RENTED';

export interface Property {
  id: string;
  referenceId: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  area?: string | null;
  state: string;
  zipCode: string;
  
  // Category and Type
  category: PropertyCategory;
  
  // House-specific
  houseType?: HouseType | null;
  
  // Condo-specific
  projectName?: string | null;
  
  // Investment-specific
  investmentType?: InvestmentType | null;
  openForYears?: number | null; // How long the business has been operating
  equipmentIncluded?: EquipmentLevel | null;
  numberOfStaff?: number | null;
  monthlyRevenue?: number | null;
  license?: boolean | null;
  conferenceRoom?: boolean | null;
  
  // Commission Info
  commissionRate?: number | null;
  commissionAmount?: number | null;
  coAgentCommissionRate?: number | null;
  
  // Common features (House & Condo)
  bedrooms?: number | null;
  bathrooms?: number | null;
  size: number; // in square meters
  petFriendly?: boolean | null;
  parking?: number | null;
  furnished?: boolean | null;
  
  // House-specific features
  garden?: boolean | null;
  pool?: boolean | null;
  floors?: number | null;
  
  // Condo-specific features
  floor?: number | null; // Floor level
  
  // Condo Amenities
  amenities?: {
    swimmingPool?: boolean;
    gym?: boolean;
    security24h?: boolean;
    parking?: boolean;
    garden?: boolean;
    playground?: boolean;
    coWorkingSpace?: boolean;
    sauna?: boolean;
    library?: boolean;
    [key: string]: any; // Allow other dynamic amenities
  } | null;
  
  // Property & Area Highlights
  highlights?: string[];
  
  status: PropertyStatus;
  listingType: ListingType;
  images: string[];
  featured: boolean;
  
  // Agent
  agentId?: string | null;
  
  // Location coordinates
  latitude?: number | null;
  longitude?: number | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  createdAt: Date;
}

import { z } from 'zod';
import {
  PropertyCategory,
  ListingType,
  PropertyStatus,
  HouseType,
  InvestmentType,
  LandZoneColor,
  EquipmentLevel,
  ContactMethod,
  VerificationSource,
  UserRole,
} from '@prisma/client';

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

export const propertyBaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().min(3, 'Zip code is required'),
  category: z.nativeEnum(PropertyCategory),
  size: z.number().positive('Size must be positive'),
  listingType: z.nativeEnum(ListingType).default('SALE'),
  status: z.nativeEnum(PropertyStatus).default('AVAILABLE'),
  
  price: z.number().positive().optional().nullable(),
  rentPrice: z.number().positive().optional().nullable(),
  
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  isStudio: z.boolean().optional().nullable(),
  
  petFriendly: z.boolean().optional().nullable(),
  parking: z.number().int().min(0).optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  garden: z.boolean().optional().nullable(),
  pool: z.boolean().optional().nullable(),
  floors: z.number().int().min(0).optional().nullable(),
  
  projectName: z.string().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  area: z.string().optional().nullable(),
  
  houseType: z.nativeEnum(HouseType).optional().nullable(),
  floor: z.number().int().optional().nullable(),
  
  investmentType: z.nativeEnum(InvestmentType).optional().nullable(),
  openForYears: z.number().int().min(0).optional().nullable(),
  equipmentIncluded: z.nativeEnum(EquipmentLevel).optional().nullable(),
  numberOfStaff: z.number().int().min(0).optional().nullable(),
  monthlyRevenue: z.number().positive().optional().nullable(),
  license: z.boolean().optional().nullable(),
  conferenceRoom: z.boolean().optional().nullable(),
  
  landZoneColor: z.nativeEnum(LandZoneColor).optional().nullable(),
  
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  
  images: z.array(z.string().url()).default([]),
  featured: z.boolean().default(false),
  
  amenities: z.any().optional().nullable(),
  
  ownerContactDetails: z.string().optional().nullable(),
  ownerContactMethod: z.nativeEnum(ContactMethod).optional().nullable(),
  verificationSource: z.nativeEnum(VerificationSource).optional().nullable(),
  
  commissionRate: z.number().min(0).max(100).optional().nullable(),
  commissionAmount: z.number().positive().optional().nullable(),
  agentCommissionRate: z.number().min(0).max(100).optional().nullable(),
  coAgentCommissionRate: z.number().min(0).max(100).optional().nullable(),
  
  rentedUntil: z.string().datetime().optional().nullable(),
  availableFrom: z.string().datetime().optional().nullable(),
});

export const propertyCreateSchema = propertyBaseSchema
  .refine(
    (data) => {
      if (data.listingType === 'SALE' || data.listingType === 'BOTH') {
        return data.price != null && data.price > 0;
      }
      return true;
    },
    {
      message: 'Sale price is required when listing type is SALE or BOTH',
      path: ['price'],
    }
  )
  .refine(
    (data) => {
      if (data.listingType === 'RENT' || data.listingType === 'BOTH') {
        return data.rentPrice != null && data.rentPrice > 0;
      }
      return true;
    },
    {
      message: 'Rent price is required when listing type is RENT or BOTH',
      path: ['rentPrice'],
    }
  );

export const propertyUpdateSchema = propertyBaseSchema.partial();

export const propertyQuerySchema = z.object({
  category: z.nativeEnum(PropertyCategory).optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  bedrooms: z.string().optional(),
  minSize: z.string().optional(),
  maxSize: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const agentProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
  lineId: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  languages: z.array(z.string()).default([]),
  role: z.nativeEnum(UserRole).default('AGENT'),
  companyName: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const agentUpdateSchema = agentProfileSchema.partial();

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const dealSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientPhone: z.string().regex(phoneRegex, 'Invalid phone number').optional().nullable(),
  notes: z.string().optional().nullable(),
  propertyId: z.string().uuid('Invalid property ID'),
  amount: z.number().positive().optional().nullable(),
  dealType: z.enum(['SALE', 'RENT']).default('SALE'),
  stage: z.enum(['LEAD', 'VIEWING', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional().nullable(),
  
  leaseStartDate: z.string().datetime().optional().nullable(),
  leaseEndDate: z.string().datetime().optional().nullable(),
  monthlyRent: z.number().positive().optional().nullable(),
  depositAmount: z.number().positive().optional().nullable(),
  nextPaymentDue: z.string().datetime().optional().nullable(),
});

export const dealUpdateSchema = dealSchema.partial().omit({ propertyId: true });

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
});

export function validatePagination(params: URLSearchParams) {
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '50');
  
  return paginationSchema.parse({ page, limit });
}

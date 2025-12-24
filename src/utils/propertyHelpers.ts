import { prisma } from '@/lib/prisma';

/**
 * Generate a unique random 6-digit reference ID in format ASC-XXXXXX
 * Range: ASC-100000 to ASC-999999
 */
export async function generateReferenceId(): Promise<string> {
  let referenceId: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    // Generate random 6-digit number (100000-999999)
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    referenceId = `ASC-${randomNum}`;
    
    // Check if exists in database
    const existing = await prisma.property.findUnique({
      where: { referenceId },
      select: { id: true }
    });
    
    exists = !!existing;
    attempts++;
  }

  if (exists) {
    throw new Error('Failed to generate unique reference ID after multiple attempts');
  }

  return referenceId!;
}

/**
 * Generate a URL-friendly slug from property title
 * Format: lowercase, hyphens, alphanumeric only
 * Max length: 60 characters
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and special chars with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 60);
}

/**
 * Generate a unique slug for a property
 * If slug exists, append number (e.g., luxury-villa-2)
 */
export async function generateUniqueSlug(title: string, propertyId?: string): Promise<string> {
  const baseSlug = generateSlugFromTitle(title);
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const existing = await prisma.property.findUnique({
      where: { slug },
      select: { id: true }
    });
    
    // If no existing property, or it's the same property being updated
    if (!existing || (propertyId && existing.id === propertyId)) {
      exists = false;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  return slug;
}

/**
 * Extract property ID from a compound slug
 * Format: "luxury-villa-jomtien-a1b2c3d4" -> "a1b2c3d4"
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part looks like a UUID fragment (8+ alphanumeric chars)
  if (lastPart && lastPart.length >= 8 && /^[a-z0-9]+$/i.test(lastPart)) {
    return lastPart;
  }
  
  return null;
}

/**
 * Create a compound slug for URLs
 * Format: "{slug}-{uuid-fragment}"
 * Example: "luxury-villa-jomtien-a1b2c3d4"
 */
export function createCompoundSlug(slug: string, uuid: string): string {
  // Remove hyphens from UUID and take first 8 characters for URL
  const uuidFragment = uuid.replace(/-/g, '').substring(0, 8);
  return `${slug}-${uuidFragment}`;
}

import { Metadata } from 'next';
import { Property } from '@/types/property';

/**
 * Generate optimized metadata for property detail pages
 */
export function generatePropertyMetadata(property: Property): Metadata {
  const urlSlug = property.slug 
    ? `${property.slug}-${property.id.replace(/-/g, '').substring(0, 8)}`
    : property.id;

  // Build descriptive title
  const titleParts = [
    property.bedrooms && `${property.bedrooms} Bed`,
    property.category,
    property.listingType === 'SALE' ? 'for Sale' : 'for Rent',
    'in',
    property.area || property.city,
  ].filter(Boolean);
  
  const title = `${titleParts.join(' ')} - ฿${Number(property.price).toLocaleString()} | Estate Ascent`;

  // Build rich description (max 160 chars for SEO)
  const descParts = [
    `${property.category} for ${property.listingType.toLowerCase()}`,
    property.area ? `in ${property.area}, ${property.city}` : `in ${property.city}`,
    property.bedrooms && `${property.bedrooms} bed`,
    property.bathrooms && `${property.bathrooms} bath`,
    property.size && `${property.size}sqm`,
    `Price: ฿${Number(property.price).toLocaleString()}`,
  ].filter(Boolean);

  const shortDesc = descParts.join(', ') + '.';
  
  // Add snippet of description if available
  const fullDescription = property.description 
    ? `${shortDesc} ${property.description.slice(0, 100)}...`
    : shortDesc;

  return {
    title,
    description: fullDescription.slice(0, 160),
    
    // Open Graph (Facebook, LinkedIn)
    openGraph: {
      title: property.title,
      description: fullDescription.slice(0, 200),
      url: `https://estateascent.com/properties/${urlSlug}`,
      siteName: 'Estate Ascent',
      images: property.images && property.images.length > 0 
        ? property.images.slice(0, 4).map(img => ({
            url: img,
            width: 1200,
            height: 630,
            alt: property.title,
          }))
        : [],
      locale: 'en_US',
      type: 'website',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: fullDescription.slice(0, 200),
      images: property.images && property.images.length > 0 ? [property.images[0]] : [],
    },
    
    // Additional meta tags
    keywords: [
      property.category.toLowerCase(),
      property.listingType.toLowerCase(),
      property.city.toLowerCase(),
      property.area?.toLowerCase(),
      'pattaya',
      'thailand',
      'real estate',
      'property',
      property.bedrooms && `${property.bedrooms} bedroom`,
      property.furnished && 'furnished',
      property.petFriendly && 'pet friendly',
      property.pool && 'pool',
    ].filter(Boolean).join(', '),
    
    // Canonical URL
    alternates: {
      canonical: `https://estateascent.com/properties/${urlSlug}`,
    },
    
    // Robots
    robots: {
      index: property.status === 'AVAILABLE',
      follow: true,
      googleBot: {
        index: property.status === 'AVAILABLE',
        follow: true,
      },
    },
  };
}

/**
 * Generate metadata for property listing page
 */
export function generatePropertiesListMetadata(filters?: {
  category?: string;
  city?: string;
  listingType?: string;
}): Metadata {
  const titleParts = ['Properties'];
  const descParts = ['Browse'];
  
  if (filters?.category) {
    titleParts.unshift(`${filters.category}s`);
    descParts.push(`${filters.category.toLowerCase()}s`);
  } else {
    descParts.push('properties');
  }
  
  if (filters?.listingType) {
    const type = filters.listingType === 'SALE' ? 'for Sale' : 'for Rent';
    titleParts.push(type);
    descParts.push(type.toLowerCase());
  }
  
  if (filters?.city) {
    titleParts.push(`in ${filters.city}`);
    descParts.push(`in ${filters.city}`);
  } else {
    titleParts.push('in Pattaya');
    descParts.push('in Pattaya, Thailand');
  }
  
  titleParts.push('| Estate Ascent');
  
  return {
    title: titleParts.join(' '),
    description: `${descParts.join(' ')}. Find condos, houses, land, and investment opportunities. Leading real estate agency in Pattaya.`,
    openGraph: {
      title: titleParts.slice(0, -1).join(' '),
      description: `${descParts.join(' ')}. Find your perfect property in Thailand.`,
      url: 'https://estateascent.com/properties',
      siteName: 'Estate Ascent',
      type: 'website',
    },
    alternates: {
      canonical: 'https://estateascent.com/properties',
    },
  };
}

/**
 * Generate metadata for search/map page
 */
export function generateSearchMetadata(): Metadata {
  return {
    title: 'Search Properties on Map | Estate Ascent',
    description: 'Interactive map search for properties in Pattaya. Find condos, houses, land, and investment opportunities. Filter by price, location, and amenities.',
    openGraph: {
      title: 'Search Properties on Map',
      description: 'Find your perfect property in Pattaya with our interactive map search.',
      url: 'https://estateascent.com/search',
      siteName: 'Estate Ascent',
      type: 'website',
    },
    alternates: {
      canonical: 'https://estateascent.com/search',
    },
  };
}

/**
 * Generate metadata for homepage
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: 'Estate Ascent - Real Estate in Pattaya, Thailand | Condos, Houses, Land',
    description: 'Leading real estate agency in Pattaya, Thailand. Find condos, houses, land, and investment properties for sale or rent. Expert agents, best prices, verified listings.',
    keywords: 'pattaya real estate, pattaya property, condos pattaya, houses pattaya, land for sale pattaya, jomtien property, pratumnak real estate, thailand property',
    openGraph: {
      title: 'Estate Ascent - Real Estate in Pattaya, Thailand',
      description: 'Find your perfect property in Pattaya. Condos, houses, land, and investment opportunities.',
      url: 'https://estateascent.com',
      siteName: 'Estate Ascent',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Estate Ascent - Real Estate in Pattaya',
      description: 'Find your perfect property in Pattaya, Thailand.',
    },
    alternates: {
      canonical: 'https://estateascent.com',
    },
  };
}

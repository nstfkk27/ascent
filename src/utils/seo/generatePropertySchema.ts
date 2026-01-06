import { Property } from '@/types/property';

/**
 * Generate Schema.org structured data for a property listing
 * This helps search engines understand and display property information
 */
export function generatePropertySchema(property: Property, baseUrl: string = 'https://estateascent.com') {
  const urlSlug = property.slug 
    ? `${property.slug}-${property.id.replace(/-/g, '').substring(0, 8)}`
    : property.id;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || `${property.category} for ${property.listingType} in ${property.city}`,
    url: `${baseUrl}/properties/${urlSlug}`,
    
    // Images
    image: property.images && property.images.length > 0 ? property.images : undefined,
    
    // Address
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address || '',
      addressLocality: property.area || property.city,
      addressRegion: property.state || 'Chonburi',
      addressCountry: 'TH',
    },
    
    // Geo coordinates (if available)
    ...(property.latitude && property.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: Number(property.latitude),
        longitude: Number(property.longitude),
      },
    }),
    
    // Offer details
    offers: {
      '@type': 'Offer',
      price: Number(property.price),
      priceCurrency: 'THB',
      availability: property.status === 'AVAILABLE' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    },
    
    // Property details
    ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
    ...(property.bathrooms && { numberOfBathroomsTotal: property.bathrooms }),
    
    // Floor size
    ...(property.size && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: Number(property.size),
        unitCode: 'MTK', // Square meters
      },
    }),
    
    // Additional properties
    additionalProperty: [
      property.category && {
        '@type': 'PropertyValue',
        name: 'Property Type',
        value: property.category,
      },
      property.listingType && {
        '@type': 'PropertyValue',
        name: 'Listing Type',
        value: property.listingType,
      },
      property.floor && {
        '@type': 'PropertyValue',
        name: 'Floor Level',
        value: property.floor,
      },
      property.furnished !== undefined && {
        '@type': 'PropertyValue',
        name: 'Furnished',
        value: property.furnished ? 'Yes' : 'No',
      },
      property.petFriendly !== undefined && {
        '@type': 'PropertyValue',
        name: 'Pet Friendly',
        value: property.petFriendly ? 'Yes' : 'No',
      },
    ].filter(Boolean),
  };

  return schema;
}

/**
 * Generate BreadcrumbList schema for property pages
 */
export function generateBreadcrumbSchema(property: Property, baseUrl: string = 'https://estateascent.com') {
  const urlSlug = property.slug 
    ? `${property.slug}-${property.id.replace(/-/g, '').substring(0, 8)}`
    : property.id;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: `${baseUrl}/properties`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.category,
        item: `${baseUrl}/properties?category=${property.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.title,
        item: `${baseUrl}/properties/${urlSlug}`,
      },
    ],
  };
}

/**
 * Generate Organization schema for the company
 */
export function generateOrganizationSchema(baseUrl: string = 'https://estateascent.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Estate Ascent',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Leading real estate agency in Pattaya, Thailand. Find your perfect property - condos, houses, land, and investment opportunities.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pattaya',
      addressRegion: 'Chonburi',
      addressCountry: 'TH',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Pattaya',
      },
      {
        '@type': 'City',
        name: 'Jomtien',
      },
      {
        '@type': 'City',
        name: 'Pratumnak',
      },
    ],
  };
}

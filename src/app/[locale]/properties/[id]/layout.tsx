import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { generatePropertyMetadata } from '@/utils/seo/generateMetadata';
import { generatePropertySchema, generateBreadcrumbSchema } from '@/utils/seo/generatePropertySchema';
import StructuredData from '@/components/seo/StructuredData';
import { extractIdFromSlug } from '@/utils/propertyHelpers';

type Props = {
  params: { id: string; locale: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Extract UUID from slug
    const uuidFragment = extractIdFromSlug(params.id);
    const propertyId = uuidFragment || params.id;

    let property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        rentPrice: true,
        category: true,
        listingType: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        floor: true,
        city: true,
        area: true,
        state: true,
        address: true,
        latitude: true,
        longitude: true,
        images: true,
        furnished: true,
        petFriendly: true,
      },
    });

    // If not found and looks like a UUID fragment, try startsWith search
    if (!property && propertyId.length >= 8 && propertyId.length <= 12 && /^[a-z0-9]+$/i.test(propertyId)) {
      const properties = await prisma.property.findMany({
        where: {
          id: { startsWith: propertyId },
        },
        take: 1,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          rentPrice: true,
          category: true,
          listingType: true,
          status: true,
          bedrooms: true,
          bathrooms: true,
          size: true,
          floor: true,
          city: true,
          area: true,
          state: true,
          address: true,
          latitude: true,
          longitude: true,
          images: true,
          furnished: true,
          petFriendly: true,
        },
      });
      property = properties[0] || null;
    }

    if (!property) {
      return {
        title: 'Property Not Found | Estate Ascent',
        description: 'The property you are looking for does not exist.',
      };
    }

    // Convert Decimal to number for metadata generation
    const propertyData = {
      ...property,
      price: property.price ? Number(property.price) : 0,
      rentPrice: property.rentPrice ? Number(property.rentPrice) : null,
      size: property.size ? Number(property.size) : null,
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null,
    };

    return generatePropertyMetadata(propertyData as any);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Property Details | Estate Ascent',
      description: 'View property details on Estate Ascent.',
    };
  }
}

export default async function PropertyLayout({ params, children }: Props) {
  let structuredData = null;

  try {
    // Extract UUID from slug
    const uuidFragment = extractIdFromSlug(params.id);
    const propertyId = uuidFragment || params.id;

    let property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        price: true,
        rentPrice: true,
        category: true,
        listingType: true,
        status: true,
        bedrooms: true,
        bathrooms: true,
        size: true,
        floor: true,
        city: true,
        area: true,
        state: true,
        address: true,
        latitude: true,
        longitude: true,
        images: true,
        furnished: true,
        petFriendly: true,
      },
    });

    // If not found and looks like a UUID fragment, try startsWith search
    if (!property && propertyId.length >= 8 && propertyId.length <= 12 && /^[a-z0-9]+$/i.test(propertyId)) {
      const properties = await prisma.property.findMany({
        where: {
          id: { startsWith: propertyId },
        },
        take: 1,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          price: true,
          rentPrice: true,
          category: true,
          listingType: true,
          status: true,
          bedrooms: true,
          bathrooms: true,
          size: true,
          floor: true,
          city: true,
          area: true,
          state: true,
          address: true,
          latitude: true,
          longitude: true,
          images: true,
          furnished: true,
          petFriendly: true,
        },
      });
      property = properties[0] || null;
    }

    if (property) {
      // Convert Decimal to number for schema generation
      const propertyData = {
        ...property,
        price: property.price ? Number(property.price) : 0,
        rentPrice: property.rentPrice ? Number(property.rentPrice) : null,
        size: property.size ? Number(property.size) : null,
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
      };

      // Generate structured data
      const propertySchema = generatePropertySchema(propertyData as any);
      const breadcrumbSchema = generateBreadcrumbSchema(propertyData as any);

      structuredData = [propertySchema, breadcrumbSchema];
    }
  } catch (error) {
    console.error('Error generating structured data:', error);
  }

  return (
    <>
      {structuredData && (
        <head>
          <StructuredData data={structuredData} />
        </head>
      )}
      {children}
    </>
  );
}

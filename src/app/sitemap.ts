import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://estateascent.com';

  try {
    // Fetch all available properties
    const properties = await prisma.property.findMany({
      where: { status: 'AVAILABLE' },
      select: { 
        id: true, 
        slug: true, 
        updatedAt: true,
        category: true,
        city: true,
      },
      take: 5000, // Limit to avoid timeout
    });

    // Generate property URLs
    const propertyUrls: MetadataRoute.Sitemap = properties.map((property) => {
      const urlSlug = property.slug 
        ? `${property.slug}-${property.id.replace(/-/g, '').substring(0, 8)}`
        : property.id;
      
      return {
        url: `${baseUrl}/properties/${urlSlug}`,
        lastModified: property.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    });

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/properties`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ];

    return [...staticPages, ...propertyUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }
}

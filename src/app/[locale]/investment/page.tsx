import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import InvestmentClient from './InvestmentClient';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Business for Sale Pattaya | Hotels, Bars, Restaurants from ฿2M | Estate Ascent',
  description: 'Find profitable businesses for sale in Pattaya from ฿2M. Hotels, restaurants, bars with proven revenue. Turnkey operations ready to operate. View 15+ listings with ROI 8-20%.',
  keywords: 'business for sale pattaya, restaurant for sale pattaya, bar for sale pattaya, hotel for sale thailand, massage business for sale, commercial property pattaya, turnkey business thailand, pattaya business investment',
  openGraph: {
    title: 'Business for Sale in Pattaya - From ฿2M | Turnkey Operations',
    description: 'Discover profitable businesses for sale in Pattaya. Hotels, restaurants, bars, and massage spas with proven revenue streams from ฿2M. 8-20% ROI.',
    type: 'website',
  },
};

async function getInvestmentProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        category: 'INVESTMENT',
        status: 'AVAILABLE',
      },
      include: {
        project: {
          select: {
            name: true,
            city: true,
            lat: true,
            lng: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    // Get counts by investment type
    const typeCounts = await prisma.property.groupBy({
      by: ['investmentType'],
      where: {
        category: 'INVESTMENT',
        status: 'AVAILABLE',
      },
      _count: true,
    });

    return {
      properties: properties.map(p => ({
        id: p.id,
        slug: p.slug,
        referenceId: p.referenceId,
        title: p.title,
        price: p.price ? Number(p.price) : 0,
        rentPrice: p.rentPrice ? Number(p.rentPrice) : null,
        address: p.address,
        city: p.city,
        state: p.state,
        area: p.area,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        size: p.size ? Number(p.size) : 0,
        floor: p.floor,
        images: p.images,
        category: p.category,
        houseType: p.houseType,
        investmentType: p.investmentType,
        listingType: p.listingType,
        projectName: p.project?.name || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        lastVerifiedAt: p.lastVerifiedAt?.toISOString() || null,
        dealQuality: p.dealQuality,
        overallScore: p.overallScore,
        locationScore: p.locationScore,
        valueScore: p.valueScore,
        investmentScore: p.investmentScore,
        estimatedRentalYield: p.estimatedRentalYield ? Number(p.estimatedRentalYield) : null,
        keyFeatures: p.keyFeatures,
        agentCommissionRate: p.agentCommissionRate ? Number(p.agentCommissionRate) : null,
        commissionAmount: p.commissionAmount ? Number(p.commissionAmount) : null,
        viewCount: p.viewCount,
        enquiryCount: p.enquiryCount,
      })),
      typeCounts: typeCounts.reduce((acc, item) => {
        if (item.investmentType) {
          acc[item.investmentType] = item._count;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('Error fetching investment properties:', error);
    return { properties: [], typeCounts: {} };
  }
}

export default async function InvestmentPage() {
  const { properties, typeCounts } = await getInvestmentProperties();

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Businesses for Sale in Pattaya",
    "description": "Profitable businesses for sale in Pattaya including hotels, restaurants, bars, massage spas, and commercial properties",
    "numberOfItems": properties.length,
    "itemListElement": properties.slice(0, 10).map((property, index) => ({
      "@type": "Product",
      "position": index + 1,
      "name": property.title,
      "description": `${property.investmentType} business for sale in ${property.area || property.city}`,
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "THB",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Estate Ascent"
        }
      },
      "category": property.investmentType,
      "location": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": property.city,
          "addressRegion": property.state,
          "addressCountry": "TH"
        }
      }
    }))
  };

  return (
    <>
      <Script
        id="business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <InvestmentClient properties={properties} typeCounts={typeCounts} />
    </>
  );
}

import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import InvestmentClient from './InvestmentClient';

export const metadata: Metadata = {
  title: 'Business for Sale in Pattaya | Hotels, Restaurants, Bars Takeover | Estate Ascent',
  description: 'Find profitable businesses for sale in Pattaya. Hotels, restaurants, bars, massage spas, and wellness centers ready for takeover. Established businesses with existing customers and revenue.',
  keywords: 'business for sale Pattaya, restaurant takeover, bar for sale, hotel business Thailand, massage spa for sale, ready business Pattaya, turn-key business, business acquisition',
  openGraph: {
    title: 'Business for Sale in Pattaya - Ready to Operate',
    description: 'Discover profitable business opportunities in Pattaya. Hotels, restaurants, bars, and more with proven revenue streams.',
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

  return <InvestmentClient properties={properties} typeCounts={typeCounts} />;
}

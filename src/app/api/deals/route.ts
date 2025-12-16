import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';


// GET /api/deals - Get all deals
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const stage = searchParams.get('stage');
    const dealType = searchParams.get('dealType');

    // Build where clause
    const where: any = {};
    if (stage) where.stage = stage;
    if (dealType) where.dealType = dealType;

    const [total, deals] = await prisma.$transaction([
      prisma.deal.count({ where }),
      prisma.deal.findMany({
        where,
        include: {
          property: {
            select: {
              title: true,
              price: true,
              address: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      })
    ]);

    const serializedDeals = deals.map(deal => ({
      ...deal,
      amount: deal.amount ? deal.amount.toNumber() : null,
      monthlyRent: (deal as any).monthlyRent ? (deal as any).monthlyRent.toNumber() : null,
      depositAmount: (deal as any).depositAmount ? (deal as any).depositAmount.toNumber() : null,
      property: deal.property ? {
        ...deal.property,
        price: deal.property.price ? deal.property.price.toNumber() : null
      } : null
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: serializedDeals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const deal = await prisma.deal.create({
      data: {
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        notes: body.notes,
        stage: body.stage || 'NEW_LEAD',
        amount: body.amount,
        propertyId: body.propertyId,
      },
    });
    
    return NextResponse.json(
      { success: true, data: deal },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

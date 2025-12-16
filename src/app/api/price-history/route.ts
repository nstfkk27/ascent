import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch price history for a property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const history = await prisma.priceHistory.findMany({
      where: { propertyId },
      orderBy: { changedAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true, 
      data: history.map(h => ({
        ...h,
        price: h.price ? Number(h.price) : null,
        rentPrice: h.rentPrice ? Number(h.rentPrice) : null,
      }))
    });
  } catch (error) {
    console.error('Failed to fetch price history:', error);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
}

// POST - Record a price change (called automatically when property price changes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, price, rentPrice, changeType, changedBy, notes } = body;

    if (!propertyId || !changeType) {
      return NextResponse.json({ error: 'propertyId and changeType are required' }, { status: 400 });
    }

    const record = await prisma.priceHistory.create({
      data: {
        propertyId,
        price: price ? parseFloat(price) : null,
        rentPrice: rentPrice ? parseFloat(rentPrice) : null,
        changeType,
        changedBy,
        notes,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        ...record,
        price: record.price ? Number(record.price) : null,
        rentPrice: record.rentPrice ? Number(record.rentPrice) : null,
      }
    });
  } catch (error) {
    console.error('Failed to record price history:', error);
    return NextResponse.json({ error: 'Failed to record price history' }, { status: 500 });
  }
}

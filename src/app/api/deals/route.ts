import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/deals - Get all deals
export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        property: {
          select: {
            title: true,
            price: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, data: deals });
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

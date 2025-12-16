import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// PATCH /api/deals/[id] - Update a deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dealId = params.id;

    // 1. Update the Deal
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        stage: body.stage,
        amount: body.amount,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        notes: body.notes,
        dealType: body.dealType,
        leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : undefined,
        leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : undefined,
        monthlyRent: body.monthlyRent,
        depositAmount: body.depositAmount,
        nextPaymentDue: body.nextPaymentDue ? new Date(body.nextPaymentDue) : undefined,
      },
      include: {
        property: true
      }
    });

    // 2. If stage changed, update Property Freshness
    // We assume if the API is called, something significant happened.
    // But specifically for stage changes (moving cards), it's a strong signal.
    if (body.stage) {
      await prisma.property.update({
        where: { id: updatedDeal.propertyId },
        data: {
          lastVerifiedAt: new Date(),
          verificationSource: 'SYSTEM' // Marking as verified by system activity
        }
      });
      console.log(`Updated freshness for property ${updatedDeal.propertyId} due to deal activity.`);
    }

    return NextResponse.json({ success: true, data: updatedDeal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

// DELETE /api/deals/[id] - Delete a deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.deal.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}

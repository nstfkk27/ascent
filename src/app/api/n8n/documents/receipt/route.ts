/**
 * n8n API: Receipt Management
 * Store receipt documents and metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateN8nApiKey } from '@/lib/n8n/auth';

export async function POST(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    const {
      dealId,
      url,
      receiptNumber,
      amount,
      paidDate,
      paymentMethod,
      metadata = {},
    } = data;

    if (!dealId || !url || !receiptNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId, url, receiptNumber, amount' },
        { status: 400 }
      );
    }

    // Update deal with receipt information
    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        metadata: {
          ...(typeof data.metadata === 'object' ? data.metadata : {}),
          receipt: {
            url,
            receiptNumber,
            amount,
            paidDate,
            paymentMethod,
            generatedAt: new Date().toISOString(),
          }
        }
      }
    });

    console.log('Receipt generated:', {
      dealId,
      receiptNumber,
      amount,
      url,
    });

    return NextResponse.json({
      success: true,
      receipt: {
        id: `RCP-${receiptNumber}`,
        dealId,
        receiptNumber,
        amount,
        url,
        paidDate,
        paymentMethod,
        createdAt: new Date().toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('n8n receipt creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt record' },
      { status: 500 }
    );
  }
}

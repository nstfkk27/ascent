/**
 * n8n API: Invoice Management
 * Store invoice documents and metadata
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
      invoiceNumber,
      amount,
      dueDate,
      clientName,
      clientEmail,
      metadata = {},
    } = data;

    if (!dealId || !url || !invoiceNumber || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: dealId, url, invoiceNumber, amount' },
        { status: 400 }
      );
    }

    // Store invoice record
    // Note: You may need to create a Document model in your schema
    // For now, we'll store in Deal metadata or create a simple log
    
    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        metadata: {
          ...(typeof data.metadata === 'object' ? data.metadata : {}),
          invoice: {
            url,
            invoiceNumber,
            amount,
            dueDate,
            generatedAt: new Date().toISOString(),
          }
        }
      }
    });

    // Log the invoice generation
    console.log('Invoice generated:', {
      dealId,
      invoiceNumber,
      amount,
      url,
    });

    return NextResponse.json({
      success: true,
      invoice: {
        id: `INV-${invoiceNumber}`,
        dealId,
        invoiceNumber,
        amount,
        url,
        dueDate,
        createdAt: new Date().toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('n8n invoice creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice record' },
      { status: 500 }
    );
  }
}

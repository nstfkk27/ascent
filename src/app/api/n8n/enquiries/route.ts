/**
 * n8n API: Enquiry Management
 * Create and manage enquiries from automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateN8nApiKey } from '@/lib/n8n/auth';
import { validateContactData } from '@/lib/security/input-validation';

export async function POST(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const data = await request.json();

    // Validate input
    const validation = validateContactData({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message || 'Lead from automation',
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Create enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || 'Lead from automation',
        propertyId: data.propertyId || null,
        agentId: data.agentId || null,
        status: 'NEW',
        channel: data.channel || 'AUTOMATION',
        source: data.source || 'n8n',
        metadata: data.metadata || {},
      },
    });

    // Generate enquiry number
    const enquiryNumber = `ENQ-${enquiry.createdAt.getFullYear()}-${String(enquiry.id).padStart(6, '0')}`;

    return NextResponse.json({
      success: true,
      enquiry: {
        id: enquiry.id,
        enquiryNumber,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        status: enquiry.status,
        createdAt: enquiry.createdAt.toISOString(),
      },
    }, { status: 201 });

  } catch (error) {
    console.error('n8n enquiry creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create enquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Authenticate
  const authError = validateN8nApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Enquiry ID required' },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            referenceId: true,
            title: true,
            price: true,
            images: true,
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    if (!enquiry) {
      return NextResponse.json(
        { error: 'Enquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      enquiry: {
        id: enquiry.id,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone,
        message: enquiry.message,
        status: enquiry.status,
        channel: enquiry.channel,
        property: enquiry.property ? {
          id: enquiry.property.id,
          listingCode: enquiry.property.referenceId,
          title: enquiry.property.title,
          price: enquiry.property.price?.toNumber(),
          images: enquiry.property.images,
        } : null,
        agent: enquiry.agent,
        createdAt: enquiry.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('n8n enquiry fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enquiry' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sanitizePropertyData } from '@/lib/property-utils';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

// GET /api/properties/[id] - Get single property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check User Role for Data Visibility
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let role = null;
    if (user && user.email) {
      const agent = await prisma.agentProfile.findFirst({
          where: { email: user.email }
      });
      if (agent) role = agent.role;
    }

    // Filter sensitive data based on role
    const isInternal = role === 'SUPER_ADMIN' || role === 'PLATFORM_AGENT';
    const isAgent = role === 'AGENT';

    if (!isInternal) {
      // Hide full commission details for non-internal users
      (property as any).commissionRate = null;
      (property as any).commissionAmount = null;

      // Hide co-agent rate for public users (non-agents)
      if (!isAgent) {
        (property as any).coAgentCommissionRate = null;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check User Role for Permissions
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let isInternal = false;
    if (user && user.email) {
      const agent = await prisma.agentProfile.findFirst({
          where: { email: user.email }
      });
      if (agent && (agent.role === 'SUPER_ADMIN' || agent.role === 'PLATFORM_AGENT')) {
          isInternal = true;
      }
    }

    let updateData = { ...body };
    
    // Remove restricted fields if not internal
    if (!isInternal) {
        delete updateData.commissionRate;
        delete updateData.commissionAmount;
        delete updateData.coAgentCommissionRate;
    }

    if (body.category) {
      updateData = sanitizePropertyData(updateData);
    }

    const property = await prisma.property.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.property.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

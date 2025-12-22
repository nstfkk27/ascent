import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizePropertyData } from '@/lib/property-utils';
import { createClient } from '@/utils/supabase/server';
import { generateUniqueSlug } from '@/utils/propertyHelpers';


// GET /api/properties/[id] - Get single property by ID or UUID fragment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to find by full UUID first
    let property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
    });
    
    // If not found and id looks like a UUID fragment (8 chars), search by UUID prefix
    if (!property && params.id.length === 8 && /^[a-z0-9]+$/i.test(params.id)) {
      const properties = await prisma.property.findMany({
        where: {
          id: {
            startsWith: params.id,
          },
        },
        take: 1,
      });
      property = properties[0] || null;
    }
    
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
      // Hide platform commission details for non-internal users
      (property as any).commissionRate = null;
      (property as any).commissionAmount = null;
      
      // Show agent commission rate to all agents (including external AGENT role)
      // agentCommissionRate remains visible to all authenticated agents

      // Hide co-agent rate for public users (non-agents)
      if (!isAgent) {
        (property as any).coAgentCommissionRate = null;
        (property as any).agentCommissionRate = null; // Also hide for public
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
    let agentId: string | null = null;
    let userRole = 'AGENT';
    
    if (user && user.email) {
      const agent = await prisma.agentProfile.findFirst({
          where: { email: user.email }
      });
      if (agent) {
        agentId = agent.id;
        userRole = agent.role;
        if (agent.role === 'SUPER_ADMIN' || agent.role === 'PLATFORM_AGENT') {
          isInternal = true;
        }
      }
    }

    // Get current property to check ownership and price changes
    const currentProperty = await prisma.property.findUnique({
      where: { id: params.id },
      select: { price: true, rentPrice: true, agentId: true }
    });

    if (!currentProperty) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // AGENT and PLATFORM_AGENT can only edit their own listings
    if ((userRole === 'AGENT' || userRole === 'PLATFORM_AGENT') && currentProperty.agentId !== agentId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own listings' },
        { status: 403 }
      );
    }
    // Only SUPER_ADMIN can edit any listing

    let updateData = { ...body };

    // Backwards compatibility: older clients may send unitFeatures instead of amenities
    if ((updateData as any).unitFeatures && !(updateData as any).amenities) {
      (updateData as any).amenities = (updateData as any).unitFeatures;
    }
    
    // Remove restricted fields if not internal
    if (!isInternal) {
        delete updateData.commissionRate;
        delete updateData.commissionAmount;
        // agentCommissionRate and coAgentCommissionRate can be updated by all agents
    }

    // Remove UI-only fields that are not in the Prisma schema
    delete updateData.subtype;
    delete updateData.selectedAmenities;
    delete (updateData as any).condition;
    delete (updateData as any).unitFeatures;

    // Regenerate slug if title is being updated
    if (body.title) {
      updateData.slug = await generateUniqueSlug(body.title, params.id);
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

    // Track price changes for future analytics
    if (currentProperty) {
      const oldPrice = currentProperty.price ? Number(currentProperty.price) : null;
      const newPrice = body.price ? Number(body.price) : null;
      const oldRent = currentProperty.rentPrice ? Number(currentProperty.rentPrice) : null;
      const newRent = body.rentPrice ? Number(body.rentPrice) : null;

      const priceChanged = oldPrice !== newPrice;
      const rentChanged = oldRent !== newRent;

      if (priceChanged || rentChanged) {
        let changeType = 'CORRECTION';
        if (newPrice !== null && oldPrice !== null) {
          changeType = newPrice > oldPrice ? 'INCREASE' : 'DECREASE';
        } else if (newRent !== null && oldRent !== null) {
          changeType = newRent > oldRent ? 'INCREASE' : 'DECREASE';
        }

        // Record price history (will work after migration)
        try {
          await prisma.priceHistory.create({
            data: {
              propertyId: params.id,
              price: newPrice,
              rentPrice: newRent,
              changeType: changeType as any,
              changedBy: agentId,
            },
          });
        } catch (e) {
          // Silently fail if PriceHistory table doesn't exist yet
          console.log('Price history tracking skipped (table may not exist yet)');
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property (PROTECTED)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Get agent profile and check role
    const agent = await prisma.agentProfile.findFirst({
      where: { email: user.email }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent profile not found' },
        { status: 403 }
      );
    }

    // Get the property to check ownership
    const property = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    // Only SUPER_ADMIN can delete any property
    // AGENT and PLATFORM_AGENT can only delete their own listings
    const isSuperAdmin = agent.role === 'SUPER_ADMIN';
    const isOwner = property.agentId === agent.id;

    if (!isSuperAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own listings' },
        { status: 403 }
      );
    }

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

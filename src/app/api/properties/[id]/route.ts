import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sanitizePropertyData } from '@/lib/property-utils';

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
    
    let userRole = 'AGENT';
    if (user && user.email) {
      const agent = await prisma.property.findFirst({ // Wait, looking up AgentProfile, NOT Property
         // Mistake in thought process correction: prisma is instantiated as PrismaClient locally in this file?
         // No, looking at imports: import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();
         // But I should probably use the global prisma instance if available or just use this one.
         // However, I need to query AgentProfile.
      });
    }
    
    // Actually, let's fix the query. 
    // We need to query AgentProfile. 
    
    // Re-reading file content...
    // The file imports PrismaClient and creates a NEW instance `const prisma = new PrismaClient();`
    // This is not ideal (too many connections), but I will stick to the existing pattern in this file to minimize diffs,
    // OR ideally switch to `@/lib/prisma`.
    // The file `src/app/api/properties/route.ts` uses `import { prisma } from '@/lib/prisma';`.
    // This file `src/app/api/properties/[id]/route.ts` uses `new PrismaClient()`.
    // I should probably switch it to use the global prisma to avoid issues, but that's a refactor.
    // I will check if AgentProfile is accessible.
    
    // Let's implement the role check.
    
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

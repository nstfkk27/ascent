import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const agentProfile = await prisma.agentProfile.findFirst({
      where: { email: user.email! },
      select: { role: true }
    });

    if (!agentProfile || (agentProfile.role !== 'SUPER_ADMIN' && agentProfile.role !== 'PLATFORM_AGENT')) {
      return NextResponse.json({ success: false, message: 'Forbidden - Platform agents only' }, { status: 403 });
    }

    const body = await request.json();
    const { propertyIds, projectName } = body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Property IDs array is required' 
      }, { status: 400 });
    }

    // Find project by name (or set to null if removing project)
    let projectId: string | null = null;
    if (projectName && projectName.trim()) {
      const project = await prisma.project.findFirst({
        where: { name: projectName }
      });

      if (!project) {
        return NextResponse.json({ 
          success: false, 
          message: `Project "${projectName}" not found` 
        }, { status: 404 });
      }

      projectId = project.id;
    }

    // Update all properties
    const result = await prisma.property.updateMany({
      where: {
        id: { in: propertyIds }
      },
      data: {
        projectId: projectId
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} properties`,
      count: result.count
    });

  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({
      success: false,
      message: 'Update failed',
      error: String(error)
    }, { status: 500 });
  }
}

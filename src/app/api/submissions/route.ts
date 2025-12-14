import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.price || !data.contactName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const submission = await prisma.propertySubmission.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        listingType: data.listingType,
        category: data.category,
        
        contactName: data.contactName,
        contactLine: data.contactLine,
        contactPhone: data.contactPhone,
        
        address: data.address,
        city: data.city,
        state: data.state,
        
        commission: data.commission,
        
        images: data.images || [],
        
        status: 'PENDING'
      },
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = await prisma.propertySubmission.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

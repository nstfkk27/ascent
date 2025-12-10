import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const agents = await prisma.agentProfile.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, email, phone, lineId, imageUrl, languages } = body;

    const agent = await prisma.agentProfile.create({
      data: {
        name,
        role,
        email,
        phone,
        lineId,
        imageUrl,
        languages: languages || [],
      },
    });

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ success: false, error: 'Failed to create agent' }, { status: 500 });
  }
}

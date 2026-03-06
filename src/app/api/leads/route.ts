import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nationality, purpose, budget, source, agent, process, remark } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        nationality: nationality || '',
        purpose: purpose || '',
        budget: budget || '',
        source: source || '',
        agent: agent || '',
        process: process || 'ON_SENT_LISTING',
        remark: remark || '',
        firstContact: new Date()
      }
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}

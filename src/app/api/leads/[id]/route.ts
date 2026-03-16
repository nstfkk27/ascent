import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { process, name, nationality, purpose, budget, source, agent, targetDate, remark } = body;

    const updateData: any = {};
    if (process !== undefined) updateData.process = process;
    if (name !== undefined) updateData.name = name;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (budget !== undefined) updateData.budget = budget;
    if (source !== undefined) updateData.source = source;
    if (agent !== undefined) updateData.agent = agent;
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (remark !== undefined) updateData.remark = remark;

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lead.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}

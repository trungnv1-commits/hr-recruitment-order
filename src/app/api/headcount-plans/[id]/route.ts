import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "HR") return NextResponse.json({ error: "Only HR can manage HC plans" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const { department, positionName, plannedHc } = body;
    const plan = await prisma.headcountPlan.update({
      where: { id },
      data: { ...(department && { department }), ...(positionName && { positionName }), ...(plannedHc !== undefined && { plannedHc: parseInt(plannedHc) }) },
      include: { venture: true },
    });
    return NextResponse.json({ plan });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "HR") return NextResponse.json({ error: "Only HR can manage HC plans" }, { status: 403 });
    const { id } = await params;
    const plan = await prisma.headcountPlan.findUnique({ where: { id } });
    if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (plan.usedHc > 0) return NextResponse.json({ error: "Cannot delete plan with used headcount" }, { status: 400 });
    await prisma.headcountPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
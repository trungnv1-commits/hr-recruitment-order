import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const ventureId = searchParams.get("ventureId");
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const summary = searchParams.get("summary");

    const where: Record<string, unknown> = { year };
    if (ventureId) where.ventureId = ventureId;

    const plans = await prisma.headcountPlan.findMany({
      where,
      include: { venture: true },
      orderBy: [{ venture: { name: "asc" } }, { department: "asc" }, { positionName: "asc" }],
    });

    if (summary === "true") {
      const ventureMap: Record<string, { ventureName: string; ventureCode: string; ventureId: string; departments: Record<string, { planned: number; used: number; positions: number }>; totalPlanned: number; totalUsed: number }> = {};

      for (const plan of plans) {
        if (!ventureMap[plan.ventureId]) {
          ventureMap[plan.ventureId] = { ventureName: plan.venture.name, ventureCode: plan.venture.code, ventureId: plan.ventureId, departments: {}, totalPlanned: 0, totalUsed: 0 };
        }
        const v = ventureMap[plan.ventureId];
        v.totalPlanned += plan.plannedHc;
        v.totalUsed += plan.usedHc;
        const dept = plan.department || "Other";
        if (!v.departments[dept]) { v.departments[dept] = { planned: 0, used: 0, positions: 0 }; }
        v.departments[dept].planned += plan.plannedHc;
        v.departments[dept].used += plan.usedHc;
        v.departments[dept].positions += 1;
      }

      const ventures = Object.values(ventureMap);
      const allVentures = await prisma.venture.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json({ year, ventures, allVentures, totalPlanned: plans.reduce((s, p) => s + p.plannedHc, 0), totalUsed: plans.reduce((s, p) => s + p.usedHc, 0), totalPositions: plans.length });
    }

    return NextResponse.json({ plans, year });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "HR") return NextResponse.json({ error: "Only HR can manage HC plans" }, { status: 403 });
    const body = await request.json();
    const { ventureId, year, department, positionName, plannedHc } = body;
    if (!ventureId || !year || !department || !positionName || !plannedHc) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const existing = await prisma.headcountPlan.findFirst({ where: { ventureId, year: parseInt(year), department, positionName } });
    if (existing) return NextResponse.json({ error: "HC plan already exists for this position" }, { status: 409 });
    const plan = await prisma.headcountPlan.create({ data: { ventureId, year: parseInt(year), department, positionName, plannedHc: parseInt(plannedHc), usedHc: 0 }, include: { venture: true } });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
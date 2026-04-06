import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      orderId: null, // Only templates (not linked to any order)
    };

    if (search.trim()) {
      where.positionName = {
        contains: search.trim(),
      };
    }

    const templates = await prisma.jobDescription.findMany({
      where,
      include: {
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { positionName: "asc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["HR"]);

    const body = await request.json();
    const { ventureId, positionName, level, jdContent, candidateProfile } = body;

    // Validate required fields
    if (!ventureId || !ventureId.trim()) {
      return NextResponse.json({ error: "Venture là bắt buộc" }, { status: 400 });
    }
    if (!positionName || !positionName.trim()) {
      return NextResponse.json({ error: "Tên vị trí là bắt buộc" }, { status: 400 });
    }
    if (!jdContent || !jdContent.trim()) {
      return NextResponse.json({ error: "Nội dung JD là bắt buộc" }, { status: 400 });
    }

    // Verify venture exists
    const venture = await prisma.venture.findUnique({ where: { id: ventureId } });
    if (!venture) {
      return NextResponse.json({ error: "Venture không tồn tại" }, { status: 400 });
    }

    const template = await prisma.jobDescription.create({
      data: {
        ventureId,
        positionName: positionName.trim(),
        level: level?.trim() || null,
        jdContent: jdContent.trim(),
        candidateProfile: candidateProfile?.trim() || null,
        orderId: null, // Template - not linked to any order
      },
      include: {
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

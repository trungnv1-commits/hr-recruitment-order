import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const template = await prisma.jobDescription.findUnique({
      where: { id },
      include: {
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "JD template not found" }, { status: 404 });
    }

    if (template.orderId !== null) {
      return NextResponse.json({ error: "This is not a template" }, { status: 400 });
    }

    return NextResponse.json(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    requireRole(user, ["HR"]);
    const { id } = await params;

    const existing = await prisma.jobDescription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "JD template not found" }, { status: 404 });
    }
    if (existing.orderId !== null) {
      return NextResponse.json({ error: "Cannot edit a JD linked to an order" }, { status: 400 });
    }

    const body = await request.json();
    const { ventureId, positionName, level, jdContent, candidateProfile } = body;

    // Validate required fields if provided
    if (positionName !== undefined && (!positionName || !positionName.trim())) {
      return NextResponse.json({ error: "Tên vị trí không được để trống" }, { status: 400 });
    }
    if (jdContent !== undefined && (!jdContent || !jdContent.trim())) {
      return NextResponse.json({ error: "Nội dung JD không được để trống" }, { status: 400 });
    }

    // If ventureId is changing, verify it exists
    if (ventureId && ventureId !== existing.ventureId) {
      const venture = await prisma.venture.findUnique({ where: { id: ventureId } });
      if (!venture) {
        return NextResponse.json({ error: "Venture không tồn tại" }, { status: 400 });
      }
    }

    const template = await prisma.jobDescription.update({
      where: { id },
      data: {
        ...(ventureId && { ventureId }),
        ...(positionName && { positionName: positionName.trim() }),
        ...(level !== undefined && { level: level?.trim() || null }),
        ...(jdContent && { jdContent: jdContent.trim() }),
        ...(candidateProfile !== undefined && { candidateProfile: candidateProfile?.trim() || null }),
      },
      include: {
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    requireRole(user, ["HR"]);
    const { id } = await params;

    const existing = await prisma.jobDescription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "JD template not found" }, { status: 404 });
    }
    if (existing.orderId !== null) {
      return NextResponse.json({ error: "Cannot delete a JD linked to an order" }, { status: 400 });
    }

    await prisma.jobDescription.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

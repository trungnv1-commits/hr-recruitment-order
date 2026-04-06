import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, AuthError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const order = await prisma.recruitmentOrder.findUnique({
      where: { id },
      include: {
        hiringManager: {
          select: { id: true, fullName: true, email: true },
        },
        venture: {
          select: { id: true, name: true, code: true },
        },
        approvalRecords: {
          include: {
            approver: {
              select: { id: true, fullName: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        notifications: {
          orderBy: { sentAt: "desc" },
          take: 20,
        },
        canceller: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Access control
    switch (user.role) {
      case "HIRING_MANAGER":
        if (order.hiringManagerId !== user.userId) {
          throw new AuthError("Forbidden", 403);
        }
        break;
      case "CEO_VENTURE":
        if (order.ventureId !== user.ventureId) {
          throw new AuthError("Forbidden", 403);
        }
        break;
      case "CEO_GROUP":
      case "HR":
        // Can see all
        break;
      default:
        throw new AuthError("Forbidden", 403);
    }

    return NextResponse.json(order);
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
    const { id } = await params;

    const order = await prisma.recruitmentOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Must be the order's hiring manager
    if (order.hiringManagerId !== user.userId) {
      throw new AuthError("Chỉ người tạo mới được chỉnh sửa order", 403);
    }

    // Must be DRAFT or REJECTED
    if (!["DRAFT", "REJECTED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Chỉ có thể chỉnh sửa order ở trạng thái Nháp hoặc Từ chối" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { positionName, level, quantity, recruitmentType, reason, jdAttachmentUrl } = body;

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (positionName !== undefined) updateData.positionName = positionName.trim();
    if (level !== undefined) updateData.level = level;
    if (quantity !== undefined) {
      if (quantity < 1) {
        return NextResponse.json({ error: "Số lượng phải lớn hơn 0" }, { status: 400 });
      }
      updateData.quantity = parseInt(quantity, 10);
    }
    if (recruitmentType !== undefined) {
      if (!["NEW", "REPLACEMENT"].includes(recruitmentType)) {
        return NextResponse.json({ error: "Loại tuyển dụng không hợp lệ" }, { status: 400 });
      }
      updateData.recruitmentType = recruitmentType;
    }
    if (reason !== undefined) updateData.reason = reason.trim();
    if (jdAttachmentUrl !== undefined) updateData.jdAttachmentUrl = jdAttachmentUrl || null;

    // If was REJECTED, reset to DRAFT and delete old approval records
    if (order.status === "REJECTED") {
      updateData.status = "DRAFT";
      updateData.hcCheckResult = null;
      updateData.hcOverReason = null;

      await prisma.approvalRecord.deleteMany({
        where: { orderId: id },
      });
    }

    const updatedOrder = await prisma.recruitmentOrder.update({
      where: { id },
      data: updateData,
      include: {
        hiringManager: {
          select: { id: true, fullName: true, email: true },
        },
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

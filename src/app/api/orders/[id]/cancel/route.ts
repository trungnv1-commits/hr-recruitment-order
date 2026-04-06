import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, AuthError } from "@/lib/api-helpers";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const body = await request.json();
    const reason = body.reason;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Lý do hủy là bắt buộc" },
        { status: 400 }
      );
    }

    const order = await prisma.recruitmentOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Must be the order's hiring manager
    if (order.hiringManagerId !== user.userId) {
      throw new AuthError("Chỉ người tạo mới được hủy order", 403);
    }

    // Order must be in DRAFT, PENDING_HC_CHECK, or PENDING_APPROVAL
    if (!["DRAFT", "PENDING_HC_CHECK", "PENDING_APPROVAL"].includes(order.status)) {
      return NextResponse.json(
        { error: "Chỉ có thể hủy order ở trạng thái Nháp, Đang kiểm HC, hoặc Chờ duyệt" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      await tx.recruitmentOrder.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelledBy: user.userId,
          cancelledReason: reason.trim(),
        },
      });

      // If was PENDING_APPROVAL, cancel all pending approval records
      if (order.status === "PENDING_APPROVAL") {
        await tx.approvalRecord.updateMany({
          where: {
            orderId: id,
            decision: "PENDING",
          },
          data: {
            decision: "CANCELLED",
            decidedAt: new Date(),
          },
        });
      }
    });

    // Create notification for HR users
    const hrUsers = await prisma.user.findMany({
      where: { role: "HR", isActive: true },
    });

    for (const hrUser of hrUsers) {
      await createNotification({
        orderId: id,
        recipientId: hrUser.id,
        notificationType: "ORDER_CANCELLED",
        content: `Order "${order.positionName}" đã bị hủy: ${reason.trim()}`,
      });
    }

    // Return updated order
    const updatedOrder = await prisma.recruitmentOrder.findUnique({
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
        canceller: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

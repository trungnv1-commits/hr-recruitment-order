import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError, AuthError } from "@/lib/api-helpers";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    requireRole(user, ["CEO_VENTURE", "CEO_GROUP"]);
    const { id } = await params;

    const body = await request.json();
    const comment = body.comment;

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Lý do từ chối là bắt buộc" },
        { status: 400 }
      );
    }

    // Find the user's pending approval record for this order
    const approvalRecord = await prisma.approvalRecord.findFirst({
      where: {
        orderId: id,
        approverId: user.userId,
        decision: "PENDING",
      },
    });

    if (!approvalRecord) {
      throw new AuthError("Bạn không có quyền từ chối order này hoặc đã xử lý rồi", 403);
    }

    // Get order info for notification
    const order = await prisma.recruitmentOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Reject-fast: update record, reject order, cancel remaining pending records
    await prisma.$transaction(async (tx) => {
      // Update this approval record to REJECTED
      await tx.approvalRecord.update({
        where: { id: approvalRecord.id },
        data: {
          decision: "REJECTED",
          decidedAt: new Date(),
          comment: comment.trim(),
        },
      });

      // Set order status to REJECTED
      await tx.recruitmentOrder.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      // Cancel all remaining PENDING approval records
      await tx.approvalRecord.updateMany({
        where: {
          orderId: id,
          decision: "PENDING",
          id: { not: approvalRecord.id },
        },
        data: {
          decision: "CANCELLED",
          decidedAt: new Date(),
        },
      });
    });

    // Create rejection notification for hiring manager
    await createNotification({
      orderId: id,
      recipientId: order.hiringManagerId,
      notificationType: "REJECTION_NOTICE",
      content: `Order "${order.positionName}" bị từ chối: ${comment.trim()}`,
    });

    // Return updated order with approval records
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
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

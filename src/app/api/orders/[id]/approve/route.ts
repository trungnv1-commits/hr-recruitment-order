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

    const body = await request.json().catch(() => ({}));
    const comment = body.comment || null;

    // Find the user's pending approval record for this order
    const approvalRecord = await prisma.approvalRecord.findFirst({
      where: {
        orderId: id,
        approverId: user.userId,
        decision: "PENDING",
      },
    });

    if (!approvalRecord) {
      throw new AuthError("Bạn không có quyền duyệt order này hoặc đã xử lý rồi", 403);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update this approval record
      await tx.approvalRecord.update({
        where: { id: approvalRecord.id },
        data: {
          decision: "APPROVED",
          decidedAt: new Date(),
          comment,
        },
      });

      // Check all approval records for this order
      const allRecords = await tx.approvalRecord.findMany({
        where: { orderId: id },
      });

      const allApproved = allRecords.every(
        (r) => r.id === approvalRecord.id ? true : r.decision === "APPROVED"
      );

      if (allApproved) {
        // All approved -> update order status
        const order = await tx.recruitmentOrder.update({
          where: { id },
          data: { status: "APPROVED" },
        });

        // If HC check was not SKIPPED, increment usedHc
        if (order.hcCheckResult && order.hcCheckResult !== "SKIPPED") {
          const plan = await tx.headcountPlan.findFirst({
            where: {
              ventureId: order.ventureId,
              year: order.planYear || new Date().getFullYear(),
              positionName: { contains: order.positionName },
            },
          });

          if (plan) {
            await tx.headcountPlan.update({
              where: { id: plan.id },
              data: { usedHc: plan.usedHc + order.quantity },
            });
          }
        }

        return { fullyApproved: true, order };
      }

      return { fullyApproved: false, order: null };
    });

    // Create notification if fully approved
    if (result.fullyApproved && result.order) {
      await createNotification({
        orderId: id,
        recipientId: result.order.hiringManagerId,
        notificationType: "ORDER_APPROVED",
        content: `Order "${result.order.positionName}" đã được duyệt`,
      });
    }

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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, AuthError } from "@/lib/api-helpers";
import { performHCCheck } from "@/lib/hc-check";
import { createApprovalRecords } from "@/lib/approval-routing";

export async function POST(
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

    // Must be order's hiring manager
    if (order.hiringManagerId !== user.userId) {
      throw new AuthError("Chỉ người tạo mới được gửi duyệt order", 403);
    }

    // Must be DRAFT
    if (order.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Chỉ có thể gửi duyệt order ở trạng thái Nháp" },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Update status to PENDING_HC_CHECK
      await tx.recruitmentOrder.update({
        where: { id },
        data: { status: "PENDING_HC_CHECK" },
      });

      // Step 2: Perform HC Check
      const hcResult = await performHCCheck({
        recruitmentType: order.recruitmentType,
        ventureId: order.ventureId,
        positionName: order.positionName,
        quantity: order.quantity,
        planYear: order.planYear || new Date().getFullYear(),
      });

      // Step 3: Update order with HC check result
      await tx.recruitmentOrder.update({
        where: { id },
        data: {
          hcCheckResult: hcResult.result,
          hcOverReason: hcResult.reason,
        },
      });

      // Step 4: Create approval records (uses main prisma outside tx)
      // We need to update status first, then create approvals
      // Step 5: Update status to PENDING_APPROVAL
      const updatedOrder = await tx.recruitmentOrder.update({
        where: { id },
        data: { status: "PENDING_APPROVAL" },
        include: {
          hiringManager: {
            select: { id: true, fullName: true, email: true },
          },
          venture: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      return { updatedOrder, hcResult };
    });

    // Step 6: Create approval records and notifications (outside transaction since they use separate prisma calls)
    await createApprovalRecords({
      orderId: id,
      ventureId: order.ventureId,
      hcCheckResult: result.hcResult.result,
      positionName: order.positionName,
    });

    // Fetch the complete order with approval records
    const finalOrder = await prisma.recruitmentOrder.findUnique({
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
        },
      },
    });

    return NextResponse.json(finalOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

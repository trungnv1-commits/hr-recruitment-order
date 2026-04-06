import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export interface ApprovalRoutingInput {
  orderId: string;
  ventureId: string;
  hcCheckResult: string;
  positionName: string;
}

export async function createApprovalRecords(input: ApprovalRoutingInput) {
  const records = [];

  // Always create approval for CEO_VENTURE
  const ceoVenture = await prisma.user.findFirst({
    where: {
      role: "CEO_VENTURE",
      ventureId: input.ventureId,
      isActive: true,
    },
  });

  if (ceoVenture) {
    const ventureRecord = await prisma.approvalRecord.create({
      data: {
        orderId: input.orderId,
        approverId: ceoVenture.id,
        approvalLevel: "CEO_VENTURE",
        decision: "PENDING",
      },
    });
    records.push(ventureRecord);

    // Create notification for CEO_VENTURE
    await createNotification({
      orderId: input.orderId,
      recipientId: ceoVenture.id,
      notificationType: "APPROVAL_REQUEST",
      content: `Yêu cầu duyệt order tuyển dụng: ${input.positionName}`,
    });
  }

  // If OVER_HC, also create approval for CEO_GROUP
  if (input.hcCheckResult === "OVER_HC") {
    const ceoGroup = await prisma.user.findFirst({
      where: {
        role: "CEO_GROUP",
        isActive: true,
      },
    });

    if (ceoGroup) {
      const groupRecord = await prisma.approvalRecord.create({
        data: {
          orderId: input.orderId,
          approverId: ceoGroup.id,
          approvalLevel: "CEO_GROUP",
          decision: "PENDING",
        },
      });
      records.push(groupRecord);

      // Create notification for CEO_GROUP
      await createNotification({
        orderId: input.orderId,
        recipientId: ceoGroup.id,
        notificationType: "HC_OVER_ALERT",
        content: `Order vượt HC cần duyệt: ${input.positionName}`,
      });
    }
  }

  return records;
}

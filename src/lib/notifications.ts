import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export interface CreateNotificationInput {
  orderId: string;
  recipientId: string;
  notificationType: "HC_OVER_ALERT" | "APPROVAL_REQUEST" | "REJECTION_NOTICE" | "ORDER_APPROVED" | "ORDER_CANCELLED" | "APPROVAL_REMINDER";
  content: string;
}

export async function createNotification(input: CreateNotificationInput) {
  // 1. Create IN_APP notification (existing behavior)
  const notification = await prisma.notification.create({
    data: {
      orderId: input.orderId,
      recipientId: input.recipientId,
      channel: "IN_APP",
      notificationType: input.notificationType,
      content: input.content,
      isRead: false,
      sentAt: new Date(),
    },
  });

  // 2. Send email notification (fire-and-forget)
  // Lookup order details for email template
  prisma.recruitmentOrder.findUnique({
    where: { id: input.orderId },
    include: {
      hiringManager: { select: { fullName: true } },
      venture: { select: { name: true } },
    },
  }).then((order) => {
    if (!order) return;
    // Also get recipient name
    return prisma.user.findUnique({ where: { id: input.recipientId }, select: { fullName: true } }).then((recipient) => {
      sendNotificationEmail(input.recipientId, input.notificationType, {
        recipientName: recipient?.fullName || "User",
        orderId: input.orderId,
        positionName: order.positionName,
        level: order.level,
        quantity: order.quantity,
        ventureName: order.venture.name,
        recruitmentType: order.recruitmentType,
        hcCheckResult: order.hcCheckResult || undefined,
        reason: order.cancelledReason || undefined,
        comment: input.content,
      });
    });
  }).catch((err) => {
    console.error("[Email] Failed to fetch order for email:", err);
  });

  return notification;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });
}

export async function getPendingApprovalsCount(userId: string): Promise<number> {
  return prisma.approvalRecord.count({
    where: {
      approverId: userId,
      decision: "PENDING",
    },
  });
}
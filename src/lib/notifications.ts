import { prisma } from "@/lib/prisma";

export interface CreateNotificationInput {
  orderId: string;
  recipientId: string;
  notificationType: "HC_OVER_ALERT" | "APPROVAL_REQUEST" | "REJECTION_NOTICE" | "ORDER_APPROVED" | "ORDER_CANCELLED" | "APPROVAL_REMINDER";
  content: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
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

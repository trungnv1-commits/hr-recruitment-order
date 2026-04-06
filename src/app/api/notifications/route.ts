import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { getUnreadCount, getPendingApprovalsCount } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get("countOnly") === "true";

    if (countOnly) {
      const [unreadCount, pendingApprovals] = await Promise.all([
        getUnreadCount(user.userId),
        getPendingApprovalsCount(user.userId),
      ]);

      return NextResponse.json({ unreadCount, pendingApprovals });
    }

    // Full notification list
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: user.userId },
        include: {
          order: {
            select: { id: true, positionName: true, status: true },
          },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { recipientId: user.userId },
      }),
    ]);

    return NextResponse.json({ notifications, total });
  } catch (error) {
    return handleApiError(error);
  }
}

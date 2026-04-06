import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["CEO_VENTURE", "CEO_GROUP"]);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      approverId: user.userId,
    };

    if (status === "PENDING") {
      where.decision = "PENDING";
    } else if (status !== "all") {
      where.decision = status;
    }

    const approvals = await prisma.approvalRecord.findMany({
      where,
      include: {
        order: {
          include: {
            hiringManager: {
              select: { id: true, fullName: true, email: true },
            },
            venture: {
              select: { id: true, name: true, code: true },
            },
          },
        },
        approver: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    return handleApiError(error);
  }
}

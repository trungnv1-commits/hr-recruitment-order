import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const summaryMode = searchParams.get("summary") === "true";
    const statusFilter = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build where clause based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    switch (user.role) {
      case "HIRING_MANAGER":
        where.hiringManagerId = user.userId;
        break;
      case "CEO_VENTURE":
        where.ventureId = user.ventureId;
        break;
      case "CEO_GROUP":
      case "HR":
        // No filter — see all orders
        break;
    }

    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    // Summary mode: return counts by status
    if (summaryMode) {
      const [total, draft, pendingHC, pendingApproval, approved, rejected, cancelled] =
        await Promise.all([
          prisma.recruitmentOrder.count({ where }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "DRAFT" } }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "PENDING_HC_CHECK" } }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "PENDING_APPROVAL" } }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "APPROVED" } }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "REJECTED" } }),
          prisma.recruitmentOrder.count({ where: { ...where, status: "CANCELLED" } }),
        ]);

      // Over HC count
      const overHC = await prisma.recruitmentOrder.count({
        where: { ...where, hcCheckResult: "OVER_HC" },
      });

      // This month count
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = await prisma.recruitmentOrder.count({
        where: {
          ...where,
          createdAt: { gte: startOfMonth },
        },
      });

      // Approved today
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const approvedToday = await prisma.recruitmentOrder.count({
        where: {
          ...where,
          status: "APPROVED",
          updatedAt: { gte: startOfDay },
        },
      });

      return NextResponse.json({
        total,
        DRAFT: draft,
        PENDING_HC_CHECK: pendingHC,
        PENDING_APPROVAL: pendingApproval,
        APPROVED: approved,
        REJECTED: rejected,
        CANCELLED: cancelled,
        overHC,
        thisMonth,
        approvedToday,
      });
    }

    // List mode
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.recruitmentOrder.findMany({
        where,
        include: {
          hiringManager: {
            select: { id: true, fullName: true, email: true },
          },
          venture: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.recruitmentOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    requireRole(user, ["HIRING_MANAGER"]);

    const body = await request.json();
    const { positionName, level, quantity, recruitmentType, reason, jdAttachmentUrl } = body;

    // Validate required fields
    if (!positionName || !positionName.trim()) {
      return NextResponse.json({ error: "Vị trí tuyển dụng là bắt buộc" }, { status: 400 });
    }
    if (!level) {
      return NextResponse.json({ error: "Level là bắt buộc" }, { status: 400 });
    }
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Số lượng phải lớn hơn 0" }, { status: 400 });
    }
    if (!recruitmentType || !["NEW", "REPLACEMENT"].includes(recruitmentType)) {
      return NextResponse.json({ error: "Loại tuyển dụng không hợp lệ" }, { status: 400 });
    }
    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Lý do tuyển dụng là bắt buộc" }, { status: 400 });
    }

    if (!user.ventureId) {
      return NextResponse.json({ error: "User chưa được gán venture" }, { status: 400 });
    }

    const order = await prisma.recruitmentOrder.create({
      data: {
        hiringManagerId: user.userId,
        ventureId: user.ventureId,
        positionName: positionName.trim(),
        level,
        quantity: parseInt(quantity, 10),
        recruitmentType,
        reason: reason.trim(),
        jdAttachmentUrl: jdAttachmentUrl || null,
        status: "DRAFT",
        planYear: new Date().getFullYear(),
      },
      include: {
        hiringManager: {
          select: { id: true, fullName: true, email: true },
        },
        venture: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

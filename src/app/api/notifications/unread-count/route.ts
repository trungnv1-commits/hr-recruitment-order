import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { getUnreadCount } from "@/lib/notifications";

export async function GET() {
  try {
    const user = await requireAuth();
    const count = await getUnreadCount(user.userId);
    return NextResponse.json({ count });
  } catch (error) {
    return handleApiError(error);
  }
}

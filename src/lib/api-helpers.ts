import { NextResponse } from "next/server";
import { getCurrentUser, JWTPayload } from "@/lib/auth";

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Unauthorized", 401);
  return user;
}

export function requireRole(user: JWTPayload, allowedRoles: string[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("API Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

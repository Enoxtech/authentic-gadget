import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifyAdminSessionToken(token);

  if (!isValid) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 }
    );
  }

  return null;
}

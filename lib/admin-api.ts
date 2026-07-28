import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, type AdminRole, type AdminSession, verifyAdminSessionToken } from "@/lib/admin-auth";

export async function getAdminSession(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdmin(request: NextRequest) {
  const session = await getAdminSession(request);

  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  return null;
}

export async function requireAdminRole(request: NextRequest, allowedRoles: AdminRole[]) {
  const session = await getAdminSession(request);

  if (!session) {
    return { error: NextResponse.json({ error: "Admin authentication required" }, { status: 401 }), session: null };
  }

  if (!allowedRoles.includes(session.role)) {
    return { error: NextResponse.json({ error: "You don't have permission to do this" }, { status: 403 }), session };
  }

  return { error: null, session };
}

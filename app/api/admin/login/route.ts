import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_CLIENT_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminPasswordMatches,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      return NextResponse.json(
        { error: "Admin authentication is not configured" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !(await adminPasswordMatches(password))) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });
    response.cookies.set(ADMIN_SESSION_CLIENT_COOKIE, "true", {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

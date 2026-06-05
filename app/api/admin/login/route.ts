import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_CLIENT_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminPasswordMatches,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from "@/lib/admin-auth";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "admin-login", { max: 5, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

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

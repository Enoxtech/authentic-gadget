import { NextRequest, NextResponse } from "next/server";

// Must match the token in /api/admin/login
const FALLBACK_TOKEN = "ag-admin-token-2026";
const ADMIN_TOKEN    = process.env.ADMIN_TOKEN || FALLBACK_TOKEN;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public auth routes and API routes through
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/(auth)") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Protect /admin routes — but allow /admin/login itself through
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("admin_session");
    if (!adminSession || adminSession.value !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = "ag-admin-token-2026";

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

  // Protect /admin routes with hardcoded admin cookie
  if (pathname.startsWith("/admin") || pathname.startsWith("/(admin)")) {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession || adminSession.value !== ADMIN_TOKEN) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("reason", "admin");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // For all other routes, let the page handle its own auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
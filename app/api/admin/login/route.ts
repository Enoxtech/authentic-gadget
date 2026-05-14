import { NextRequest, NextResponse } from "next/server";

// Use ADMIN_PASSWORD env var as the password AND the cookie value
// Fallback default: Admin2026!  (change this immediately after first login)

const FALLBACK_PASSWORD = "Admin2026!";
const FALLBACK_TOKEN   = "ag-admin-token-2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken    = process.env.ADMIN_TOKEN || FALLBACK_TOKEN;

    // Use env var if set, otherwise fall back to default
    const validPassword = adminPassword || FALLBACK_PASSWORD;

    if (!password || password !== validPassword) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", adminToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = "ag-admin-token-2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // HARDCODED — update here and push to change
    const VALID_PASSWORD = "Admin2026!";

    if (!password || password !== VALID_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", ADMIN_TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
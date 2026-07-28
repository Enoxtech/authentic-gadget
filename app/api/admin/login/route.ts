import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_CLIENT_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminPasswordMatches,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminPasswordHash,
} from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";
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

    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let session: { role: "super_admin" | "support" | "product_manager"; adminId: string | null };
    let auditName = "Admin";
    let auditEmail: string | null = null;

    if (email) {
      const supabase = getSupabaseAdminClient();
      const { data: account } = await supabase
        .from("admin_users")
        .select("id, name, email, password_hash, role, active")
        .eq("email", email)
        .maybeSingle();

      if (
        !account ||
        !account.active ||
        !(await verifyAdminPasswordHash(password, account.password_hash))
      ) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }

      session = { role: account.role, adminId: account.id };
      auditName = account.name;
      auditEmail = account.email;

      await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", account.id);
    } else {
      if (!isAdminAuthConfigured()) {
        return NextResponse.json(
          { error: "Admin authentication is not configured" },
          { status: 503 }
        );
      }
      if (!(await adminPasswordMatches(password))) {
        return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
      }
      session = { role: "super_admin", adminId: null };
    }

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(session), {
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

    await logAdminAction(request, session, {
      action: "login",
      entityType: "admin_session",
      adminName: auditName,
      adminEmail: auditEmail,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

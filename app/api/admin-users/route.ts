import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { hashAdminPassword, type AdminRole } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const ROLES: AdminRole[] = ["super_admin", "support", "product_manager"];

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("admin_users")
    .select("id, name, email, role, active, created_at, last_login_at")
    .order("created_at", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const body = (await request.json()) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" && ROLES.includes(body.role as AdminRole) ? (body.role as AdminRole) : "support";

  if (!name || !email || !email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "Name, a valid email, and a password of at least 8 characters are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();
  const passwordHash = await hashAdminPassword(password);

  const { data, error: dbError } = await supabase
    .from("admin_users")
    .insert({ name, email, password_hash: passwordHash, role, active: true })
    .select("id, name, email, role, active, created_at")
    .single();

  if (dbError) {
    const message = dbError.code === "23505" ? "An admin with that email already exists" : dbError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  await logAdminAction(request, session!, {
    action: "create",
    entityType: "admin_user",
    entityId: data.id,
    metadata: { name, email, role },
  });

  return NextResponse.json(data, { status: 201 });
}

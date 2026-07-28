import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { hashAdminPassword, type AdminRole } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const ROLES: AdminRole[] = ["super_admin", "support", "product_manager"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as { role?: unknown; password?: unknown; active?: unknown };

  const updates: Record<string, unknown> = {};

  if (body.role !== undefined) {
    if (typeof body.role !== "string" || !ROLES.includes(body.role as AdminRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if (body.password !== undefined) {
    if (typeof body.password !== "string" || body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    updates.password_hash = await hashAdminPassword(body.password);
  }

  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "Invalid active flag" }, { status: 400 });
    }
    if (session!.adminId === id && body.active === false) {
      return NextResponse.json({ error: "You can't deactivate your own account" }, { status: 400 });
    }
    updates.active = body.active;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }
  updates.updated_at = new Date().toISOString();

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", id)
    .select("id, name, email, role, active, created_at, last_login_at")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  await logAdminAction(request, session!, {
    action: "update",
    entityType: "admin_user",
    entityId: id,
    metadata: { ...body, password: body.password ? "[redacted]" : undefined },
  });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const { id } = await params;

  if (session!.adminId === id) {
    return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error: dbError } = await supabase.from("admin_users").delete().eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  await logAdminAction(request, session!, {
    action: "delete",
    entityType: "admin_user",
    entityId: id,
  });

  return NextResponse.json({ success: true });
}

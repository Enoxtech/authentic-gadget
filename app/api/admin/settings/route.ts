import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { buildSettingsUpdate, getSettings, toAdminView } from "@/lib/settings";
import { logAdminAction } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const row = await getSettings();
  if (!row) return NextResponse.json({ error: "Settings not found" }, { status: 404 });

  return NextResponse.json(toAdminView(row));
}

export async function PATCH(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const body = (await request.json()) as Record<string, unknown>;
  const updates = buildSettingsUpdate(body);

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("settings")
    .update(updates)
    .eq("id", "default")
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAdminAction(request, session!, {
    action: "update",
    entityType: "settings",
    metadata: { fields: Object.keys(body) },
  });

  return NextResponse.json(toAdminView(data));
}

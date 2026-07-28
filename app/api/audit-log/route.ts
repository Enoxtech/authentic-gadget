import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin"]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("audit_log")
    .select("id, admin_name, admin_email, action, entity_type, entity_id, metadata, ip, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

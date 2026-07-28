import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }

  if (!session.adminId) {
    return NextResponse.json({
      id: null,
      name: "Admin",
      email: null,
      role: session.role,
    });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role")
    .eq("id", session.adminId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

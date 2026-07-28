import { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import type { AdminSession } from "@/lib/admin-auth";

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

export async function logAdminAction(
  request: NextRequest,
  session: AdminSession,
  input: {
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown> | null;
    adminName?: string;
    adminEmail?: string | null;
  }
) {
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("audit_log").insert({
      admin_id: session.adminId,
      admin_name: input.adminName || (session.adminId ? null : "Admin"),
      admin_email: input.adminEmail ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? null,
      ip: getClientIp(request),
    });
  } catch (error) {
    console.error("Failed to write audit log entry:", error);
  }
}

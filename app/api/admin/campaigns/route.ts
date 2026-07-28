import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-api";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { logAdminAction } from "@/lib/audit-log";
import { sendEmailCampaign, sendWhatsAppCampaign } from "@/lib/campaign-send";

export async function GET(request: NextRequest) {
  const { error } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const supabase = getSupabaseAdminClient();
  const { data, error: dbError } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdminRole(request, ["super_admin", "product_manager"]);
  if (error) return error;

  const body = (await request.json()) as Record<string, unknown>;
  const type = body.type === "whatsapp" ? "whatsapp" : body.type === "email" ? "email" : null;
  const audience = body.audience === "newsletter_subscribers" ? "newsletter_subscribers" : body.audience === "customers" ? "customers" : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";

  if (!type || !audience || !message) {
    return NextResponse.json({ error: "Type, audience, and message are required" }, { status: 400 });
  }
  if (type === "email" && !subject) {
    return NextResponse.json({ error: "Subject is required for email campaigns" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  let recipients: string[] = [];
  if (audience === "newsletter_subscribers") {
    const { data } = await supabase.from("newsletter_subscribers").select("email").eq("status", "subscribed");
    recipients = (data || []).map((r) => r.email).filter(Boolean);
  } else {
    const column = type === "email" ? "email" : "phone";
    const { data } = await supabase.from("customers").select(column);
    const rows = (data || []) as Array<Record<string, string>>;
    recipients = rows.map((r) => r[column]).filter(Boolean);
  }
  recipients = [...new Set(recipients)].slice(0, 500);

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients found for this audience" }, { status: 400 });
  }

  const result =
    type === "email"
      ? await sendEmailCampaign(recipients, subject, message)
      : await sendWhatsAppCampaign(recipients, message);

  const status = result.sent > 0 ? "sent" : "failed";

  const { data: campaign, error: dbError } = await supabase
    .from("campaigns")
    .insert({
      type,
      audience,
      subject: subject || null,
      message,
      recipient_count: recipients.length,
      sent_count: result.sent,
      failed_count: result.failed,
      status,
    })
    .select("*")
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction(request, session!, {
    action: "create",
    entityType: "campaign",
    entityId: campaign.id,
    metadata: { type, audience, recipients: recipients.length, sent: result.sent, failed: result.failed },
  });

  if (result.sent === 0) {
    return NextResponse.json(
      { ...campaign, error: `Channel not configured or all sends failed (${result.failed} failed)` },
      { status: 502 }
    );
  }

  return NextResponse.json(campaign, { status: 201 });
}

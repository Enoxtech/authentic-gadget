import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { escapeHtml, getEmailSettings, isEmail, sendMail, SUPPORT_FROM, wrapEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "contact", { max: 5, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many support requests. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = readString(body.name, 120);
    const email = readString(body.email, 160).toLowerCase();
    const phone = readString(body.phone, 40);
    const subject = readString(body.subject, 160) || "General support";
    const message = readString(body.message, 3000);

    if (!name || !EMAIL_PATTERN.test(email) || message.length < 10) {
      return NextResponse.json(
        { error: "Name, valid email, and a detailed message are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("support_messages").insert({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "new",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settings = await getEmailSettings();
    const adminEmail = settings?.admin_email || process.env.ADMIN_EMAIL || process.env.STORE_ADMIN_EMAIL || "";
    if (adminEmail && isEmail(adminEmail)) {
      const html = wrapEmail(
        "New Support Message",
        `
        <p style="margin:0 0 16px;font-size:15px;color:#172033;">A new support message was submitted from the website.</p>
        <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
          <tr><td style="padding:5px 0;font-size:13px;color:#8a7a5d;width:92px;">From</td><td style="padding:5px 0;font-size:14px;color:#172033;font-weight:700;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:5px 0;font-size:13px;color:#8a7a5d;">Email</td><td style="padding:5px 0;font-size:14px;color:#172033;"><a href="mailto:${escapeHtml(email)}" style="color:#071836;">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:5px 0;font-size:13px;color:#8a7a5d;">Phone</td><td style="padding:5px 0;font-size:14px;color:#172033;">${escapeHtml(phone)}</td></tr>` : ""}
          <tr><td style="padding:5px 0;font-size:13px;color:#8a7a5d;">Subject</td><td style="padding:5px 0;font-size:14px;color:#172033;font-weight:700;">${escapeHtml(subject)}</td></tr>
        </table>
        <p style="margin:0;padding:15px 16px;border-radius:14px;background:#fbf7ed;font-size:14px;color:#172033;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
        `
      );

      sendMail(adminEmail, `Support message: ${subject} - ${name}`, html, SUPPORT_FROM, settings).catch(() => {});
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact support error:", error);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}

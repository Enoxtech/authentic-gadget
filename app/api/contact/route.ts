import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

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

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Contact support error:", error);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}

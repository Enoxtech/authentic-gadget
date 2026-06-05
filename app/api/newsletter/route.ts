import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(request, "newsletter", { max: 5, windowMs: 60_000 });
    if (limit.limited) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please wait and try again." },
        { status: 429, headers: rateLimitHeaders(limit) }
      );
    }

    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          status: "subscribed",
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json({ error: "Unable to save subscription" }, { status: 500 });
  }
}

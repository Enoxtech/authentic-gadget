import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  // Handle OAuth (Google) callback
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle email link confirmation (from signInWithOtp)
  if (token && type === "email") {
    const supabase = await createClient();
    // With email link OTP, the token IS the session code — exchange it
    const { error } = await supabase.auth.exchangeCodeForSession(token);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
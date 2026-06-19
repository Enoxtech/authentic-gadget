import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const placementParam = request.nextUrl.searchParams.get("placement");
  const placement = placementParam === "promo" ? "promo" : "hero";

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/banners?select=*&enabled=eq.true&placement=eq.${placement}&order=sort_order.asc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch banners" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Banners API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

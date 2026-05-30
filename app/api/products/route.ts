import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/products?select=*&is_active=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Products API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
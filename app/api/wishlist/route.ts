import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return null;

  const supabase = getSupabaseAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("wishlists")
      .select("product_id, created_at, products(id, name, slug, price, images, brand, category)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || [])
      .map((row) => row.products)
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Unable to load wishlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = (await request.json()) as { productId?: unknown };
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("wishlists").upsert(
      {
        user_id: user.id,
        product_id: productId,
      },
      { onConflict: "user_id,product_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: product } = await supabase
      .from("products")
      .select("id, name, slug, price, images, brand, category")
      .eq("id", productId)
      .single();

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Unable to save wishlist item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const productId = request.nextUrl.searchParams.get("productId")?.trim();
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Unable to remove wishlist item" }, { status: 500 });
  }
}

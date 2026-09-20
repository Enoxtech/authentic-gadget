import { NextResponse } from "next/server";
import { getPublishedSalesPage } from "@/lib/sales-pages";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedSalesPage(slug);
  if (!page) return NextResponse.json({ error: "Sales page not found" }, { status: 404 });
  return NextResponse.json({ page });
}

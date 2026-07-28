import { NextResponse } from "next/server";
import { getSettings, toPublicView } from "@/lib/settings";

export async function GET() {
  const row = await getSettings();
  if (!row) return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  return NextResponse.json(toPublicView(row));
}

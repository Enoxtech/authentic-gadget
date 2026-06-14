import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "authentic-gadget-backend",
    timestamp: new Date().toISOString(),
  });
}

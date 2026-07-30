import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Mobile money payments are currently disabled. Please use bank transfer or payment on delivery." },
    { status: 503 }
  );
}

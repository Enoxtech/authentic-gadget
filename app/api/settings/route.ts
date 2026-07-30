import { NextResponse } from "next/server";
import { DEFAULT_BANK_TRANSFER, getSettings, toPublicView } from "@/lib/settings";

export async function GET() {
  try {
    const row = await getSettings();
    if (row) return NextResponse.json(toPublicView(row));
  } catch (error) {
    console.error("Public settings DB lookup failed:", error);
  }

  return NextResponse.json({
    storeName: process.env.NEXT_PUBLIC_STORE_NAME || "Authentic Gadget",
    tagline: "Premium gadgets at unbeatable prices",
    storeEmail: process.env.STORE_EMAIL || process.env.ADMIN_EMAIL || "",
    storeAddress: "Accra, Ghana",
    businessHoursWeekdays: "9:00 AM - 7:00 PM",
    businessHoursSaturday: "10:00 AM - 6:00 PM",
    businessHoursSunday: "Closed",
    vatPercent: Number(process.env.VAT_PERCENT || 0),
    bankTransfer: {
      enabled: process.env.BANK_TRANSFER_ENABLED === "true" || DEFAULT_BANK_TRANSFER.enabled,
      bankName: process.env.BANK_NAME || DEFAULT_BANK_TRANSFER.bankName,
      accountName: process.env.BANK_ACCOUNT_NAME || DEFAULT_BANK_TRANSFER.accountName,
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || DEFAULT_BANK_TRANSFER.accountNumber,
      branch: process.env.BANK_BRANCH || DEFAULT_BANK_TRANSFER.branch,
      note: process.env.BANK_TRANSFER_NOTE || DEFAULT_BANK_TRANSFER.note,
    },
  });
}

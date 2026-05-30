import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, phone, email, name, orderId, provider } = await req.json();

    if (!amount || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields: amount, phone, email" },
        { status: 400 }
      );
    }

    // Map provider names to Flutterwave network codes
    const PROVIDER_NETWORK_MAP: Record<string, string> = {
      mtn: "MTN",
      vodafone: "VODAFONE",
      airteltigo: "TIGO", // Flutterwave uses "TIGO" for AirtelTigo
    };

    const network = provider ? (PROVIDER_NETWORK_MAP[provider] || "MTN") : "MTN";

    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
      return NextResponse.json(
        { error: "Flutterwave is not configured on this server" },
        { status: 503 }
      );
    }

    const txRef = `AG_${orderId || Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const payload = {
      tx_ref: txRef,
      amount: String(amount),
      currency: currency || "GHS",
      phone_number: phone,
      email: email,
      first_name: name?.split(" ")[0] || "Customer",
      last_name: name?.split(" ").slice(1).join(" ") || "",
      network,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/order-success?order=${orderId}&total=${amount}&method=momo&provider=${provider || "mtn"}`,
      meta: {
        order_id: orderId,
        provider: provider || "mtn",
        source: "authentic_gadget_web",
      },
    };

    const response = await fetch("https://api.flutterwave.com/v3/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.status !== "success") {
      return NextResponse.json(
        { error: data.message || "Failed to initiate MoMo payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      txRef,
      note: "Payment request sent. Check your MTN MoMo phone for a prompt.",
      // For demo/testing: return the Flutterwave response so the UI can show it
      flutterwave: data,
    });
  } catch (err) {
    console.error("Flutterwave MoMo error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
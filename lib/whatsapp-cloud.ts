import { decryptField, getSettings } from "@/lib/settings";

function normalizeGhanaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits;
}

/** Sends an order-status update via the Meta WhatsApp Cloud API. No-op (returns false) if not configured. */
export async function sendOrderStatusWhatsApp(input: {
  customerPhone: string;
  orderId: string;
  status: string;
}): Promise<boolean> {
  try {
    const settings = await getSettings();
    if (!settings) return false;

    const accessToken = decryptField(settings.whatsapp_access_token_enc);
    const phoneNumberId = settings.whatsapp_phone_number_id;
    if (!accessToken || !phoneNumberId || !input.customerPhone) return false;

    const templateName = settings.whatsapp_order_template_name || "order_update";
    const templateLanguage = settings.whatsapp_template_language || "en_US";
    const to = normalizeGhanaPhone(input.customerPhone);
    if (!to) return false;

    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: input.orderId },
                { type: "text", text: input.status },
              ],
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      console.error("WhatsApp Cloud API send failed:", await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("WhatsApp Cloud API error:", error);
    return false;
  }
}

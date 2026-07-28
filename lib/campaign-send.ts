import { Resend } from "resend";
import { decryptField, getSettings, type SettingsRow } from "@/lib/settings";

function normalizeGhanaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits;
}

export async function sendEmailCampaign(
  recipients: string[],
  subject: string,
  message: string
): Promise<{ sent: number; failed: number }> {
  const settings = await getSettings();
  const resendKey = settings ? decryptField(settings.resend_api_key_enc) : null;
  if (!resendKey) return { sent: 0, failed: recipients.length };

  const resend = new Resend(resendKey);
  const from = settings?.resend_from_email || "Authentic Gadget <orders@authenticgad.com>";
  const html = `<div style="font-family:Arial,sans-serif;padding:24px;color:#1a1a1a;white-space:pre-wrap">${message}</div>`;

  let sent = 0;
  let failed = 0;
  for (const to of recipients) {
    try {
      const { error } = await resend.emails.send({ from, to, subject, html });
      if (error) failed += 1;
      else sent += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}

export async function sendWhatsAppCampaign(
  recipients: string[],
  message: string
): Promise<{ sent: number; failed: number }> {
  const settings = await getSettings();
  const accessToken = settings ? decryptField(settings.whatsapp_access_token_enc) : null;
  const phoneNumberId = settings?.whatsapp_phone_number_id;
  if (!accessToken || !phoneNumberId) return { sent: 0, failed: recipients.length };

  let sent = 0;
  let failed = 0;
  for (const rawPhone of recipients) {
    const to = normalizeGhanaPhone(rawPhone);
    if (!to) {
      failed += 1;
      continue;
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      });
      if (res.ok) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}

export function campaignChannelsConfigured(settings: SettingsRow | null) {
  return {
    email: Boolean(settings && decryptField(settings.resend_api_key_enc)),
    whatsapp: Boolean(settings?.whatsapp_phone_number_id && settings && decryptField(settings.whatsapp_access_token_enc)),
  };
}

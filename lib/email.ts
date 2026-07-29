import { Resend } from "resend";
import nodemailer from "nodemailer";
import { decryptField, getSettings, type SettingsRow } from "@/lib/settings";

export const ORDERS_FROM = "orders@authenticgad.com";
export const NOREPLY_FROM = "noreply@authenticgad.com";
export const SUPPORT_FROM = "support@authenticgad.com";

interface Mailer {
  send: (to: string, subject: string, html: string, fromOverride?: string) => Promise<void>;
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function displayFrom(address: string) {
  return address.includes("<") ? address : `Authentic Gadget <${address}>`;
}

function defaultFrom(settings?: SettingsRow | null) {
  return (
    settings?.resend_from_email ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.AUTH_EMAIL_FROM ||
    `Authentic Gadget <${NOREPLY_FROM}>`
  );
}

async function getMailer(settings?: SettingsRow | null): Promise<Mailer | null> {
  const row = settings === undefined ? await getSettings() : settings;
  const resendApiKey = decryptField(row?.resend_api_key_enc ?? null) || process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const fallbackFrom = defaultFrom(row);
    return {
      send: async (to, subject, html, fromOverride) => {
        const { error } = await resend.emails.send({
          from: displayFrom(fromOverride || fallbackFrom),
          to,
          subject,
          html,
        });
        if (error) throw new Error(error.message);
      },
    };
  }

  const gmailUser = row?.gmail_user || process.env.GMAIL_USER;
  const gmailPass = decryptField(row?.gmail_app_password_enc ?? null) || process.env.GMAIL_APP_PASSWORD;
  if (gmailUser && gmailPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPass },
    });
    return {
      send: async (to, subject, html) => {
        await transporter.sendMail({
          from: `"Authentic Gadget" <${gmailUser}>`,
          to,
          subject,
          html,
        });
      },
    };
  }

  return null;
}

export async function getEmailSettings(): Promise<SettingsRow | null> {
  try {
    return await getSettings();
  } catch (error) {
    console.warn("Email settings unavailable, using environment fallbacks:", error);
    return null;
  }
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  fromOverride?: string,
  settings?: SettingsRow | null
): Promise<boolean> {
  try {
    if (!isEmail(to)) return false;
    const mailer = await getMailer(settings);
    if (!mailer) return false;
    await mailer.send(to, subject, html, fromOverride);
    return true;
  } catch (error) {
    console.error("[email] send failed:", error);
    return false;
  }
}

export function wrapEmail(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 16px 44px rgba(10,27,58,0.12);">
        <tr>
          <td style="background:#071836;padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d5b75d;">Authentic Gadget</p>
            <h1 style="margin:0;font-size:23px;font-weight:800;color:#ffffff;">${escapeHtml(title)}</h1>
          </td>
        </tr>
        <tr><td style="padding:30px 32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#fbf7ed;padding:18px 32px;text-align:center;border-top:1px solid #eadfca;">
            <p style="margin:0;font-size:12px;color:#8a7a5d;">Authentic Gadget - Accra, Ghana</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

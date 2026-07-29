import { Resend } from "resend";
import nodemailer from "nodemailer";
import { decryptField, getSettings, type SettingsRow } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

interface NewOrderInfo {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildAdminEmailHtml(order: NewOrderInfo) {
  const orderId = escapeHtml(order.orderId);
  const customerName = escapeHtml(order.customerName);
  const customerEmail = escapeHtml(order.customerEmail);
  return `
    <div style="font-family:Arial,sans-serif;padding:24px;color:#1a1a1a">
      <h2 style="margin:0 0 8px">New order received</h2>
      <p style="color:#666;margin:0 0 20px">Order <strong>#${orderId}</strong></p>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#888">Customer</td><td style="padding:6px 0;text-align:right">${customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0;text-align:right">${customerEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Items</td><td style="padding:6px 0;text-align:right">${order.itemCount}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold">Total</td><td style="padding:6px 0;text-align:right;font-weight:bold">${formatPrice(order.total)}</td></tr>
      </table>
    </div>`;
}

function buildCustomerEmailHtml(order: NewOrderInfo) {
  const orderId = escapeHtml(order.orderId);
  const customerName = escapeHtml(order.customerName);
  return `
    <div style="font-family:Arial,sans-serif;padding:24px;color:#1a1a1a">
      <h2 style="margin:0 0 8px">Thank you for your order</h2>
      <p style="color:#666;margin:0 0 20px">Hi ${customerName}, we have received your Authentic Gadget order.</p>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#888">Order</td><td style="padding:6px 0;text-align:right"><strong>#${orderId}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888">Items</td><td style="padding:6px 0;text-align:right">${order.itemCount}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold">Total</td><td style="padding:6px 0;text-align:right;font-weight:bold">${formatPrice(order.total)}</td></tr>
      </table>
      <p style="color:#666;font-size:13px;margin-top:20px">We will update you when your order moves to processing or delivery.</p>
    </div>`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resendFrom(settingsFromEmail?: string | null) {
  return (
    settingsFromEmail ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.AUTH_EMAIL_FROM ||
    "Authentic Gadget <noreply@authenticgad.com>"
  );
}

/** Sends order emails — Resend preferred, Gmail SMTP fallback. No-op if neither is configured. */
export async function notifyAdminOfNewOrder(order: NewOrderInfo): Promise<void> {
  try {
    let settings: SettingsRow | null = null;
    try {
      settings = await getSettings();
    } catch (error) {
      console.warn("Order email settings unavailable, using environment fallbacks:", error);
    }
    const adminEmail = settings?.admin_email || process.env.ADMIN_EMAIL || process.env.STORE_ADMIN_EMAIL || "";
    const customerEmail = order.customerEmail;
    if (!adminEmail && !customerEmail) return;

    const resendKey = decryptField(settings?.resend_api_key_enc ?? null) || process.env.RESEND_API_KEY;
    const adminSubject = `New order #${order.orderId} — ${formatPrice(order.total)}`;
    const customerSubject = `Your Authentic Gadget order #${order.orderId}`;

    if (resendKey) {
      const resend = new Resend(resendKey);
      const from = resendFrom(settings?.resend_from_email);
      const sends = [];
      if (adminEmail && isEmail(adminEmail)) {
        sends.push(resend.emails.send({ from, to: adminEmail, subject: adminSubject, html: buildAdminEmailHtml(order) }));
      }
      if (customerEmail && isEmail(customerEmail)) {
        sends.push(resend.emails.send({ from, to: customerEmail, subject: customerSubject, html: buildCustomerEmailHtml(order) }));
      }
      const results = await Promise.all(sends);
      const failed = results.find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
      return;
    }

    const gmailAppPassword = decryptField(settings?.gmail_app_password_enc ?? null);
    if (settings?.gmail_user && gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: settings.gmail_user, pass: gmailAppPassword },
      });
      if (adminEmail && isEmail(adminEmail)) {
        await transporter.sendMail({ from: settings.gmail_user, to: adminEmail, subject: adminSubject, html: buildAdminEmailHtml(order) });
      }
      if (customerEmail && isEmail(customerEmail)) {
        await transporter.sendMail({ from: settings.gmail_user, to: customerEmail, subject: customerSubject, html: buildCustomerEmailHtml(order) });
      }
    }
  } catch (error) {
    console.error("Order notification email failed:", error);
  }
}

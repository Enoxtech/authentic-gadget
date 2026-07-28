import { Resend } from "resend";
import nodemailer from "nodemailer";
import { decryptField, getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

interface NewOrderInfo {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}

function buildEmailHtml(order: NewOrderInfo) {
  return `
    <div style="font-family:Arial,sans-serif;padding:24px;color:#1a1a1a">
      <h2 style="margin:0 0 8px">New order received</h2>
      <p style="color:#666;margin:0 0 20px">Order <strong>#${order.orderId}</strong></p>
      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#888">Customer</td><td style="padding:6px 0;text-align:right">${order.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0;text-align:right">${order.customerEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Items</td><td style="padding:6px 0;text-align:right">${order.itemCount}</td></tr>
        <tr><td style="padding:6px 0;color:#888;font-weight:bold">Total</td><td style="padding:6px 0;text-align:right;font-weight:bold">${formatPrice(order.total)}</td></tr>
      </table>
    </div>`;
}

/** Notifies the configured admin email about a new order — Resend preferred, Gmail SMTP fallback. No-op if neither is configured. */
export async function notifyAdminOfNewOrder(order: NewOrderInfo): Promise<void> {
  try {
    const settings = await getSettings();
    if (!settings?.admin_email) return;

    const resendKey = decryptField(settings.resend_api_key_enc);
    const html = buildEmailHtml(order);
    const subject = `New order #${order.orderId} — ${formatPrice(order.total)}`;

    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: settings.resend_from_email || "Authentic Gadget <orders@authenticgad.com>",
        to: settings.admin_email,
        subject,
        html,
      });
      return;
    }

    const gmailAppPassword = decryptField(settings.gmail_app_password_enc);
    if (settings.gmail_user && gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: settings.gmail_user, pass: gmailAppPassword },
      });
      await transporter.sendMail({
        from: settings.gmail_user,
        to: settings.admin_email,
        subject,
        html,
      });
    }
  } catch (error) {
    console.error("Order notification email failed:", error);
  }
}

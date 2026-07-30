import { formatPrice } from "@/lib/utils";
import { escapeHtml, getEmailSettings, isEmail, ORDERS_FROM, sendMail } from "@/lib/email";
import { DEFAULT_BANK_TRANSFER, type SettingsRow } from "@/lib/settings";

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface NewOrderInfo {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingRegion?: string;
  orderNote?: string;
  paymentMethod?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount: number;
  items?: OrderEmailItem[];
}

function appUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL || "https://authenticgad.com";
}

function paymentLabel(method?: string) {
  const labels: Record<string, string> = {
    cod: "Payment on delivery",
    card: "Card payment",
    bank_transfer: "Manual bank transfer",
    momo_mtn: "MTN MoMo",
    momo_vodafone: "Telecel Cash",
    momo_airteltigo: "AirtelTigo Money",
    paystack: "Paystack",
    flutterwave: "Flutterwave",
    hubtel: "Hubtel MoMo",
  };
  return labels[method || ""] || (method ? method.replace(/_/g, " ") : "Not selected");
}

function bankDetails(settings?: SettingsRow | null) {
  return {
    bankName: settings?.bank_name || DEFAULT_BANK_TRANSFER.bankName,
    accountName: settings?.bank_account_name || DEFAULT_BANK_TRANSFER.accountName,
    accountNumber: settings?.bank_account_number || DEFAULT_BANK_TRANSFER.accountNumber,
    branch: settings?.bank_branch || DEFAULT_BANK_TRANSFER.branch,
    note: settings?.bank_transfer_note || DEFAULT_BANK_TRANSFER.note,
  };
}

function supportWhatsappUrl(order: NewOrderInfo) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!phone) return "";
  const message = `Hi! I have a question about my Authentic Gadget order ${order.orderId}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function safeItems(order: NewOrderInfo) {
  if (order.items?.length) return order.items;
  return [{ name: `${order.itemCount} item${order.itemCount === 1 ? "" : "s"}`, quantity: order.itemCount, price: order.total }];
}

function addressLine(order: NewOrderInfo) {
  return [order.shippingAddress, order.shippingCity, order.shippingRegion].filter(Boolean).join(", ");
}

function itemRows(order: NewOrderInfo) {
  return safeItems(order)
    .map(
      (item) => `
      <tr>
        <td style="padding:11px 12px;border-bottom:1px solid #efe7d5;font-size:14px;color:#172033;">${escapeHtml(item.name)}</td>
        <td style="padding:11px 12px;border-bottom:1px solid #efe7d5;font-size:14px;color:#172033;text-align:center;">${item.quantity}</td>
        <td style="padding:11px 12px;border-bottom:1px solid #efe7d5;font-size:14px;color:#172033;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");
}

function totalsRows(order: NewOrderInfo, totalLabel: string) {
  const subtotal = order.subtotal ?? order.total;
  const shipping = order.shipping ?? 0;
  const tax = order.tax ?? 0;
  const discount = order.discount ?? 0;

  return `
    <tr>
      <td style="padding:5px 0;font-size:13px;color:#8a7a5d;">Subtotal</td>
      <td style="padding:5px 0;font-size:13px;color:#172033;text-align:right;">${formatPrice(subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:5px 0;font-size:13px;color:#8a7a5d;">Delivery</td>
      <td style="padding:5px 0;font-size:13px;color:#172033;text-align:right;">${shipping > 0 ? formatPrice(shipping) : "Free / pending quote"}</td>
    </tr>
    ${tax > 0 ? `<tr>
      <td style="padding:5px 0;font-size:13px;color:#8a7a5d;">VAT</td>
      <td style="padding:5px 0;font-size:13px;color:#172033;text-align:right;">${formatPrice(tax)}</td>
    </tr>` : ""}
    ${discount > 0 ? `<tr>
      <td style="padding:5px 0;font-size:13px;color:#0f8f4d;">Discount</td>
      <td style="padding:5px 0;font-size:13px;color:#0f8f4d;text-align:right;">-${formatPrice(discount)}</td>
    </tr>` : ""}
    <tr>
      <td style="padding:13px 0 0;border-top:2px solid #efe7d5;font-size:16px;font-weight:800;color:#172033;">${totalLabel}</td>
      <td style="padding:13px 0 0;border-top:2px solid #efe7d5;font-size:20px;font-weight:800;color:#c89b05;text-align:right;">${formatPrice(order.total)}</td>
    </tr>`;
}

function emailShell(title: string, preheader: string, body: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4efe2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(preheader)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe2;padding:32px 16px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 16px 44px rgba(10,27,58,0.12);">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminEmailHtml(order: NewOrderInfo) {
  const orderId = escapeHtml(order.orderId);
  const address = addressLine(order);
  const adminUrl = `${appUrl()}/admin/orders`;

  return emailShell(
    `New order ${orderId}`,
    `New Authentic Gadget order ${orderId}`,
    `
    <tr>
      <td style="background:#071836;padding:30px 34px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d5b75d;">New Online Order</p>
        <h1 style="margin:0;font-size:25px;font-weight:800;color:#ffffff;">Authentic Gadget</h1>
        <p style="margin:10px 0 0;font-size:27px;font-weight:800;color:#ffffff;letter-spacing:1px;">${orderId}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#fff8df;padding:12px 34px;border-bottom:1px solid #ecd899;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#977105;text-align:center;">A new order is ready for review and processing.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:26px 34px 0;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5d;font-weight:700;">Customer Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;width:36%;">Name</td><td style="padding:6px 0;font-size:14px;color:#172033;font-weight:700;">${escapeHtml(order.customerName)}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;">Email</td><td style="padding:6px 0;font-size:14px;color:#172033;">${escapeHtml(order.customerEmail)}</td></tr>
          ${order.customerPhone ? `<tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;">Phone</td><td style="padding:6px 0;font-size:14px;color:#172033;font-weight:700;">${escapeHtml(order.customerPhone)}</td></tr>` : ""}
          ${address ? `<tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;">Delivery</td><td style="padding:6px 0;font-size:14px;color:#172033;">${escapeHtml(address)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;">Payment</td><td style="padding:6px 0;"><span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;background:#edf7ef;color:#116636;border:1px solid #c9e8d2;">${escapeHtml(paymentLabel(order.paymentMethod))}</span></td></tr>
          ${order.orderNote ? `<tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;vertical-align:top;">Note</td><td style="padding:6px 0;font-size:14px;color:#172033;font-style:italic;">${escapeHtml(order.orderNote)}</td></tr>` : ""}
        </table>
      </td>
    </tr>
    <tr><td style="padding:22px 34px 0;"><hr style="border:none;border-top:1px solid #efe7d5;margin:0;" /></td></tr>
    <tr>
      <td style="padding:22px 34px 0;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5d;font-weight:700;">Order Items</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #efe7d5;border-radius:14px;overflow:hidden;">
          <thead><tr style="background:#fbf7ed;">
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:left;">Product</th>
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:center;">Qty</th>
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:right;">Total</th>
          </tr></thead>
          <tbody>${itemRows(order)}</tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 34px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">${totalsRows(order, "ORDER TOTAL")}</table>
      </td>
    </tr>
    <tr>
      <td style="padding:30px 34px;text-align:center;">
        <a href="${adminUrl}" style="display:inline-block;padding:14px 32px;border-radius:999px;background:#071836;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;">View Order in Admin</a>
      </td>
    </tr>
    <tr>
      <td style="background:#fbf7ed;padding:18px 34px;text-align:center;border-top:1px solid #efe7d5;">
        <p style="margin:0;font-size:12px;color:#8a7a5d;">Authentic Gadget - Accra, Ghana</p>
        <p style="margin:6px 0 0;font-size:11px;color:#a99a7a;">This email was generated automatically when the order was placed.</p>
      </td>
    </tr>`
  );
}

function buildCustomerEmailHtml(order: NewOrderInfo, settings?: SettingsRow | null) {
  const orderId = escapeHtml(order.orderId);
  const address = addressLine(order);
  const trackUrl = `${appUrl()}/track-order`;
  const bank = bankDetails(settings);
  const whatsappUrl = supportWhatsappUrl(order);

  return emailShell(
    `Order confirmed ${orderId}`,
    `We have received your Authentic Gadget order ${orderId}.`,
    `
    <tr>
      <td style="background:#071836;padding:32px 34px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d5b75d;">Order Confirmed</p>
        <h1 style="margin:0;font-size:25px;font-weight:800;color:#ffffff;">Authentic Gadget</h1>
        <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.9);">Thank you, ${escapeHtml(order.customerName)}.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:25px 34px 0;text-align:center;">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5d;font-weight:700;">Order Number</p>
        <p style="margin:5px 0 0;font-size:26px;font-weight:800;color:#172033;letter-spacing:1px;">${orderId}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 34px 0;">
        <p style="margin:0;padding:13px 14px;border-radius:14px;background:#edf7ef;border:1px solid #c9e8d2;font-size:13px;font-weight:700;color:#116636;text-align:center;">We have received your order and will update you when it moves to processing or delivery.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:25px 34px 0;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5d;font-weight:700;">Delivery Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${address ? `<tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;width:36%;">Address</td><td style="padding:6px 0;font-size:14px;color:#172033;">${escapeHtml(address)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;font-size:13px;color:#8a7a5d;width:36%;">Payment</td><td style="padding:6px 0;"><span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;background:#fff8df;color:#977105;border:1px solid #ecd899;">${escapeHtml(paymentLabel(order.paymentMethod))}</span></td></tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding:22px 34px 0;"><hr style="border:none;border-top:1px solid #efe7d5;margin:0;" /></td></tr>
    <tr>
      <td style="padding:22px 34px 0;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5d;font-weight:700;">Your Items</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #efe7d5;border-radius:14px;overflow:hidden;">
          <thead><tr style="background:#fbf7ed;">
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:left;">Product</th>
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:center;">Qty</th>
            <th style="padding:11px 12px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8a7a5d;text-align:right;">Total</th>
          </tr></thead>
          <tbody>${itemRows(order)}</tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 34px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">${totalsRows(order, "TOTAL")}</table>
      </td>
    </tr>
    ${order.paymentMethod === "bank_transfer" ? `<tr>
      <td style="padding:24px 34px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:18px;background:#eef4ff;border:1px solid #cfe0fb;overflow:hidden;">
          <tr>
            <td style="padding:16px 18px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#1f3d78;">Complete your bank transfer</p>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#2d4d8a;">Transfer ${formatPrice(order.total)} and use your order ID as the reference. Send proof of payment to support so we can verify and process your order.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:5px 0;font-size:12px;color:#5670a2;">Bank</td><td style="padding:5px 0;font-size:13px;color:#172033;font-weight:800;text-align:right;">${escapeHtml(bank.bankName)}</td></tr>
                <tr><td style="padding:5px 0;font-size:12px;color:#5670a2;">Account Name</td><td style="padding:5px 0;font-size:13px;color:#172033;font-weight:800;text-align:right;">${escapeHtml(bank.accountName)}</td></tr>
                <tr><td style="padding:5px 0;font-size:12px;color:#5670a2;">Account Number</td><td style="padding:5px 0;font-size:14px;color:#172033;font-weight:900;letter-spacing:1px;text-align:right;">${escapeHtml(bank.accountNumber)}</td></tr>
                ${bank.branch ? `<tr><td style="padding:5px 0;font-size:12px;color:#5670a2;">Branch</td><td style="padding:5px 0;font-size:13px;color:#172033;font-weight:800;text-align:right;">${escapeHtml(bank.branch)}</td></tr>` : ""}
              </table>
              ${bank.note ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#5670a2;">${escapeHtml(bank.note)}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ""}
    <tr>
      <td style="padding:30px 34px;text-align:center;">
        <a href="${trackUrl}" style="display:inline-block;padding:14px 32px;border-radius:999px;background:#071836;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;">Track Your Order</a>
        ${whatsappUrl ? `<a href="${whatsappUrl}" style="display:inline-block;margin-left:8px;margin-top:10px;padding:14px 24px;border-radius:999px;background:#0f8f4d;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;">Chat With Support</a>` : ""}
      </td>
    </tr>
    <tr>
      <td style="background:#fbf7ed;padding:18px 34px;text-align:center;border-top:1px solid #efe7d5;">
        <p style="margin:0;font-size:12px;color:#8a7a5d;">Authentic Gadget - Accra, Ghana</p>
        <p style="margin:6px 0 0;font-size:11px;color:#a99a7a;">Thank you for shopping with us.</p>
      </td>
    </tr>`
  );
}

export async function notifyAdminOfNewOrder(order: NewOrderInfo): Promise<void> {
  try {
    const settings = await getEmailSettings();
    const adminEmail = settings?.admin_email || process.env.ADMIN_EMAIL || process.env.STORE_ADMIN_EMAIL || "";
    const sends: Promise<boolean>[] = [];

    if (adminEmail && isEmail(adminEmail)) {
      sends.push(
        sendMail(
          adminEmail,
          `New order ${order.orderId} - ${formatPrice(order.total)}`,
          buildAdminEmailHtml(order),
          ORDERS_FROM,
          settings
        )
      );
    }

    if (order.customerEmail && isEmail(order.customerEmail)) {
      sends.push(
        sendMail(
          order.customerEmail,
          `Your Authentic Gadget order ${order.orderId}`,
          buildCustomerEmailHtml(order, settings),
          ORDERS_FROM,
          settings
        )
      );
    }

    if (sends.length === 0) return;
    const results = await Promise.all(sends);
    if (results.every((sent) => !sent)) {
      console.error("Order notification email skipped: no configured sender or all sends failed.");
    }
  } catch (error) {
    console.error("Order notification email failed:", error);
  }
}

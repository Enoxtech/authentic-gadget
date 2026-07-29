import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { decryptSecret, encryptSecret } from "@/lib/settings-crypto";

export interface SettingsRow {
  id: string;
  store_name: string;
  tagline: string;
  store_email: string;
  store_address: string;
  business_hours_weekdays: string;
  business_hours_saturday: string;
  business_hours_sunday: string;
  vat_percent: number;
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token_enc: string | null;
  whatsapp_business_account_id: string | null;
  whatsapp_order_template_name: string | null;
  whatsapp_template_language: string | null;
  paystack_public_key: string | null;
  paystack_secret_key_enc: string | null;
  flutterwave_public_key: string | null;
  flutterwave_secret_key_enc: string | null;
  hubtel_client_id: string | null;
  hubtel_client_secret_enc: string | null;
  hubtel_request_money_base_url: string | null;
  hubtel_webhook_secret_enc: string | null;
  gmail_user: string | null;
  gmail_app_password_enc: string | null;
  admin_email: string | null;
  resend_api_key_enc: string | null;
  resend_from_email: string | null;
  bank_transfer_enabled: boolean | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_branch: string | null;
  bank_transfer_note: string | null;
  updated_at: string;
}

export async function getSettings(): Promise<SettingsRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("settings").select("*").eq("id", "default").maybeSingle();
  return (data as SettingsRow) || null;
}

export function decryptField(value: string | null): string | null {
  if (!value) return null;
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

/** Admin-facing view: raw public fields, secrets reduced to boolean *Set flags (never echoed back). */
export function toAdminView(row: SettingsRow) {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    storeEmail: row.store_email,
    storeAddress: row.store_address,
    businessHoursWeekdays: row.business_hours_weekdays,
    businessHoursSaturday: row.business_hours_saturday,
    businessHoursSunday: row.business_hours_sunday,
    vatPercent: Number(row.vat_percent),
    whatsappPhoneNumberId: row.whatsapp_phone_number_id || "",
    whatsappAccessTokenSet: Boolean(row.whatsapp_access_token_enc),
    whatsappBusinessAccountId: row.whatsapp_business_account_id || "",
    whatsappOrderTemplateName: row.whatsapp_order_template_name || "order_update",
    whatsappTemplateLanguage: row.whatsapp_template_language || "en_US",
    paystackPublicKey: row.paystack_public_key || "",
    paystackSecretKeySet: Boolean(row.paystack_secret_key_enc),
    flutterwavePublicKey: row.flutterwave_public_key || "",
    flutterwaveSecretKeySet: Boolean(row.flutterwave_secret_key_enc),
    hubtelClientId: row.hubtel_client_id || "",
    hubtelClientSecretSet: Boolean(row.hubtel_client_secret_enc),
    hubtelRequestMoneyBaseUrl: row.hubtel_request_money_base_url || "",
    hubtelWebhookSecretSet: Boolean(row.hubtel_webhook_secret_enc),
    gmailUser: row.gmail_user || "",
    gmailAppPasswordSet: Boolean(row.gmail_app_password_enc),
    adminEmail: row.admin_email || "",
    resendApiKeySet: Boolean(row.resend_api_key_enc),
    resendFromEmail: row.resend_from_email || "",
    bankTransferEnabled: Boolean(row.bank_transfer_enabled),
    bankName: row.bank_name || "",
    bankAccountName: row.bank_account_name || "",
    bankAccountNumber: row.bank_account_number || "",
    bankBranch: row.bank_branch || "",
    bankTransferNote: row.bank_transfer_note || "",
  };
}

/** Public storefront view: no secrets, no tokens — just display info. */
export function toPublicView(row: SettingsRow) {
  return {
    storeName: row.store_name,
    tagline: row.tagline,
    storeEmail: row.store_email,
    storeAddress: row.store_address,
    businessHoursWeekdays: row.business_hours_weekdays,
    businessHoursSaturday: row.business_hours_saturday,
    businessHoursSunday: row.business_hours_sunday,
    vatPercent: Number(row.vat_percent),
    bankTransfer: {
      enabled: Boolean(row.bank_transfer_enabled),
      bankName: row.bank_name || "",
      accountName: row.bank_account_name || "",
      accountNumber: row.bank_account_number || "",
      branch: row.bank_branch || "",
      note: row.bank_transfer_note || "",
    },
  };
}

const PLAIN_FIELDS: Record<string, string> = {
  storeName: "store_name",
  tagline: "tagline",
  storeEmail: "store_email",
  storeAddress: "store_address",
  businessHoursWeekdays: "business_hours_weekdays",
  businessHoursSaturday: "business_hours_saturday",
  businessHoursSunday: "business_hours_sunday",
  whatsappPhoneNumberId: "whatsapp_phone_number_id",
  whatsappBusinessAccountId: "whatsapp_business_account_id",
  whatsappOrderTemplateName: "whatsapp_order_template_name",
  whatsappTemplateLanguage: "whatsapp_template_language",
  paystackPublicKey: "paystack_public_key",
  flutterwavePublicKey: "flutterwave_public_key",
  hubtelClientId: "hubtel_client_id",
  hubtelRequestMoneyBaseUrl: "hubtel_request_money_base_url",
  gmailUser: "gmail_user",
  adminEmail: "admin_email",
  resendFromEmail: "resend_from_email",
  bankName: "bank_name",
  bankAccountName: "bank_account_name",
  bankAccountNumber: "bank_account_number",
  bankBranch: "bank_branch",
  bankTransferNote: "bank_transfer_note",
};

const SECRET_FIELDS: Record<string, string> = {
  whatsappAccessToken: "whatsapp_access_token_enc",
  paystackSecretKey: "paystack_secret_key_enc",
  flutterwaveSecretKey: "flutterwave_secret_key_enc",
  hubtelClientSecret: "hubtel_client_secret_enc",
  hubtelWebhookSecret: "hubtel_webhook_secret_enc",
  gmailAppPassword: "gmail_app_password_enc",
  resendApiKey: "resend_api_key_enc",
};

/** Builds a partial DB update object from an admin-submitted patch body. Empty-string secrets are ignored (keep existing). */
export function buildSettingsUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};

  for (const [key, column] of Object.entries(PLAIN_FIELDS)) {
    if (key in body && typeof body[key] === "string") updates[column] = body[key];
  }

  if ("vatPercent" in body) {
    const v = Number(body.vatPercent);
    if (Number.isFinite(v) && v >= 0 && v <= 100) updates.vat_percent = v;
  }

  if ("bankTransferEnabled" in body) {
    updates.bank_transfer_enabled = Boolean(body.bankTransferEnabled);
  }

  for (const [key, column] of Object.entries(SECRET_FIELDS)) {
    if (key in body && typeof body[key] === "string" && body[key]) {
      updates[column] = encryptSecret(body[key] as string);
    }
  }

  updates.updated_at = new Date().toISOString();
  return updates;
}

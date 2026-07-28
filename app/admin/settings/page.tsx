"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, Phone, Clock, MessageCircle, CreditCard, Mail, Percent, Landmark } from "lucide-react";

interface SettingsView {
  storeName: string;
  tagline: string;
  storeEmail: string;
  storeAddress: string;
  businessHoursWeekdays: string;
  businessHoursSaturday: string;
  businessHoursSunday: string;
  vatPercent: number;
  whatsappPhoneNumberId: string;
  whatsappAccessTokenSet: boolean;
  whatsappBusinessAccountId: string;
  whatsappOrderTemplateName: string;
  whatsappTemplateLanguage: string;
  paystackPublicKey: string;
  paystackSecretKeySet: boolean;
  flutterwavePublicKey: string;
  flutterwaveSecretKeySet: boolean;
  gmailUser: string;
  gmailAppPasswordSet: boolean;
  adminEmail: string;
  resendApiKeySet: boolean;
  resendFromEmail: string;
  bankTransferEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankTransferNote: string;
}

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30 placeholder:text-charcoal/30";
const sectionCard = "bg-white rounded-[28px] card-premium border border-[var(--border-color)] overflow-hidden";
const sectionHeader = "flex items-center gap-3 px-5 py-4 border-b border-fog";
const labelCls = "block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1.5";

function StatusPill({ active, activeLabel = "Configured", inactiveLabel = "Setup Required" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={`ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full ${active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function SaveButton({ onClick, saved, label, savedLabel }: { onClick: () => void; saved: boolean; label: string; savedLabel: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all w-full justify-center text-white ${saved ? "bg-green-600" : "bg-electric"}`}
    >
      <Save className="h-4 w-4" />
      {saved ? savedLabel : label}
    </button>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [settings, setSettings] = useState<SettingsView | null>(null);

  const [storeInfo, setStoreInfo] = useState({ storeName: "", tagline: "", storeEmail: "", storeAddress: "" });
  const [hours, setHours] = useState({ businessHoursWeekdays: "", businessHoursSaturday: "", businessHoursSunday: "" });
  const [tax, setTax] = useState({ vatPercent: 0 });
  const [whatsapp, setWhatsapp] = useState({
    whatsappPhoneNumberId: "", whatsappAccessToken: "", whatsappBusinessAccountId: "",
    whatsappOrderTemplateName: "", whatsappTemplateLanguage: "en_US",
  });
  const [payment, setPayment] = useState({ paystackPublicKey: "", paystackSecretKey: "", flutterwavePublicKey: "", flutterwaveSecretKey: "" });
  const [bankTransfer, setBankTransfer] = useState({
    bankTransferEnabled: false,
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankTransferNote: "",
  });
  const [email, setEmail] = useState({ gmailUser: "", gmailAppPassword: "", adminEmail: "", resendApiKey: "", resendFromEmail: "" });

  const [storeInfoSaved, setStoreInfoSaved] = useState(false);
  const [hoursSaved, setHoursSaved] = useState(false);
  const [taxSaved, setTaxSaved] = useState(false);
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [bankTransferSaved, setBankTransferSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => {
    if (!document.cookie.includes("admin_session_client")) {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        if (!me || me.role !== "super_admin") {
          setAuthorized(false);
          router.replace("/admin/dashboard");
          return;
        }
        setAuthorized(true);
        return fetch("/api/admin/settings")
          .then((r) => (r.ok ? r.json() : null))
          .then((data: SettingsView | null) => {
            if (!data) return;
            setSettings(data);
            setStoreInfo({ storeName: data.storeName, tagline: data.tagline, storeEmail: data.storeEmail, storeAddress: data.storeAddress });
            setHours({ businessHoursWeekdays: data.businessHoursWeekdays, businessHoursSaturday: data.businessHoursSaturday, businessHoursSunday: data.businessHoursSunday });
            setTax({ vatPercent: data.vatPercent });
            setWhatsapp({
              whatsappPhoneNumberId: data.whatsappPhoneNumberId, whatsappAccessToken: "",
              whatsappBusinessAccountId: data.whatsappBusinessAccountId,
              whatsappOrderTemplateName: data.whatsappOrderTemplateName, whatsappTemplateLanguage: data.whatsappTemplateLanguage,
            });
            setPayment({ paystackPublicKey: data.paystackPublicKey, paystackSecretKey: "", flutterwavePublicKey: data.flutterwavePublicKey, flutterwaveSecretKey: "" });
            setBankTransfer({
              bankTransferEnabled: data.bankTransferEnabled,
              bankName: data.bankName,
              bankAccountName: data.bankAccountName,
              bankAccountNumber: data.bankAccountNumber,
              bankBranch: data.bankBranch,
              bankTransferNote: data.bankTransferNote,
            });
            setEmail({ gmailUser: data.gmailUser, gmailAppPassword: "", adminEmail: data.adminEmail, resendApiKey: "", resendFromEmail: data.resendFromEmail });
          });
      });
  }, [router]);

  async function save(body: Record<string, unknown>, onSaved: () => void, clearFields?: Record<string, unknown>) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data: SettingsView = await res.json();
      setSettings(data);
      onSaved();
      if (clearFields) return data;
    }
    return null;
  }

  function flash(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Settings</h1>
        <p className="text-sm text-charcoal/50">Manage your store configuration</p>
      </div>

      {/* Store Information */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Store className="h-4 w-4 text-charcoal/40" />
          <h2 className="font-bold text-charcoal text-sm">Store Information</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Store Name</label>
            <input value={storeInfo.storeName} onChange={(e) => setStoreInfo((s) => ({ ...s, storeName: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input value={storeInfo.tagline} onChange={(e) => setStoreInfo((s) => ({ ...s, tagline: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Store Email</label>
            <input type="email" value={storeInfo.storeEmail} onChange={(e) => setStoreInfo((s) => ({ ...s, storeEmail: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Store Address</label>
            <input value={storeInfo.storeAddress} onChange={(e) => setStoreInfo((s) => ({ ...s, storeAddress: e.target.value }))} className={inputCls} />
          </div>
          <p className="text-[10px] text-charcoal/40 leading-relaxed">
            Shown on the Contact page and used in storefront copy that reads these settings.
          </p>
          <SaveButton onClick={() => save(storeInfo, () => flash(setStoreInfoSaved))} saved={storeInfoSaved} label="Save Store Info" savedLabel="Store Info Saved!" />
        </div>
      </div>

      {/* WhatsApp Ordering Number (read-only) */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Phone className="h-4 w-4 text-charcoal/40" />
          <h2 className="font-bold text-charcoal text-sm">WhatsApp Ordering Number</h2>
        </div>
        <div className="p-5 space-y-2">
          <p className="text-sm text-charcoal font-mono">{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "Not set"}</p>
          <p className="text-[10px] text-charcoal/40 leading-relaxed">
            This number is set via the <span className="text-charcoal/60">NEXT_PUBLIC_WHATSAPP_NUMBER</span> environment
            variable, not here — changing it requires updating that variable and redeploying.
          </p>
        </div>
      </div>

      {/* Business Hours */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Clock className="h-4 w-4 text-charcoal/40" />
          <h2 className="font-bold text-charcoal text-sm">Business Hours</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-charcoal/50">Shown on the Contact page.</p>
          <div>
            <label className={labelCls}>Mon – Fri</label>
            <input value={hours.businessHoursWeekdays} onChange={(e) => setHours((h) => ({ ...h, businessHoursWeekdays: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Saturday</label>
            <input value={hours.businessHoursSaturday} onChange={(e) => setHours((h) => ({ ...h, businessHoursSaturday: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Sunday</label>
            <input value={hours.businessHoursSunday} onChange={(e) => setHours((h) => ({ ...h, businessHoursSunday: e.target.value }))} className={inputCls} />
          </div>
          <SaveButton onClick={() => save(hours, () => flash(setHoursSaved))} saved={hoursSaved} label="Save Business Hours" savedLabel="Business Hours Saved!" />
        </div>
      </div>

      {/* Tax / VAT */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Percent className="h-4 w-4 text-purple-500" />
          <h2 className="font-bold text-charcoal text-sm">Tax / VAT</h2>
          <span className="ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
            {tax.vatPercent > 0 ? `${tax.vatPercent}% applied` : "Disabled"}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-charcoal/50">
            VAT is calculated on the order subtotal (not delivery) and shown as a separate line at checkout. Set to 0 to disable.
          </p>
          <div>
            <label className={labelCls}>VAT Percentage (%)</label>
            <input type="number" min={0} max={100} step={0.5} value={tax.vatPercent}
              onChange={(e) => setTax({ vatPercent: Number(e.target.value) })} placeholder="7.5" className={inputCls} />
          </div>
          <SaveButton onClick={() => save(tax, () => flash(setTaxSaved))} saved={taxSaved} label="Save VAT Setting" savedLabel="VAT Setting Saved!" />
        </div>
      </div>

      {/* WhatsApp Cloud API */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <MessageCircle className="h-4 w-4 text-green-600" />
          <h2 className="font-bold text-charcoal text-sm">WhatsApp Notifications (Cloud API)</h2>
          <StatusPill active={Boolean(settings?.whatsappAccessTokenSet)} />
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-charcoal/50">
            Sends automatic order updates via WhatsApp. Requires a Meta WhatsApp Business Platform account and one approved
            message template. The click-to-chat &quot;Order via WhatsApp&quot; button works independently of this.
          </p>
          <div>
            <label className={labelCls}>Phone Number ID</label>
            <input value={whatsapp.whatsappPhoneNumberId} onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappPhoneNumberId: e.target.value }))}
              placeholder="From Meta Business Manager → WhatsApp → API Setup" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>
              Access Token {settings?.whatsappAccessTokenSet && <span className="text-green-600">(currently set)</span>}
            </label>
            <input type="password" value={whatsapp.whatsappAccessToken} onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappAccessToken: e.target.value }))}
              placeholder={settings?.whatsappAccessTokenSet ? "••••••••••••••••" : "Permanent system-user token (recommended)"} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Business Account ID (optional)</label>
            <input value={whatsapp.whatsappBusinessAccountId} onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappBusinessAccountId: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Approved Template Name</label>
              <input value={whatsapp.whatsappOrderTemplateName} onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappOrderTemplateName: e.target.value }))}
                placeholder="order_update" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Template Language</label>
              <input value={whatsapp.whatsappTemplateLanguage} onChange={(e) => setWhatsapp((w) => ({ ...w, whatsappTemplateLanguage: e.target.value }))}
                placeholder="en_US" className={inputCls} />
            </div>
          </div>
          <SaveButton
            onClick={async () => {
              await save(whatsapp, () => flash(setWhatsappSaved));
              setWhatsapp((w) => ({ ...w, whatsappAccessToken: "" }));
            }}
            saved={whatsappSaved} label="Save WhatsApp Settings" savedLabel="WhatsApp Settings Saved!"
          />
        </div>
      </div>

      {/* WhatsApp click-to-chat status */}
      <div className={`${sectionCard} p-5`}>
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <h2 className="font-bold text-charcoal text-sm">WhatsApp Click-to-Chat</h2>
          <span className="ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
        </div>
        <p className="text-xs text-charcoal/50">Always-on free link-based ordering via the WhatsApp Ordering Number above.</p>
      </div>

      {/* Payment Gateway */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <CreditCard className="h-4 w-4 text-amber-600" />
          <h2 className="font-bold text-charcoal text-sm">Payment Gateway</h2>
          <StatusPill active={Boolean(settings?.paystackSecretKeySet || settings?.flutterwaveSecretKeySet)} />
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-charcoal/50">
            Add your Paystack and/or Flutterwave API keys to accept card and mobile money payments. Secret keys are never
            shown again once saved — only whether one is set. Leave blank to keep using the server&apos;s environment-variable keys.
          </p>

          <div className="space-y-3">
            <p className="text-xs font-bold text-charcoal/70">Paystack</p>
            <div>
              <label className={labelCls}>Public Key</label>
              <input value={payment.paystackPublicKey} onChange={(e) => setPayment((p) => ({ ...p, paystackPublicKey: e.target.value }))}
                placeholder="pk_live_xxxxxxxxxxxxxxxx" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Secret Key {settings?.paystackSecretKeySet && <span className="text-green-600">(currently set)</span>}
              </label>
              <input type="password" value={payment.paystackSecretKey} onChange={(e) => setPayment((p) => ({ ...p, paystackSecretKey: e.target.value }))}
                placeholder={settings?.paystackSecretKeySet ? "••••••••••••••••" : "sk_live_xxxxxxxxxxxxxxxx"} className={inputCls} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-charcoal/70">Flutterwave</p>
            <div>
              <label className={labelCls}>Public Key</label>
              <input value={payment.flutterwavePublicKey} onChange={(e) => setPayment((p) => ({ ...p, flutterwavePublicKey: e.target.value }))}
                placeholder="FLWPUBK-xxxxxxxxxxxxxxxx" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Secret Key {settings?.flutterwaveSecretKeySet && <span className="text-green-600">(currently set)</span>}
              </label>
              <input type="password" value={payment.flutterwaveSecretKey} onChange={(e) => setPayment((p) => ({ ...p, flutterwaveSecretKey: e.target.value }))}
                placeholder={settings?.flutterwaveSecretKeySet ? "••••••••••••••••" : "FLWSECK-xxxxxxxxxxxxxxxx"} className={inputCls} />
            </div>
          </div>

          <SaveButton
            onClick={async () => {
              await save(payment, () => flash(setPaymentSaved));
              setPayment((p) => ({ ...p, paystackSecretKey: "", flutterwaveSecretKey: "" }));
            }}
            saved={paymentSaved} label="Save Payment Keys" savedLabel="Payment Keys Saved!"
          />
        </div>
      </div>

      {/* Manual Bank Transfer */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Landmark className="h-4 w-4 text-blue-600" />
          <h2 className="font-bold text-charcoal text-sm">Manual Bank Transfer</h2>
          <StatusPill active={bankTransfer.bankTransferEnabled && Boolean(bankTransfer.bankName && bankTransfer.bankAccountNumber)} />
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-charcoal/50">
            When enabled, customers can place an order, see these bank details, transfer manually, and admin can mark payment as paid after verification.
          </p>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-fog px-3.5 py-3 text-sm font-semibold text-charcoal">
            Enable bank transfer at checkout
            <input
              type="checkbox"
              checked={bankTransfer.bankTransferEnabled}
              onChange={(e) => setBankTransfer((b) => ({ ...b, bankTransferEnabled: e.target.checked }))}
              className="h-4 w-4"
            />
          </label>
          <div>
            <label className={labelCls}>Bank Name</label>
            <input value={bankTransfer.bankName} onChange={(e) => setBankTransfer((b) => ({ ...b, bankName: e.target.value }))} className={inputCls} placeholder="e.g. GCB Bank" />
          </div>
          <div>
            <label className={labelCls}>Account Name</label>
            <input value={bankTransfer.bankAccountName} onChange={(e) => setBankTransfer((b) => ({ ...b, bankAccountName: e.target.value }))} className={inputCls} placeholder="Authentic Gadget" />
          </div>
          <div>
            <label className={labelCls}>Account Number</label>
            <input value={bankTransfer.bankAccountNumber} onChange={(e) => setBankTransfer((b) => ({ ...b, bankAccountNumber: e.target.value }))} className={inputCls} placeholder="0000000000" />
          </div>
          <div>
            <label className={labelCls}>Branch / Sort Code (optional)</label>
            <input value={bankTransfer.bankBranch} onChange={(e) => setBankTransfer((b) => ({ ...b, bankBranch: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Customer Instruction Note</label>
            <textarea
              value={bankTransfer.bankTransferNote}
              onChange={(e) => setBankTransfer((b) => ({ ...b, bankTransferNote: e.target.value }))}
              className={`${inputCls} min-h-24 resize-y`}
              placeholder="Use your order ID as transfer reference, then contact support for verification."
            />
          </div>
          <SaveButton onClick={() => save(bankTransfer, () => flash(setBankTransferSaved))} saved={bankTransferSaved} label="Save Bank Transfer" savedLabel="Bank Transfer Saved!" />
        </div>
      </div>

      {/* Email Notifications */}
      <div className={sectionCard}>
        <div className={sectionHeader}>
          <Mail className="h-4 w-4 text-red-500" />
          <h2 className="font-bold text-charcoal text-sm">Email Notifications</h2>
          <StatusPill
            active={Boolean(settings?.resendApiKeySet || settings?.gmailAppPasswordSet)}
            activeLabel={settings?.resendApiKeySet ? "Resend Active" : "Gmail Active"}
          />
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-charcoal/50">
            <strong className="text-charcoal/70">Resend is recommended</strong> — Gmail SMTP from a personal address often
            lands in spam. If a Resend API key is set, it&apos;s used for order notifications; otherwise Gmail is used as a fallback.
          </p>

          <div className="space-y-3 pb-4 border-b border-fog">
            <p className="text-xs font-bold text-charcoal/70">Resend (recommended)</p>
            <div>
              <label className={labelCls}>
                API Key {settings?.resendApiKeySet && <span className="text-green-600">(currently set)</span>}
              </label>
              <input type="password" value={email.resendApiKey} onChange={(e) => setEmail((s) => ({ ...s, resendApiKey: e.target.value }))}
                placeholder={settings?.resendApiKeySet ? "••••••••••••••••" : "re_xxxxxxxxxxxxxxxx"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>From Address</label>
              <input type="email" value={email.resendFromEmail} onChange={(e) => setEmail((s) => ({ ...s, resendFromEmail: e.target.value }))}
                placeholder="orders@authenticgad.com" className={inputCls} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-charcoal/70">Gmail (fallback)</p>
            <div>
              <label className={labelCls}>Gmail Address (sends from)</label>
              <input type="email" value={email.gmailUser} onChange={(e) => setEmail((s) => ({ ...s, gmailUser: e.target.value }))}
                placeholder="yourstore@gmail.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Gmail App Password {settings?.gmailAppPasswordSet && <span className="text-green-600">(currently set)</span>}
              </label>
              <input type="password" value={email.gmailAppPassword} onChange={(e) => setEmail((s) => ({ ...s, gmailAppPassword: e.target.value }))}
                placeholder={settings?.gmailAppPasswordSet ? "••••••••••••••••" : "xxxx xxxx xxxx xxxx"} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Admin Notification Email</label>
            <input type="email" value={email.adminEmail} onChange={(e) => setEmail((s) => ({ ...s, adminEmail: e.target.value }))}
              placeholder="admin@authenticgad.com" className={inputCls} />
          </div>
          <SaveButton
            onClick={async () => {
              await save(email, () => flash(setEmailSaved));
              setEmail((s) => ({ ...s, gmailAppPassword: "", resendApiKey: "" }));
            }}
            saved={emailSaved} label="Save Email Settings" savedLabel="Email Settings Saved!"
          />
        </div>
      </div>
    </div>
  );
}

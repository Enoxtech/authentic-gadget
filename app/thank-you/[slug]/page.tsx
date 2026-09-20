import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { getSalesPageBySlug } from "@/lib/sales-pages";
import { DEFAULT_BANK_TRANSFER, getSettings } from "@/lib/settings";
import CopyValueButton from "@/components/sales/CopyValueButton";

export default async function SalesThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string; total?: string; method?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [page, settings] = await Promise.all([getSalesPageBySlug(slug, false), getSettings().catch(() => null)]);
  if (!page) notFound();

  const orderId = query.order || "Pending";
  const total = Number(query.total || 0);
  const isBankTransfer = query.method === "bank_transfer";
  const bank = {
    bankName: settings?.bank_name || DEFAULT_BANK_TRANSFER.bankName,
    accountName: settings?.bank_account_name || DEFAULT_BANK_TRANSFER.accountName,
    accountNumber: settings?.bank_account_number || DEFAULT_BANK_TRANSFER.accountNumber,
  };

  return (
    <main className="min-h-screen bg-[#050b1c] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src="/logo-white.png" alt="Authentic Gadget" width={44} height={44} className="h-11 w-11 object-contain" />
          <span className="text-lg font-bold">Authentic Gadget</span>
        </div>
        <section className="rounded-[32px] border border-white/10 bg-[#0a1530] p-6 text-center shadow-2xl sm:p-9">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-400" />
          <h1 className="mt-5 text-3xl font-black">{page.config.thankYouHeadline}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">{page.config.thankYouMessage}</p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <PackageCheck className="h-6 w-6" style={{ color: page.config.accentColor }} />
              <div><p className="text-xs text-white/40">Order ID</p><p className="break-all font-bold">{orderId}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 text-sm"><span className="text-white/50">Order total</span><strong style={{ color: page.config.accentColor }}>{formatPrice(total)}</strong></div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-white/50">Payment</span><strong>{isBankTransfer ? "Bank transfer" : "Payment on delivery"}</strong></div>
          </div>

          {isBankTransfer && (
            <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 text-left">
              <h2 className="font-bold text-blue-100">Complete your bank transfer</h2>
              <p className="mt-1 text-xs leading-5 text-blue-100/60">Transfer the exact total and use your order ID as the reference.</p>
              <div className="mt-4 space-y-2">
                {[
                  ["Bank", bank.bankName],
                  ["Account name", bank.accountName],
                  ["Account number", bank.accountNumber],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 rounded-xl bg-white/95 px-3 py-2.5 text-[#071126]">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-500">{label}</p><p className="break-all text-sm font-extrabold">{value}</p></div>
                    <CopyValueButton value={value} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href={`/track-order?order=${encodeURIComponent(orderId)}`} className="rounded-xl px-5 py-3 text-sm font-bold text-[#041020]" style={{ background: page.config.accentColor }}>Track Order</Link>
            <Link href="/" className="rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold">Continue Shopping</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

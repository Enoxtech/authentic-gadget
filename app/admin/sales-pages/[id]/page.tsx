"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import ImageUploadButton from "@/components/admin/ImageUploadButton";
import type { SalesPage, SalesPageConfig, SalesPageProduct } from "@/types/sales-page";

const card = "rounded-[24px] border border-white/10 bg-white/[0.04] p-5 space-y-4";
const input = "admin-input";
const label = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/45";

function pairText(rows: object[], first: string, second: string) {
  return rows.map((row) => {
    const values = row as Record<string, string>;
    return `${values[first] || ""} | ${values[second] || ""}`;
  }).join("\n");
}

function parsePairs<First extends string, Second extends string>(
  value: string,
  first: First,
  second: Second
): Array<Record<First | Second, string>> {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const [left, ...right] = line.split("|");
    return { [first]: left.trim(), [second]: right.join("|").trim() } as Record<First | Second, string>;
  }).filter((row) => Boolean(row[first]));
}

export default function EditSalesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<SalesPage | null>(null);
  const [products, setProducts] = useState<SalesPageProduct[]>([]);
  const [benefits, setBenefits] = useState("");
  const [badges, setBadges] = useState("");
  const [featureBlocks, setFeatureBlocks] = useState("");
  const [steps, setSteps] = useState("");
  const [comparison, setComparison] = useState("");
  const [includedItems, setIncludedItems] = useState("");
  const [testimonials, setTestimonials] = useState("");
  const [faqs, setFaqs] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/admin/sales-pages/${id}`)
      .then(async (response) => {
        if (response.status === 401) return router.push("/admin/login");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load sales page");
        setPage(data.page);
        setProducts(data.products || []);
        setBenefits(pairText(data.page.config.benefits, "title", "description"));
        setBadges((data.page.config.badges || []).join("\n"));
        setFeatureBlocks((data.page.config.featureBlocks || []).map((row: { title: string; description: string; imageUrl: string }) => `${row.title} | ${row.description} | ${row.imageUrl || ""}`).join("\n"));
        setSteps(pairText(data.page.config.howItWorks || [], "title", "description"));
        setComparison((data.page.config.comparisonRows || []).map((row: { label: string; authentic: string; alternative: string }) => `${row.label} | ${row.authentic} | ${row.alternative}`).join("\n"));
        setIncludedItems((data.page.config.includedItems || []).join("\n"));
        setTestimonials(pairText(data.page.config.testimonials, "name", "quote"));
        setFaqs(pairText(data.page.config.faqs, "question", "answer"));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load sales page"));
  }, [id, router]);

  function updateConfig<K extends keyof SalesPageConfig>(key: K, value: SalesPageConfig[K]) {
    setPage((current) => current ? { ...current, config: { ...current.config, [key]: value } } : current);
  }

  function updateForm<K extends keyof SalesPageConfig["form"]>(key: K, value: SalesPageConfig["form"][K]) {
    setPage((current) => current ? {
      ...current,
      config: { ...current.config, form: { ...current.config.form, [key]: value } },
    } : current);
  }

  async function save() {
    if (!page) return;
    setSaving(true);
    setMessage("");
    const config: SalesPageConfig = {
      ...page.config,
      benefits: parsePairs(benefits, "title", "description"),
      badges: badges.split("\n").map((line) => line.trim()).filter(Boolean),
      featureBlocks: featureBlocks.split("\n").map((line) => {
        const [title, description = "", imageUrl = ""] = line.split("|").map((part) => part.trim());
        return { title, description, imageUrl };
      }).filter((row) => row.title && row.description),
      howItWorks: parsePairs(steps, "title", "description"),
      comparisonRows: comparison.split("\n").map((line) => {
        const [label, authentic = "Yes", alternative = "Varies"] = line.split("|").map((part) => part.trim());
        return { label, authentic, alternative };
      }).filter((row) => row.label),
      includedItems: includedItems.split("\n").map((line) => line.trim()).filter(Boolean),
      testimonials: parsePairs(testimonials, "name", "quote"),
      faqs: parsePairs(faqs, "question", "answer"),
    };
    try {
      const response = await fetch(`/api/admin/sales-pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: page.name,
          slug: page.slug,
          product_id: page.product_id,
          is_published: page.is_published,
          meta_pixel_id: page.meta_pixel_id || "",
          config,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save sales page");
      setPage({ ...data.page, config });
      setMessage("Sales page saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save sales page");
    } finally {
      setSaving(false);
    }
  }

  if (!page) return <div className="p-8 text-sm text-white/50">{message || "Loading sales page..."}</div>;

  return (
    <div className="max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/sales-pages" className="rounded-xl bg-white/8 p-2.5 text-white"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white">Edit Sales Page</h1>
          <p className="text-sm text-white/45">Every field and the order form can be changed at any time.</p>
        </div>
        {page.is_published && <a href={`/sales/${page.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/8 px-4 py-2.5 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" /> Preview</a>}
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}</button>
      </div>

      {message && <div className={`rounded-xl px-4 py-3 text-sm ${message.includes("saved") ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"}`}>{message}</div>}

      <section className={card}>
        <h2 className="font-bold text-white">Page setup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Internal Page Name</label><input className={input} value={page.name} onChange={(e) => setPage({ ...page, name: e.target.value })} /></div>
          <div><label className={label}>Public URL Slug</label><input className={input} value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} /></div>
          <div><label className={label}>Product</label><select className={input} value={page.product_id} onChange={(e) => setPage({ ...page, product_id: e.target.value })}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div>
          <div><label className={label}>Page-specific Meta Pixel ID (optional)</label><input className={input} inputMode="numeric" value={page.meta_pixel_id || ""} onChange={(e) => setPage({ ...page, meta_pixel_id: e.target.value.replace(/\D/g, "") || null })} placeholder="Uses store pixel when empty" /></div>
        </div>
        <label className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-white">
          Publish this page
          <input type="checkbox" checked={page.is_published} onChange={(e) => setPage({ ...page, is_published: e.target.checked })} className="h-4 w-4 accent-[#D4A843]" />
        </label>
      </section>

      <section className={card}>
        <h2 className="font-bold text-white">Landing page content</h2>
        <div><label className={label}>Headline</label><input className={input} value={page.config.headline} onChange={(e) => updateConfig("headline", e.target.value)} /></div>
        <div><label className={label}>Subheadline</label><textarea className={`${input} min-h-20`} value={page.config.subheadline} onChange={(e) => updateConfig("subheadline", e.target.value)} /></div>
        <div><label className={label}>Offer Description</label><textarea className={`${input} min-h-28`} value={page.config.description} onChange={(e) => updateConfig("description", e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Urgency Message</label><input className={input} value={page.config.urgencyText} onChange={(e) => updateConfig("urgencyText", e.target.value)} /></div>
          <div><label className={label}>Social Proof Line</label><input className={input} value={page.config.socialProofText} onChange={(e) => updateConfig("socialProofText", e.target.value)} /></div>
        </div>
        <div>
          <label className={label}>Hero Image URL</label>
          <div className="flex flex-col gap-2 sm:flex-row"><input className={input} value={page.config.heroImageUrl} onChange={(e) => updateConfig("heroImageUrl", e.target.value)} /><ImageUploadButton folder="banners" onUploaded={(url) => updateConfig("heroImageUrl", url)} label="Upload hero" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Main Button Label</label><input className={input} value={page.config.ctaLabel} onChange={(e) => updateConfig("ctaLabel", e.target.value)} /></div>
          <div><label className={label}>Accent Colour</label><input className={input} type="color" value={page.config.accentColor} onChange={(e) => updateConfig("accentColor", e.target.value)} /></div>
        </div>
        <div><label className={label}>Benefits (one per line: Title | Description)</label><textarea className={`${input} min-h-32`} value={benefits} onChange={(e) => setBenefits(e.target.value)} /></div>
        <div><label className={label}>Hero Badges (one per line)</label><textarea className={`${input} min-h-24`} value={badges} onChange={(e) => setBadges(e.target.value)} /></div>
        <div><label className={label}>Feature Story Blocks (Title | Description | Image URL)</label><textarea className={`${input} min-h-32`} value={featureBlocks} onChange={(e) => setFeatureBlocks(e.target.value)} placeholder="Titanium design | Strong and lightweight | https://..." /></div>
        <div><label className={label}>How It Works (Title | Description)</label><textarea className={`${input} min-h-28`} value={steps} onChange={(e) => setSteps(e.target.value)} /></div>
        <div><label className={label}>Comparison Section Title</label><input className={input} value={page.config.comparisonTitle} onChange={(e) => updateConfig("comparisonTitle", e.target.value)} /></div>
        <div><label className={label}>Comparison Rows (Feature | Authentic Gadget | Alternative)</label><textarea className={`${input} min-h-28`} value={comparison} onChange={(e) => setComparison(e.target.value)} /></div>
        <div><label className={label}>What&apos;s Included (one item per line)</label><textarea className={`${input} min-h-24`} value={includedItems} onChange={(e) => setIncludedItems(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label}>Guarantee Title</label><input className={input} value={page.config.guaranteeTitle} onChange={(e) => updateConfig("guaranteeTitle", e.target.value)} /></div>
          <div><label className={label}>Guarantee Message</label><textarea className={`${input} min-h-20`} value={page.config.guaranteeText} onChange={(e) => updateConfig("guaranteeText", e.target.value)} /></div>
        </div>
        <div><label className={label}>Testimonials (one per line: Name | Quote)</label><textarea className={`${input} min-h-28`} value={testimonials} onChange={(e) => setTestimonials(e.target.value)} /></div>
        <div><label className={label}>FAQs (one per line: Question | Answer)</label><textarea className={`${input} min-h-28`} value={faqs} onChange={(e) => setFaqs(e.target.value)} /></div>
      </section>

      <section className={card}>
        <h2 className="font-bold text-white">Reusable order form</h2>
        <p className="text-xs text-white/45">This form is automatically embedded in this sales page and copied when the page is duplicated.</p>
        <div><label className={label}>Form Heading</label><input className={input} value={page.config.form.heading} onChange={(e) => updateForm("heading", e.target.value)} /></div>
        <div><label className={label}>Form Help Text</label><textarea className={`${input} min-h-20`} value={page.config.form.subheading} onChange={(e) => updateForm("subheading", e.target.value)} /></div>
        <div><label className={label}>Submit Button Label</label><input className={input} value={page.config.form.submitLabel} onChange={(e) => updateForm("submitLabel", e.target.value)} /></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            ["showEmail", "Collect email"], ["showPhone", "Collect phone"], ["showAddress", "Collect delivery address"], ["showQuantity", "Let customer change quantity"], ["allowCod", "Allow payment on delivery"], ["allowBankTransfer", "Allow bank transfer"],
          ] as const).map(([key, text]) => (
            <label key={key} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm text-white/75">{text}<input type="checkbox" checked={page.config.form[key]} onChange={(e) => updateForm(key, e.target.checked)} className="h-4 w-4 accent-[#D4A843]" /></label>
          ))}
        </div>
        <div><label className={label}>Default Payment Method</label><select className={input} value={page.config.form.defaultPaymentMethod} onChange={(e) => updateForm("defaultPaymentMethod", e.target.value === "bank_transfer" ? "bank_transfer" : "cod")}><option value="cod">Payment on delivery</option><option value="bank_transfer">Bank transfer</option></select></div>
      </section>

      <section className={card}>
        <h2 className="font-bold text-white">Thank-you page</h2>
        <div><label className={label}>Headline</label><input className={input} value={page.config.thankYouHeadline} onChange={(e) => updateConfig("thankYouHeadline", e.target.value)} /></div>
        <div><label className={label}>Message</label><textarea className={`${input} min-h-24`} value={page.config.thankYouMessage} onChange={(e) => updateConfig("thankYouMessage", e.target.value)} /></div>
      </section>
    </div>
  );
}

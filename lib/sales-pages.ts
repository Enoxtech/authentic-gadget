import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { DEFAULT_SALES_PAGE_CONFIG } from "@/types/sales-page";
import type {
  SalesPage,
  SalesPageBenefit,
  SalesPageConfig,
  SalesPageFaq,
  SalesPageTestimonial,
} from "@/types/sales-page";

function text(value: unknown, fallback = "", max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

function rows<T>(
  value: unknown,
  parser: (row: Record<string, unknown>) => T | null,
  max = 20
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, max)
    .map((row) => (row && typeof row === "object" ? parser(row as Record<string, unknown>) : null))
    .filter((row): row is T => Boolean(row));
}

export function normalizeSalesPageConfig(value: unknown): SalesPageConfig {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const formSource = source.form && typeof source.form === "object"
    ? (source.form as Record<string, unknown>)
    : {};
  const accent = text(source.accentColor, DEFAULT_SALES_PAGE_CONFIG.accentColor, 20);
  const allowCod = formSource.allowCod !== false;
  const allowBankTransfer = formSource.allowBankTransfer !== false;
  const requestedDefault = formSource.defaultPaymentMethod === "bank_transfer" ? "bank_transfer" : "cod";

  const benefits = rows<SalesPageBenefit>(source.benefits, (row) => {
    const title = text(row.title, "", 140);
    if (!title) return null;
    return { title, description: text(row.description, "", 500) };
  });
  const testimonials = rows<SalesPageTestimonial>(source.testimonials, (row) => {
    const quote = text(row.quote, "", 700);
    if (!quote) return null;
    return { name: text(row.name, "Customer", 100), quote };
  });
  const faqs = rows<SalesPageFaq>(source.faqs, (row) => {
    const question = text(row.question, "", 220);
    const answer = text(row.answer, "", 1200);
    if (!question || !answer) return null;
    return { question, answer };
  });

  return {
    headline: text(source.headline, DEFAULT_SALES_PAGE_CONFIG.headline, 220),
    subheadline: text(source.subheadline, DEFAULT_SALES_PAGE_CONFIG.subheadline, 500),
    description: text(source.description, DEFAULT_SALES_PAGE_CONFIG.description, 4000),
    heroImageUrl: text(source.heroImageUrl, "", 2000),
    ctaLabel: text(source.ctaLabel, DEFAULT_SALES_PAGE_CONFIG.ctaLabel, 80),
    accentColor: /^#[0-9a-f]{6}$/i.test(accent) ? accent : DEFAULT_SALES_PAGE_CONFIG.accentColor,
    benefits: benefits.length ? benefits : DEFAULT_SALES_PAGE_CONFIG.benefits,
    testimonials,
    faqs,
    form: {
      heading: text(formSource.heading, DEFAULT_SALES_PAGE_CONFIG.form.heading, 160),
      subheading: text(formSource.subheading, DEFAULT_SALES_PAGE_CONFIG.form.subheading, 400),
      submitLabel: text(formSource.submitLabel, DEFAULT_SALES_PAGE_CONFIG.form.submitLabel, 80),
      showEmail: formSource.showEmail !== false,
      showPhone: formSource.showPhone !== false,
      showAddress: formSource.showAddress !== false,
      showQuantity: formSource.showQuantity !== false,
      allowCod: allowCod || !allowBankTransfer,
      allowBankTransfer: allowBankTransfer,
      defaultPaymentMethod:
        requestedDefault === "bank_transfer" && allowBankTransfer ? "bank_transfer" : "cod",
    },
    thankYouHeadline: text(source.thankYouHeadline, DEFAULT_SALES_PAGE_CONFIG.thankYouHeadline, 180),
    thankYouMessage: text(source.thankYouMessage, DEFAULT_SALES_PAGE_CONFIG.thankYouMessage, 800),
  };
}

export function salesPageSlug(value: unknown) {
  return text(value, "", 100)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseSalesPagePayload(body: Record<string, unknown>, partial = false) {
  const payload: Record<string, unknown> = {};
  if (!partial || "name" in body) payload.name = text(body.name, "", 160);
  if (!partial || "slug" in body) payload.slug = salesPageSlug(body.slug);
  if (!partial || "product_id" in body) payload.product_id = text(body.product_id, "", 80);
  if ("is_published" in body) payload.is_published = Boolean(body.is_published);
  if ("meta_pixel_id" in body) {
    const pixelId = text(body.meta_pixel_id, "", 40);
    if (pixelId && !/^\d{5,25}$/.test(pixelId)) return { error: "Meta Pixel ID must contain numbers only" };
    payload.meta_pixel_id = pixelId || null;
  }
  if (!partial || "config" in body) payload.config = normalizeSalesPageConfig(body.config);

  if (!partial && (!payload.name || !payload.slug || !payload.product_id)) {
    return { error: "Page name, slug, and product are required" };
  }
  if ("name" in payload && !payload.name) return { error: "Page name is required" };
  if ("slug" in payload && !payload.slug) return { error: "A valid slug is required" };
  if ("product_id" in payload && !payload.product_id) return { error: "Product is required" };
  return { payload };
}

export async function getSalesPageBySlug(slug: string, publishedOnly = true): Promise<SalesPage | null> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("sales_pages")
    .select("*, product:products(id,name,slug,price,compare_at_price,description,images,stock,is_active)")
    .eq("slug", slug);
  if (publishedOnly) query = query.eq("is_published", true);
  const { data, error } = await query.maybeSingle();
  if (error || !data || !data.product || (publishedOnly && data.product.is_active === false)) return null;
  return { ...data, config: normalizeSalesPageConfig(data.config) } as SalesPage;
}

export async function getPublishedSalesPage(slug: string) {
  return getSalesPageBySlug(slug, true);
}

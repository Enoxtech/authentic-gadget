"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, FilePlus2, Layers3, Link2, Pencil, Trash2 } from "lucide-react";
import { DEFAULT_SALES_PAGE_CONFIG, type SalesPage, type SalesPageProduct } from "@/types/sales-page";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminSalesPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<SalesPage[]>([]);
  const [products, setProducts] = useState<SalesPageProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ name: "", slug: "", product_id: "" });

  async function load() {
    const response = await fetch("/api/admin/sales-pages");
    if (response.status === 401) return router.push("/admin/login");
    const data = (await response.json()) as { pages?: SalesPage[]; products?: SalesPageProduct[]; error?: string };
    if (!response.ok) throw new Error(data.error || "Unable to load sales pages");
    setPages(data.pages || []);
    setProducts(data.products || []);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Unable to load sales pages")).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === draft.product_id),
    [products, draft.product_id]
  );

  async function createPage(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.product_id) return setError("Choose a product and enter a page name.");
    setBusy("create");
    setError("");
    try {
      const response = await fetch("/api/admin/sales-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          slug: draft.slug || slugify(draft.name),
          config: {
            ...DEFAULT_SALES_PAGE_CONFIG,
            headline: selectedProduct?.name ? `Get ${selectedProduct.name} with confidence.` : DEFAULT_SALES_PAGE_CONFIG.headline,
            subheadline: selectedProduct?.name ? `Order ${selectedProduct.name} from a trusted Ghanaian gadget store, with clear payment and delivery options.` : DEFAULT_SALES_PAGE_CONFIG.subheadline,
            description: selectedProduct?.name ? `Present the strongest reasons to choose ${selectedProduct.name}, then edit this section with the product's specific features and offer details.` : DEFAULT_SALES_PAGE_CONFIG.description,
            heroImageUrl: selectedProduct?.images?.[0] || "",
          },
        }),
      });
      const data = (await response.json()) as { page?: SalesPage; error?: string };
      if (!response.ok || !data.page) throw new Error(data.error || "Unable to create sales page");
      router.push(`/admin/sales-pages/${data.page.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create sales page");
    } finally {
      setBusy("");
    }
  }

  async function duplicate(id: string) {
    setBusy(id);
    try {
      const response = await fetch("/api/admin/sales-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duplicateFrom: id }),
      });
      const data = (await response.json()) as { page?: SalesPage; error?: string };
      if (!response.ok || !data.page) throw new Error(data.error || "Unable to duplicate page");
      router.push(`/admin/sales-pages/${data.page.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to duplicate page");
    } finally {
      setBusy("");
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    setBusy(id);
    const response = await fetch(`/api/admin/sales-pages/${id}`, { method: "DELETE" });
    if (response.ok) setPages((items) => items.filter((item) => item.id !== id));
    else setError("Unable to delete sales page.");
    setBusy("");
  }

  return (
    <div className="admin-sales-pages p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Sales Pages</h1>
        <p className="text-sm text-charcoal/50">Create reusable product landing pages with built-in order forms.</p>
      </div>

      {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <form onSubmit={createPage} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 flex items-center gap-2 text-white">
          <FilePlus2 className="h-5 w-5 text-[#D4A843]" />
          <h2 className="font-bold">Create a sales page</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Page name" className="admin-input" />
          <input value={draft.slug} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} placeholder="public-url-slug" className="admin-input" />
          <select value={draft.product_id} onChange={(e) => setDraft((d) => ({ ...d, product_id: e.target.value }))} className="admin-input">
            <option value="">Choose product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
        <button disabled={busy === "create"} className="mt-4 rounded-xl bg-electric px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {busy === "create" ? "Creating..." : "Create & Edit"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-white/50">Loading sales pages...</p>
      ) : pages.length === 0 ? (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
          <Layers3 className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No sales pages yet.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {pages.map((page) => (
            <article key={page.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-bold text-white">{page.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${page.is_published ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {page.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-white/45">/sales/{page.slug}</p>
                  <p className="mt-2 text-sm text-white/65">{page.product?.name || "Product unavailable"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/sales-pages/${page.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-electric px-3 py-2 text-xs font-bold text-white"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                <button onClick={() => duplicate(page.id)} disabled={busy === page.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-2 text-xs font-bold text-white"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/sales/${page.slug}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-2 text-xs font-bold text-white"><Link2 className="h-3.5 w-3.5" /> Copy Link</button>
                {page.is_published && <a href={`/sales/${page.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-2 text-xs font-bold text-white"><ExternalLink className="h-3.5 w-3.5" /> View</a>}
                <button onClick={() => remove(page.id, page.name)} disabled={busy === page.id} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

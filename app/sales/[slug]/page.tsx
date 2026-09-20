import { notFound } from "next/navigation";
import SalesPageView from "@/components/sales/SalesPageView";
import { getPublishedSalesPage } from "@/lib/sales-pages";
import { getSettings } from "@/lib/settings";

export default async function PublicSalesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPublishedSalesPage(slug), getSettings().catch(() => null)]);
  if (!page) notFound();
  return <SalesPageView page={page} conversionEvent={settings?.meta_conversion_event || ""} />;
}

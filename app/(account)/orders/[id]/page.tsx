import { redirect } from "next/navigation";

export default async function LegacyOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/track-order?order=${encodeURIComponent(id)}`);
}

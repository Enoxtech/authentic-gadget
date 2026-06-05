"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Trash2, Search } from "lucide-react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  products?: { name: string };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? "text-gold fill-gold" : "text-charcoal/20"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadReviews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadReviews() {
    try {
      const response = await fetch("/api/admin/reviews");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to load reviews");
      const data = (await response.json()) as { reviews?: Review[] };
      setReviews(data.reviews || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/reviews/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filtered = reviews.filter((r) =>
    !search ||
    r.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Reviews</h2>
          <p className="text-sm text-charcoal/50">{reviews.length} reviews</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search by product or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal/40">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-charcoal/40">No reviews found</div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-charcoal/50 text-left border-b border-fog">
                  <th className="pb-3 px-6 font-medium">Product</th>
                  <th className="pb-3 px-6 font-medium">Customer</th>
                  <th className="pb-3 px-6 font-medium">Rating</th>
                  <th className="pb-3 px-6 font-medium">Comment</th>
                  <th className="pb-3 px-6 font-medium">Date</th>
                  <th className="pb-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                    <td className="py-3.5 px-6 font-medium text-charcoal">{r.products?.name || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{r.customer_name || "-"}</td>
                    <td className="py-3.5 px-6">
                      <StarRating rating={r.rating || 0} />
                    </td>
                    <td className="py-3.5 px-6 text-charcoal/70 max-w-xs truncate">{r.comment || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/50">{formatDate(r.created_at)}</td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => deleteReview(r.id)}
                        disabled={deleting === r.id}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-fog md:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal">{r.products?.name || "-"}</p>
                    <p className="mt-1 text-sm text-charcoal/60">{r.customer_name || "-"}</p>
                  </div>
                  <button
                    onClick={() => deleteReview(r.id)}
                    disabled={deleting === r.id}
                    className="p-2 hover:bg-red-50 rounded-lg text-charcoal/40 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <StarRating rating={r.rating || 0} />
                  <p className="mt-2 text-sm text-charcoal/70">{r.comment || "-"}</p>
                  <p className="mt-2 text-xs text-charcoal/40">{formatDate(r.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

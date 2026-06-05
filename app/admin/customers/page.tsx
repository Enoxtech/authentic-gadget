"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  created_at: string;
  order_count?: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadCustomers() {
    try {
      const response = await fetch("/api/admin/customers");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to load customers");
      const data = (await response.json()) as { customers?: Customer[] };
      setCustomers(data.customers || []);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filtered = customers.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Customers</h2>
          <p className="text-sm text-charcoal/50">{customers.length} customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-fog rounded-xl text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-electric/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-charcoal/40">Loading customers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-charcoal/40">No customers found</div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-charcoal/50 text-left border-b border-fog">
                  <th className="pb-3 px-6 font-medium">Name</th>
                  <th className="pb-3 px-6 font-medium">Email</th>
                  <th className="pb-3 px-6 font-medium">Phone</th>
                  <th className="pb-3 px-6 font-medium">Region</th>
                  <th className="pb-3 px-6 font-medium">Orders</th>
                  <th className="pb-3 px-6 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-fog last:border-0 hover:bg-fog/50">
                    <td className="py-3.5 px-6 font-medium text-charcoal">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-electric/10 flex items-center justify-center shrink-0">
                          <span className="text-electric text-sm font-bold">{(c.name || "?").charAt(0).toUpperCase()}</span>
                        </div>
                        {c.name || "-"}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-charcoal/70">{c.email || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{c.phone || "-"}</td>
                    <td className="py-3.5 px-6 text-charcoal/70">{c.region || "-"}</td>
                    <td className="py-3.5 px-6">
                      <span className="font-medium text-charcoal">{c.order_count ?? 0}</span>
                    </td>
                    <td className="py-3.5 px-6 text-charcoal/50">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-fog md:hidden">
            {filtered.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-electric/10 flex items-center justify-center shrink-0">
                    <span className="text-electric text-sm font-bold">{(c.name || "?").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-charcoal truncate">{c.name || "-"}</p>
                    <p className="mt-1 text-sm text-charcoal/60 truncate">{c.email || "-"}</p>
                    <p className="mt-2 text-xs text-charcoal/40">
                      {c.order_count ?? 0} orders - Joined {formatDate(c.created_at)}
                    </p>
                  </div>
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

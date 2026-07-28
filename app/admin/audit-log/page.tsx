"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollText } from "lucide-react";

interface AuditLogRow {
  id: string;
  admin_name: string | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-600",
  login: "bg-fog text-charcoal/60",
};

export default function AuditLogPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

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
        return fetch("/api/audit-log")
          .then((r) => (r.ok ? r.json() : []))
          .then(setLogs)
          .finally(() => setLoading(false));
      });
  }, [router]);

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <ScrollText className="h-5 w-5 text-charcoal/40" />
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Audit Log</h1>
          <p className="text-sm text-charcoal/50">Most recent 100 admin actions</p>
        </div>
      </div>

      <div className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-fog/60">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-charcoal/40">When</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-charcoal/40">Admin</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-charcoal/40">Action</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-charcoal/40">Entity</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wide text-charcoal/40 hidden md:table-cell">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-charcoal/40">Loading…</td></tr>
              )}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-charcoal/40">No admin actions logged yet</td></tr>
              )}
              {!loading && logs.map((log) => (
                <tr key={log.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3 text-charcoal/60 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-charcoal">
                    <div className="font-medium">{log.admin_name || "Admin"}</div>
                    {log.admin_email && <div className="text-xs text-charcoal/40">{log.admin_email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[log.action] || "bg-fog text-charcoal/60"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/60">
                    {log.entity_type}
                    {log.entity_id && <span className="text-charcoal/30"> · {log.entity_id.slice(0, 8)}</span>}
                  </td>
                  <td className="px-4 py-3 text-charcoal/40 hidden md:table-cell">{log.ip || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download, FileText, TrendingUp, ShoppingBag, Users, DollarSign,
  Package, ExternalLink, MessageCircle, Eye,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface Order { id: string; customer_name: string; total: number; order_status: string; created_at: string; }
interface Product { id: string; name: string; price: number; stock: number; images: string[]; }
interface MonthBucket { month: string; revenue: number; orders: number; }
interface StatusSlice { label: string; value: number; color: string; }
interface RevenueBar { label: string; value: number; pct: number; }

interface DashboardData {
  stats: { totalRevenue: number; totalOrders: number; totalProducts: number; totalCustomers: number };
  recentOrders: Order[];
  topProducts: Product[];
}

interface AnalyticsData {
  monthly: MonthBucket[];
  statusBreakdown: StatusSlice[];
  topProducts: RevenueBar[];
  topCategories: RevenueBar[];
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  processing: "bg-blue-500/15 text-blue-400",
  shipped: "bg-purple-500/15 text-purple-400",
  delivered: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
};

/* ─── SVG Area Chart ──────────────────────────────────────────── */
function AreaChart({ data }: { data: MonthBucket[] }) {
  const W = 560; const H = 160;
  const PAD = { t: 18, r: 10, b: 32, l: 54 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  const px = (i: number) => PAD.l + (i / Math.max(data.length - 1, 1)) * cW;
  const py = (v: number) => PAD.t + cH - (v / maxRev) * cH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(d.revenue).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${px(data.length - 1).toFixed(1)} ${(PAD.t + cH).toFixed(1)} L ${px(0).toFixed(1)} ${(PAD.t + cH).toFixed(1)} Z`;
  const yTicks = [0, maxRev * 0.5, maxRev];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4A843" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#D4A843" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4,4"} />
          <text x={PAD.l - 6} y={py(v) + 4} textAnchor="end" fill="#6B7280" fontSize="9" fontFamily="monospace">
            {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : "0"}
          </text>
        </g>
      ))}
      {data.map((_, i) => (
        <line key={i} x1={px(i)} x2={px(i)} y1={PAD.t} y2={PAD.t + cH} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#D4A843" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(d.revenue)} r="5" fill="#06112B" stroke="#D4A843" strokeWidth="2" />
          <text x={px(i)} y={H - 6} textAnchor="middle" fill="#6B7280" fontSize="9.5" fontFamily="sans-serif">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── SVG Donut Chart ─────────────────────────────────────────── */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function arcPath(cx: number, cy: number, r: number, ir: number, a1: number, a2: number) {
  const s = polar(cx, cy, r, a1); const e = polar(cx, cy, r, a2);
  const si = polar(cx, cy, ir, a1); const ei = polar(cx, cy, ir, a2);
  const lg = a2 - a1 > 180 ? 1 : 0;
  return `M${s.x.toFixed(2)},${s.y.toFixed(2)} A${r},${r} 0 ${lg},1 ${e.x.toFixed(2)},${e.y.toFixed(2)} L${ei.x.toFixed(2)},${ei.y.toFixed(2)} A${ir},${ir} 0 ${lg},0 ${si.x.toFixed(2)},${si.y.toFixed(2)}Z`;
}

function DonutChart({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 90; const cy = 90; const r = 74; const ir = 48;
  const slices = data.reduce<{ label: string; color: string; a1: number; a2: number }[]>((acc, d) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].a2 : 0;
    const sweep = (d.value / total) * 359.99;
    acc.push({ label: d.label, color: d.color, a1: prevEnd, a2: prevEnd + sweep });
    return acc;
  }, []);
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0">
        {slices.map((s) => (
          <path key={s.label} d={arcPath(cx, cy, r, ir, s.a1, s.a2)} fill={s.color} stroke="#06112B" strokeWidth="2.5" />
        ))}
        <circle cx={cx} cy={cy} r={ir - 2} fill="#06112B" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#F0EDE6" fontSize="22" fontWeight="800" fontFamily="monospace">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#6B7280" fontSize="8.5" fontFamily="sans-serif" letterSpacing="1">TOTAL ORDERS</text>
      </svg>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {data.length === 0 && <p className="text-xs text-gray-500">No orders yet</p>}
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-gray-400 font-display flex-1">{d.label}</span>
            <span className="font-mono font-bold text-gray-200 tabular-nums">{d.value}</span>
            <span className="text-gray-600 font-mono w-8 text-right">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sparkline ───────────────────────────────────────────────── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <svg viewBox="0 0 72 26" className="w-[72px] h-6 shrink-0" />;
  const max = Math.max(...values); const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 72;
    const y = 24 - ((v - min) / range) * 20;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg viewBox="0 0 72 26" className="w-[72px] h-6 shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Horizontal bar ──────────────────────────────────────────── */
function HorizBar({ label, pct, value, color }: { label: string; pct: number; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 font-display w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.85 }} />
      </div>
      <span className="text-xs font-mono font-bold text-gray-300 tabular-nums w-16 text-right shrink-0">
        {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
      </span>
    </div>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, trend, sparkValues, color }: {
  label: string; value: string; sub: string; icon: React.ElementType;
  trend: number; sparkValues: number[]; color: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-2xl border p-5 flex flex-col gap-3" style={{ background: "#0B1E3D", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}1A` }}>
          <Icon className="h-4 w-4 shrink-0" style={{ color }} />
        </div>
        <Sparkline values={sparkValues} color={color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-display tabular-nums">{value}</p>
        <p className="text-[10px] font-label uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-xs font-bold font-mono", up ? "text-green-400" : "text-red-400")}>
          {up ? "+" : ""}{trend}%
        </span>
        <span className="text-[10px] text-gray-600 font-display truncate">{sub}</span>
      </div>
    </div>
  );
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/* ─── CSV / PDF download ──────────────────────────────────────── */
function dlCSV(orders: Order[], monthly: MonthBucket[]) {
  const rows = [
    ["Order ID", "Customer", "Total (GHS)", "Status", "Date"],
    ...orders.map((o) => [o.id, o.customer_name, o.total, o.order_status, o.created_at]),
    [],
    ["Month", "Orders", "Revenue (GHS)", "Avg Order Value (GHS)"],
    ...monthly.map((m) => [m.month, m.orders, m.revenue, m.orders > 0 ? Math.round(m.revenue / m.orders) : 0]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `authentic-gadget-sales-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dlPDF(orders: Order[], monthly: MonthBucket[]) {
  const orderRows = orders.slice(0, 20).map((o) =>
    `<tr><td>${o.id}</td><td>${o.customer_name || "-"}</td><td>${formatPrice(o.total)}</td><td style="text-transform:capitalize">${o.order_status}</td><td>${new Date(o.created_at).toLocaleDateString()}</td></tr>`
  ).join("");
  const monthRows = monthly.map((m) =>
    `<tr><td>${m.month}</td><td>${m.orders}</td><td>${formatPrice(m.revenue)}</td><td>${formatPrice(m.orders > 0 ? Math.round(m.revenue / m.orders) : 0)}</td></tr>`
  ).join("");
  const totalRev = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrd = monthly.reduce((s, m) => s + m.orders, 0);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sales Report - Authentic Gadget</title>
<style>
body{font-family:Helvetica,Arial,sans-serif;padding:28px;color:#1a1a1a;font-size:13px}
h1{color:#06112B;margin:0 0 3px;font-size:21px}
.sub{color:#888;font-size:12px;margin-bottom:22px}
h2{font-size:13px;font-weight:700;margin:22px 0 7px;padding-bottom:4px;border-bottom:2px solid #D4A843;color:#333}
table{width:100%;border-collapse:collapse;font-size:12px}
th{background:#f5f3f0;padding:7px 9px;text-align:left;font-weight:700;color:#444;border-bottom:2px solid #ddd}
td{padding:6px 9px;border-bottom:1px solid #eee}
tr:nth-child(even){background:#fafaf9}
.kpi{display:flex;gap:14px;margin-bottom:18px;flex-wrap:wrap}
.kc{flex:1;min-width:110px;background:#faf8f6;border-radius:8px;padding:12px;border-left:3px solid #D4A843}
.kv{font-size:19px;font-weight:800;color:#06112B}
.kl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:2px}
</style></head><body>
<h1>Sales Report &#8212; Authentic Gadget</h1>
<p class="sub">Generated ${new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
<div class="kpi">
<div class="kc"><div class="kv">${formatPrice(totalRev)}</div><div class="kl">Total Revenue</div></div>
<div class="kc"><div class="kv">${totalOrd}</div><div class="kl">Total Orders</div></div>
<div class="kc"><div class="kv">${formatPrice(totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0)}</div><div class="kl">Avg Order Value</div></div>
</div>
<h2>Monthly Revenue Breakdown</h2>
<table><thead><tr><th>Month</th><th>Orders</th><th>Revenue</th><th>Avg. Order Value</th></tr></thead><tbody>${monthRows}</tbody></table>
<h2>Recent Order History</h2>
<table><thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${orderRows}</tbody></table>
</body></html>`;
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 400);
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adminSession = document.cookie.includes("admin_session_client");
    if (!adminSession) {
      router.push("/admin/login");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadData() {
    setError(null);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/dashboard"),
        fetch("/api/admin/analytics"),
      ]);
      if (dashRes.status === 401 || analyticsRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      const dashJson = (await dashRes.json()) as DashboardData & { error?: string };
      const analyticsJson = (await analyticsRes.json()) as AnalyticsData & { error?: string };
      if (!dashRes.ok) throw new Error(dashJson.error || "Failed to load dashboard");
      if (!analyticsRes.ok) throw new Error(analyticsJson.error || "Failed to load analytics");

      setData(dashJson);
      setAnalytics(analyticsJson);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  const card = "rounded-2xl border p-5";
  const cardStyle = { background: "#0B1E3D", borderColor: "rgba(255,255,255,0.06)" };
  const sectionLabel = "text-[10px] font-label uppercase tracking-widest text-gray-500 mb-4";

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <button onClick={() => { setLoading(true); loadData(); }} className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || !data || !analytics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={cardStyle}>
              <div className="h-4 w-24 bg-white/10 rounded mb-4" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentOrders, topProducts: stockProducts } = data;
  const { monthly, statusBreakdown, topProducts, topCategories } = analytics;
  const revenueSeries = monthly.map((m) => m.revenue);
  const ordersSeries = monthly.map((m) => m.orders);
  const lastMonth = monthly[monthly.length - 1] || { revenue: 0, orders: 0 };
  const prevMonth = monthly[monthly.length - 2] || { revenue: 0, orders: 0 };
  const lowStock = stockProducts.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStock = stockProducts.filter((p) => p.stock === 0).length;
  const totalRevenuePeriod = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrdersPeriod = monthly.reduce((s, m) => s + m.orders, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-display">
            Authentic Gadget · {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => dlCSV(recentOrders, monthly)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: "#10B981" }}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => dlPDF(recentOrders, monthly)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer"
            style={{ background: "#19AFFF" }}>
            <FileText className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatPrice(stats.totalRevenue)}
          sub="vs last month" icon={DollarSign} trend={pctChange(lastMonth.revenue, prevMonth.revenue)}
          sparkValues={revenueSeries} color="#D4A843" />
        <KpiCard label="Total Orders" value={String(stats.totalOrders)}
          sub="vs last month" icon={ShoppingBag} trend={pctChange(lastMonth.orders, prevMonth.orders)}
          sparkValues={ordersSeries} color="#19AFFF" />
        <KpiCard label="Avg Order Value" value={formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
          sub="all time" icon={TrendingUp} trend={0}
          sparkValues={revenueSeries.map((r, i) => (ordersSeries[i] > 0 ? r / ordersSeries[i] : 0))} color="#8B5CF6" />
        <KpiCard label="Customers" value={String(stats.totalCustomers)}
          sub="registered" icon={Users} trend={0}
          sparkValues={ordersSeries} color="#10B981" />
      </div>

      {/* Alerts */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex flex-wrap gap-3">
          {outOfStock > 0 && (
            <Link href="/admin/products" className={cn(card, "flex items-center gap-3 py-3 hover:opacity-80 transition-opacity")}
              style={{ ...cardStyle, borderColor: "rgba(239,68,68,0.3)" }}>
              <Package className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-sm font-display text-red-300">{outOfStock} product{outOfStock > 1 ? "s" : ""} out of stock</span>
              <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
            </Link>
          )}
          {lowStock > 0 && (
            <Link href="/admin/products" className={cn(card, "flex items-center gap-3 py-3 hover:opacity-80 transition-opacity")}
              style={{ ...cardStyle, borderColor: "rgba(245,158,11,0.3)" }}>
              <Package className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm font-display text-amber-300">{lowStock} product{lowStock > 1 ? "s" : ""} running low</span>
              <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* Revenue chart + Donut */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className={cn(card, "lg:col-span-3")} style={cardStyle}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <p className={sectionLabel}>Revenue Trend — Last 7 Months</p>
              <p className="text-2xl font-bold text-white font-display tabular-nums">{formatPrice(totalRevenuePeriod)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-label uppercase tracking-widest text-gray-600">{totalOrdersPeriod} total orders</p>
              <p className="text-xs text-gray-500 font-display mt-0.5">
                Avg {formatPrice(totalOrdersPeriod > 0 ? Math.round(totalRevenuePeriod / totalOrdersPeriod) : 0)} / order
              </p>
            </div>
          </div>
          <AreaChart data={monthly} />
        </div>

        <div className={cn(card, "lg:col-span-2")} style={cardStyle}>
          <p className={sectionLabel}>Order Status Breakdown</p>
          <DonutChart data={statusBreakdown} />
        </div>
      </div>

      {/* Top Products + Category Revenue */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className={sectionLabel}>Top Products by Revenue</p>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-500">No sales yet</p>
            ) : (
              topProducts.map((p) => (
                <HorizBar key={p.label} label={p.label} pct={p.pct} value={p.value} color="#D4A843" />
              ))
            )}
          </div>
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold mt-4 hover:opacity-75 transition-opacity font-display">
            Manage Products <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className={card} style={cardStyle}>
          <p className={sectionLabel}>Revenue by Category</p>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-xs text-gray-500">No sales yet</p>
            ) : (
              topCategories.map((c, i) => (
                <HorizBar key={c.label} label={c.label} pct={c.pct} value={c.value}
                  color={["#D4A843", "#19AFFF", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"][i]} />
              ))
            )}
          </div>
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-gold font-semibold mt-4 hover:opacity-75 transition-opacity font-display">
            Manage Categories <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={card} style={cardStyle}>
        <p className={sectionLabel}>Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/banners", label: "Edit Hero Banners", desc: "Update homepage slider", color: "#D4A843" },
            { href: "/admin/products", label: "Add Product", desc: "List a new item", color: "#19AFFF" },
            { href: "/admin/orders", label: "View Orders", desc: "Process pending orders", color: "#10B981" },
            { href: "/admin/customers", label: "View Customers", desc: "See who's buying", color: "#8B5CF6" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex flex-col gap-1 p-4 rounded-xl border hover:bg-white/5 transition-colors"
              style={{ borderColor: `${a.color}22` }}>
              <span className="text-sm font-bold font-display" style={{ color: a.color }}>{a.label}</span>
              <span className="text-[10px] text-gray-500 font-display">{a.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* WhatsApp Broadcast */}
      <div className={card} style={{ ...cardStyle, borderColor: "rgba(34,197,94,0.2)" }}>
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-4 w-4 text-green-400" />
          <p className="text-sm font-bold text-gray-200 font-display">WhatsApp Broadcast</p>
        </div>
        <p className="text-xs text-gray-500 font-display mb-4">Send a promo or announcement to your business WhatsApp for sharing with customers.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea id="broadcast-msg" rows={2} placeholder="e.g. 🎉 Weekend deal! 10% off all smartphones. Use code GADGET10 at checkout..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-display border focus:outline-none focus:border-green-500 text-gray-200 resize-none"
            style={{ background: "#06112B", borderColor: "rgba(255,255,255,0.08)" }} />
          <button onClick={() => {
            const el = document.getElementById("broadcast-msg") as HTMLTextAreaElement;
            const msg = el?.value.trim(); if (!msg) return;
            window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent(msg)}`, "_blank");
          }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            style={{ background: "#16A34A" }}>
            <MessageCircle className="h-4 w-4" /> Send
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={card} style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <p className={cn(sectionLabel, "mb-0")}>Recent Orders</p>
          <Link href="/admin/orders" className="text-xs text-gold font-semibold font-display hover:opacity-75 transition-opacity">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {["Order", "Customer", "Total", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-[10px] font-label uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4"><span className="font-mono text-xs font-bold text-gray-300">#{String(o.id).slice(0, 8)}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-display text-gray-300">{o.customer_name || "-"}</span></td>
                    <td className="py-3 pr-4"><span className="text-xs font-mono font-bold text-gray-200 tabular-nums">{formatPrice(o.total)}</span></td>
                    <td className="py-3 pr-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-label", STATUS_BADGE[o.order_status] ?? "")}>
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[10px] text-gray-500 font-label">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/orders/${o.id}`} className="inline-flex p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-gold">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

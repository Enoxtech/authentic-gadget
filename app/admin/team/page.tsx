"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Save, X, Trash2, ShieldCheck, Headset, Package } from "lucide-react";

type AdminRole = "super_admin" | "support" | "product_manager";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  support: "Support",
  product_manager: "Product Manager",
};

const ROLE_ICONS: Record<AdminRole, React.ElementType> = {
  super_admin: ShieldCheck,
  support: Headset,
  product_manager: Package,
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "Full access to everything, including settings and admin accounts.",
  support: "Can view/update orders and customers; products & categories are read-only.",
  product_manager: "Can manage products, categories, banners, coupons, and delivery areas. Orders are read-only.",
};

const inputCls = "w-full rounded-xl px-3.5 py-2.5 text-sm bg-fog text-charcoal border-0 focus:outline-none focus:ring-2 focus:ring-electric/30";

function AdminRow({ admin, isSelf, onChanged }: { admin: AdminUserRow; isSelf: boolean; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(admin.role);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const Icon = ROLE_ICONS[admin.role];

  async function save() {
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin-users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...(password ? { password } : {}) }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Failed to save" }));
      setError(msg);
      return;
    }
    setPassword("");
    setEditing(false);
    onChanged();
  }

  async function toggleActive() {
    setError("");
    const res = await fetch(`/api/admin-users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !admin.active }),
    });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Failed to update" }));
      setError(msg);
      return;
    }
    onChanged();
  }

  async function remove() {
    if (!confirm(`Remove admin account "${admin.name}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin-users/${admin.id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Failed to delete" }));
      setError(msg);
      return;
    }
    onChanged();
  }

  return (
    <div className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="h-10 w-10 rounded-full bg-electric text-white flex items-center justify-center text-sm font-bold shrink-0">
          {admin.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-charcoal truncate">{admin.name}</p>
            {isSelf && <span className="text-[10px] text-charcoal/40">(you)</span>}
            {!admin.active && (
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-600">Deactivated</span>
            )}
          </div>
          <p className="text-xs text-charcoal/40 truncate">{admin.email}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Icon className="h-3 w-3 text-charcoal/40" />
            <p className="text-[10px] text-charcoal/40 uppercase tracking-wide">{ROLE_LABELS[admin.role]}</p>
            {admin.last_login_at && (
              <p className="text-[10px] text-charcoal/30">· last login {new Date(admin.last_login_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing(!editing)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal/60 hover:bg-fog hover:text-electric transition-colors">
            Edit
          </button>
          {!isSelf && (
            <>
              <button onClick={toggleActive} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal/60 hover:bg-fog hover:text-electric transition-colors">
                {admin.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={remove} className="p-2 rounded-lg text-charcoal/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t border-fog p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} disabled={isSelf} className={`${inputCls} ${isSelf ? "opacity-40 cursor-not-allowed" : ""}`}>
              {(["super_admin", "support", "product_manager"] as AdminRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Reset Password (optional)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(false); setRole(admin.role); setPassword(""); setError(""); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTeamPage() {
  const router = useRouter();
  const [selfId, setSelfId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "support" as AdminRole });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin-users")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAdmins)
      .finally(() => setLoading(false));
  }, []);

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
        setSelfId(me.id);
        setAuthorized(true);
        load();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    setCreating(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Failed to create admin" }));
      setCreateError(error);
      return;
    }
    setCreateForm({ name: "", email: "", password: "", role: "support" });
    setShowCreate(false);
    load();
  }

  if (authorized !== true) {
    return <div className="p-8 text-sm text-charcoal/50">{authorized === false ? "Redirecting…" : "Loading…"}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Admin Team</h1>
          <p className="text-sm text-charcoal/50">Manage admin accounts and access levels</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-electric hover:bg-electric/90 transition-colors">
          <UserPlus className="h-4 w-4" /> Add Admin
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {(["super_admin", "support", "product_manager"] as AdminRole[]).map((r) => {
          const Icon = ROLE_ICONS[r];
          return (
            <div key={r} className="bg-white rounded-[20px] card-premium border border-[var(--border-color)] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4 w-4 text-electric" />
                <p className="text-sm font-bold text-charcoal">{ROLE_LABELS[r]}</p>
              </div>
              <p className="text-xs text-charcoal/50 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-[28px] card-premium border border-[var(--border-color)] p-5 space-y-4">
          <h2 className="font-bold text-charcoal text-sm">New Admin Account</h2>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Name</label>
              <input required value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Email</label>
              <input required type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Password</label>
              <input required type="password" minLength={8} value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-charcoal/40 mb-1">Role</label>
              <select value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as AdminRole }))} className={inputCls}>
                {(["super_admin", "support", "product_manager"] as AdminRole[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-electric disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {creating ? "Creating…" : "Create Admin"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-charcoal/60 hover:bg-fog">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && <p className="text-sm text-charcoal/50">Loading…</p>}
        {!loading && admins.map((admin) => (
          <AdminRow key={admin.id} admin={admin} isSelf={admin.id === selfId} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

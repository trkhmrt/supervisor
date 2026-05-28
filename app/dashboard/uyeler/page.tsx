"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserCheck, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  profession?: string;
  experienceYears?: number;
  license?: string;
};

export default function DashboardMembersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? "Liste yüklenemedi.");
      }
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const toggleVerified = async (u: AdminUser) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailVerified: !u.emailVerified }),
    });
    await reload();
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="h2-premium text-3xl">Üyeler</h1>
          <p className="mt-2 text-sm text-clinical-muted">
            Sitedeki tüm kullanıcılar (danışan, süpervizör, admin).
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
            className="rounded-premium border border-clinical-border bg-white px-3 py-2 text-sm"
          >
            <option value="all">Tümü</option>
            <option value="user">Kullanıcı</option>
            <option value="supervisor">Süpervizör</option>
            <option value="admin">Admin</option>
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinical-muted" />
            <input
              placeholder="İsim veya e-posta ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-premium border border-clinical-border bg-white py-2 pl-10 pr-4 text-sm focus:border-navy-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : (
        <div className="overflow-hidden rounded-premium border border-clinical-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-clinical-border bg-clinical-light">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Rol
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Meslek
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    E-posta Doğrulama
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    Kayıt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-clinical-light/40">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-navy-900">{u.fullName}</div>
                      <div className="text-xs text-clinical-muted">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase">{u.role}</td>
                    <td className="px-6 py-4 text-xs text-clinical-muted">
                      {u.profession ?? "—"}
                      {u.experienceYears != null && ` · ${u.experienceYears} yıl`}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void toggleVerified(u)}
                        className={`flex items-center gap-1 text-xs font-bold uppercase ${
                          u.emailVerified ? "text-green-600" : "text-clinical-muted"
                        }`}
                      >
                        <UserCheck className="h-4 w-4" />
                        {u.emailVerified ? "Doğrulandı" : "Doğrula"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-clinical-muted">
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Shield, UserCheck, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
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

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const toggleVerified = async (u: AdminUser) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailVerified: !u.emailVerified }),
    });
    await reload();
  };

  return (
    <AdminShell>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <h1 className="h2-premium text-3xl">Kullanıcı Yönetimi</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinical-muted" />
          <input
            placeholder="İsim veya e-posta ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded-premium border border-clinical-border bg-white py-2 pl-10 pr-4 text-sm focus:border-navy-900 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-clinical-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : (
        <div className="overflow-hidden rounded-premium border border-clinical-border bg-white shadow-sm">
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
                  Meslek / Lisans
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  E-posta
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                  Kayıt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">
                    <div className="text-xs text-clinical-muted">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold uppercase">{u.role}</td>
                  <td className="px-6 py-4 text-xs text-clinical-muted">
                    {u.profession ?? "—"}
                    {u.experienceYears != null && ` · ${u.experienceYears} yıl`}
                    {u.license && <div className="mt-1">{u.license}</div>}
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
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

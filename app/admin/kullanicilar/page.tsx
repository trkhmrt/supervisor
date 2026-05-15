"use client";

import { useState } from "react";
import { Users, Search, Filter, Mail, Shield, UserCheck, MoreVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AdminUsers() {
  const users = useAppStore((s) => s.users);
  const [query, setQuery] = useState("");

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
         <h1 className="h2-premium text-3xl">Kullanıcı Yönetimi</h1>
         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-clinical-muted" />
               <input
                 placeholder="İsim veya e-posta ara..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="bg-white border border-clinical-border rounded-premium pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-navy-900 w-64"
               />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-premium border border-clinical-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clinical-light border-b border-clinical-border">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Kullanıcı Bilgileri</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Rol</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Durum</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted">Kayıt Tarihi</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-clinical-muted text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-clinical-light/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 font-bold text-xs uppercase">
                          {u.fullName.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <div className="text-sm font-bold text-navy-900">{u.fullName}</div>
                          <div className="text-xs text-clinical-muted mt-0.5">{u.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                      u.role === 'admin' ? 'border-black/15 bg-[#f1f0f0] text-black' : 
                      u.role === 'supervisor' ? 'bg-navy-900 text-white border-navy-900' : 
                      'bg-navy-50 text-navy-700 border-navy-100'
                    }`}>
                      {u.role === 'admin' && <Shield className="h-3 w-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.emailVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 uppercase tracking-widest">
                         <UserCheck className="h-4 w-4" /> Doğrulanmış
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-clinical-muted uppercase tracking-widest">Onay Bekliyor</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-clinical-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-clinical-muted hover:text-navy-900">
                       <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

"use client";

import { useState } from "react";
import { UserPlus, Mail, Send, Check, X, Trash2, ShieldCheck, MoreVertical } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AdminSupervisors() {
  const supervisors = useAppStore((s) => s.supervisors);
  const invites = useAppStore((s) => s.invites);
  const inviteSupervisor = useAppStore((s) => s.inviteSupervisor);
  const removeInvite = useAppStore((s) => s.removeInvite);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteSupervisor(email);
    setEmail("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
         <h1 className="h2-premium text-3xl">Süpervizör Yönetimi</h1>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="card-premium bg-navy-900 text-white border-none">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-white/10 rounded-premium flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
               </div>
               <h3 className="font-bold text-sm uppercase tracking-widest">Yeni Davet Gönder</h3>
            </div>
            <p className="text-navy-300 text-xs leading-relaxed mb-8">
               Süpervizör kayıtları sadece davet usulü ile yapılmaktadır. 
               Adayın e-posta adresini girerek kayıt linki gönderin.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                type="email"
                required
                placeholder="uzman@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-premium px-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-white/30"
              />
              <button type="submit" className="btn-white w-full py-3 text-xs">
                {sent ? <Check className="h-4 w-4" /> : "Davet Gönder"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8">Bekleyen Davetler</h3>
            <div className="divide-y divide-clinical-border">
              {invites.length === 0 ? (
                <p className="py-8 text-center text-clinical-muted text-sm">Bekleyen davet bulunmuyor.</p>
              ) : (
                invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-4 group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-clinical-light rounded-full flex items-center justify-center text-navy-900">
                          <Mail className="h-4 w-4" />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-navy-900">{inv.email}</div>
                          <div className="text-[10px] text-clinical-muted uppercase font-bold tracking-widest mt-1">
                             {formatDate(inv.invitedAt)}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${
                         inv.status === "accepted" ? "bg-green-50 text-green-700 border-green-100" : "bg-amber-50 text-amber-700 border-amber-100"
                       }`}>
                          {inv.status === "accepted" ? "Kabul Edildi" : "Bekliyor"}
                       </span>
                      <button onClick={() => removeInvite(inv.id)} className="p-2 text-clinical-muted transition-colors hover:text-black">
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 card-premium">
             <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8">Aktif Süpervizörler</h3>
             <div className="grid sm:grid-cols-2 gap-4">
                {supervisors.map(s => (
                   <div key={s.id} className="flex items-center gap-4 p-4 bg-clinical-light rounded-premium border border-clinical-border group hover:border-navy-900 transition-all">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm">
                         <img src={s.photo} alt={s.fullName} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-bold text-navy-900">{s.fullName}</div>
                         <div className="text-[10px] text-clinical-muted font-bold uppercase tracking-widest">{s.title}</div>
                      </div>
                      <button className="p-2 text-clinical-muted hover:text-navy-900">
                         <MoreVertical className="h-4 w-4" />
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

"use client";

import { useState } from "react";
import { Mail, Check, Trash2, Download, User, Calendar, MessageSquare, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AdminMessages() {
  const contactMessages = useAppStore((s) => s.contactMessages);
  const newsletter = useAppStore((s) => s.newsletter);
  const markRead = useAppStore((s) => s.markMessageRead);
  const [tab, setTab] = useState<"messages" | "newsletter">("messages");

  const downloadNewsletter = () => {
    const csv = "Email,SubscribedAt\n" + newsletter.map((n) => `${n.email},${n.subscribedAt}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
         <h1 className="h2-premium text-3xl">İletişim & Bülten</h1>
         <div className="flex bg-clinical-light p-1 rounded-premium border border-clinical-border">
            <button
              onClick={() => setTab("messages")}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-premium transition-all ${
                tab === "messages" ? "bg-navy-900 text-white shadow-md" : "text-clinical-muted hover:text-navy-900"
              }`}
            >
              Mesajlar
            </button>
            <button
              onClick={() => setTab("newsletter")}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-premium transition-all ${
                tab === "newsletter" ? "bg-navy-900 text-white shadow-md" : "text-clinical-muted hover:text-navy-900"
              }`}
            >
              Bülten
            </button>
         </div>
      </div>

      {tab === "messages" ? (
        <div className="grid gap-6">
          {contactMessages.length === 0 ? (
            <div className="card-premium py-20 text-center text-clinical-muted">Mesaj bulunmuyor.</div>
          ) : (
            contactMessages.map((m) => (
              <div key={m.id} className={`card-premium transition-all ${!m.read ? "border-navy-900 bg-navy-50/30" : ""}`}>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                         {!m.read && <span className="w-2 h-2 bg-navy-900 rounded-full animate-pulse" />}
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">{m.subject || "Genel İletişim"}</span>
                      </div>
                      <h3 className="text-lg font-bold text-navy-900 mb-4">{m.message}</h3>
                      <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-clinical-muted uppercase tracking-widest">
                         <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-navy-400" />
                            {m.name} ({m.email})
                         </div>
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-navy-400" />
                            {formatDate(m.createdAt)}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      {!m.read && (
                        <button onClick={() => markRead(m.id)} className="btn-navy py-2 px-6 text-[10px] uppercase font-bold tracking-widest">
                           Okundu İşaretle
                        </button>
                      )}
                      <button className="rounded bg-[#f1f0f0] p-2 text-black transition-all hover:bg-black hover:text-white">
                         <Trash2 className="h-4 w-4" />
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card-premium">
          <div className="flex items-center justify-between mb-10">
             <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest">Abone Listesi ({newsletter.length})</h3>
             <button onClick={downloadNewsletter} className="btn-outline-navy py-2 px-4 text-[10px] uppercase font-bold tracking-widest">
                <Download className="h-4 w-4" /> CSV İndir
             </button>
          </div>
          <div className="divide-y divide-clinical-border">
            {newsletter.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-4 group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-clinical-light rounded-full flex items-center justify-center text-navy-900 font-bold text-xs">
                      {n.email[0].toUpperCase()}
                   </div>
                   <div className="text-sm font-bold text-navy-900">{n.email}</div>
                </div>
                <div className="text-[10px] text-clinical-muted font-bold uppercase tracking-widest">
                   {formatDate(n.subscribedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

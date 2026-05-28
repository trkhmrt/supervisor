"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, User, Calendar, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ContactMessage, NewsletterSubscriber } from "@/lib/types";

export default function DashboardMessagesPage() {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [newsletter, setNewsletter] = useState<NewsletterSubscriber[]>([]);
  const [tab, setTab] = useState<"messages" | "newsletter">("messages");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [msgRes, nlRes] = await Promise.all([
        fetch("/api/admin/contact", { credentials: "include" }),
        fetch("/api/admin/newsletter", { credentials: "include" }),
      ]);
      if (msgRes.ok) setContactMessages(await msgRes.json());
      if (nlRes.ok) setNewsletter(await nlRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markRead = async (id: string, read: boolean) => {
    await fetch("/api/admin/contact", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    await reload();
  };

  const downloadNewsletter = () => {
    const csv = "Email,SubscribedAt\n" + newsletter.map((n) => `${n.email},${n.subscribedAt}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="h2-premium text-3xl">İletişim & Bülten</h1>
        <div className="flex rounded-premium border border-clinical-border bg-clinical-light p-1">
          <button
            onClick={() => setTab("messages")}
            className={`rounded-premium px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              tab === "messages" ? "bg-navy-900 text-white shadow-md" : "text-clinical-muted hover:text-navy-900"
            }`}
          >
            Mesajlar
          </button>
          <button
            onClick={() => setTab("newsletter")}
            className={`rounded-premium px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
              tab === "newsletter" ? "bg-navy-900 text-white shadow-md" : "text-clinical-muted hover:text-navy-900"
            }`}
          >
            Bülten
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
        </div>
      ) : tab === "messages" ? (
        <div className="grid gap-6">
          {contactMessages.length === 0 ? (
            <div className="card-premium py-20 text-center text-clinical-muted">Mesaj bulunmuyor.</div>
          ) : (
            contactMessages.map((m) => (
              <div
                key={m.id}
                className={`card-premium transition-all ${!m.read ? "border-navy-900 bg-navy-50/30" : ""}`}
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      {!m.read && <span className="h-2 w-2 animate-pulse rounded-full bg-navy-900" />}
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold">
                        {m.subject || "Genel İletişim"}
                      </span>
                    </div>
                    <h3 className="mb-4 text-lg font-bold text-navy-900">{m.message}</h3>
                    <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-clinical-muted">
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
                      <button
                        onClick={() => void markRead(m.id, true)}
                        className="btn-navy py-2 px-6 text-[10px] uppercase font-bold tracking-widest"
                      >
                        Okundu İşaretle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="card-premium">
          <div className="mb-10 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900">
              Abone Listesi ({newsletter.length})
            </h3>
            <button
              onClick={downloadNewsletter}
              className="btn-outline-navy py-2 px-4 text-[10px] uppercase font-bold tracking-widest"
            >
              <Download className="h-4 w-4" /> CSV İndir
            </button>
          </div>
          <div className="divide-y divide-clinical-border">
            {newsletter.length === 0 ? (
              <p className="py-10 text-center text-sm text-clinical-muted">Abone bulunmuyor.</p>
            ) : (
              newsletter.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-light text-xs font-bold text-navy-900">
                      {n.email[0].toUpperCase()}
                    </div>
                    <div className="text-sm font-bold text-navy-900">{n.email}</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">
                    {formatDate(n.subscribedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

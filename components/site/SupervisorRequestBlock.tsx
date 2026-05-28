"use client";

import { useState } from "react";
import { Send, Loader2, Check, Phone } from "lucide-react";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";

export function SupervisorRequestBlock() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <div className="mt-8 rounded-premium border border-dashed border-clinical-border bg-clinical-light p-6">
        <p className="text-sm text-clinical-muted mb-4">
          Süpervizör olarak platformda yer almak istiyorsanız talep gönderebilirsiniz. Onay sonrası
          kayıt formu e-postanıza iletilir.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline-navy w-full py-2 text-xs"
        >
          Süpervizör olmak için talep gönder
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-8 rounded-premium border border-green-200 bg-green-50 p-6 text-center">
        <Check className="mx-auto mb-2 h-6 w-6 text-green-600" />
        <p className="text-sm text-green-800">
          Talebiniz alındı. Telefon ile aranıp bilgilendirileceksiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-premium border border-navy-100 bg-navy-50/50 p-6 space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-navy-900">Süpervizör talebi</p>
      <input
        required
        placeholder="Ad Soyad"
        value={form.fullName}
        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm"
      />
      <input
        required
        type="email"
        placeholder="E-posta"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm"
      />
      <div className="relative">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
        <input
          required
          type="tel"
          placeholder="Telefon"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="w-full rounded-premium border border-clinical-border pl-12 pr-4 py-3 text-sm"
        />
      </div>
      <textarea
        placeholder="Kısa mesaj (isteğe bağlı)"
        rows={2}
        value={form.message}
        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        className="w-full rounded-premium border border-clinical-border px-4 py-3 text-sm resize-none"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError(null);
            if (!isValidPhone(form.phone)) {
              setError("Geçerli bir telefon numarası girin.");
              return;
            }
            setLoading(true);
            try {
              const res = await fetch("/api/supervisor-applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...form,
                  phone: normalizePhone(form.phone),
                }),
              });
              const j = (await res.json()) as { error?: string };
              if (!res.ok) throw new Error(j.error ?? "Talep gönderilemedi");
              setDone(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Talep gönderilemedi");
            } finally {
              setLoading(false);
            }
          }}
          className="btn-navy flex-1 py-2 text-xs disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Gönder
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-outline-navy py-2 px-4 text-xs"
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}

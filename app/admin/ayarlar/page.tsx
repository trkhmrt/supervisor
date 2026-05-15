"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle2, Globe, Mail, Phone, MapPin, Share2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/lib/store";

export default function AdminSettings() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-10">
         <h1 className="h2-premium text-3xl">Sistem Ayarları</h1>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8 pb-4 border-b border-clinical-border">Genel Bilgiler</h3>
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Site İsmi</label>
                <input
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                  className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Slogan (Tagline)</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8 pb-4 border-b border-clinical-border">İletişim Kanalları</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">E-posta</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-navy-900">Adres</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors h-24 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card-premium">
            <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-8 pb-4 border-b border-clinical-border">Sosyal Medya</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(form.socials).map(([key, val]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-navy-900 capitalize">{key}</label>
                  <input
                    value={val}
                    onChange={(e) => setForm({ ...form, socials: { ...form.socials, [key]: e.target.value } })}
                    className="w-full bg-clinical-light border border-clinical-border rounded-premium px-4 py-3 text-sm focus:outline-none focus:border-navy-900 transition-colors"
                    placeholder={`https://${key}.com/profil`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="card-premium sticky top-32">
             <h3 className="text-xs font-bold text-navy-900 uppercase tracking-widest mb-6">İşlemler</h3>
             <button type="submit" className="btn-navy w-full py-4 text-sm font-bold flex items-center justify-center gap-3">
                <Save className="h-4 w-4" /> Değişiklikleri Kaydet
             </button>
             {saved && (
               <div className="mt-4 flex items-center justify-center gap-2 text-green-600 text-xs font-bold uppercase tracking-widest">
                  <CheckCircle2 className="h-4 w-4" /> Ayarlar Kaydedildi
               </div>
             )}
             <p className="mt-8 text-[10px] text-clinical-muted leading-relaxed text-center uppercase tracking-widest">
                Yapılan değişiklikler tüm kullanıcılar için anında geçerli olacaktır.
             </p>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}

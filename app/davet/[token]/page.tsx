"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowRight, AlertCircle, Mail } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useAppStore } from "@/lib/store";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const invite = useAppStore((s) => s.invites.find((i) => i.token === params.token));
  const registerSupervisorFromInvite = useAppStore(
    (s) => s.registerSupervisorFromInvite
  );

  const [form, setForm] = useState({
    fullName: "",
    title: "Psikolog",
    bio: "",
    license: "",
    expertise: "",
    pricePerSession: 1500,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const status = invite?.status;
  const initialEmail = useMemo(() => invite?.email ?? "", [invite]);

  if (!invite) {
    return (
      <SiteShell>
        <section className="bg-warm-gradient">
          <div className="container-narrow py-20 text-center">
            <h1 className="h1">Davet bulunamadı</h1>
            <p className="mt-4 text-ink-soft">
              Davet bağlantısı geçersiz ya da süresi dolmuş olabilir.
            </p>
          </div>
        </section>
      </SiteShell>
    );
  }

  if (status === "accepted") {
    return (
      <SiteShell>
        <section className="bg-warm-gradient">
          <div className="container-narrow py-20 text-center">
            <h1 className="h1">Bu davet zaten kullanıldı</h1>
            <p className="mt-4 text-ink-soft">
              Hesabınız varsa giriş yapabilirsiniz.
            </p>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="bg-warm-gradient">
        <div className="container-narrow grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <div className="eyebrow">Davetiye</div>
            <h1 className="h1 mt-3">Süpervizör olarak aramıza katılın</h1>
            <p className="mt-4 text-ink-soft">
              Süpervizör olarak platforma katılmak üzere davet edildiniz. Profilinizi oluşturmak için aşağıdaki formu doldurun.
            </p>
            <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50/40 p-5 text-sm text-ink-soft">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-700" />
                <span className="font-medium text-ink">{invite.email}</span>
              </div>
              <div className="mt-2">Bu davet bu e-posta adresi için hazırlandı.</div>
            </div>
          </div>

          <div className="card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                const user = registerSupervisorFromInvite(invite.token, {
                  email: initialEmail,
                  password: form.password,
                  fullName: form.fullName,
                  title: form.title,
                  bio: form.bio,
                  license: form.license,
                  expertise: form.expertise.split(",").map((s) => s.trim()).filter(Boolean),
                  pricePerSession: form.pricePerSession,
                });
                if (!user) {
                  setError("Kayıt sırasında bir hata oluştu.");
                  return;
                }
                router.push("/panelim");
              }}
              className="space-y-4"
            >
              <div>
                <label className="label">Ad Soyad</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="input"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Ünvan</label>
                  <select
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input"
                  >
                    <option>Psikolog</option>
                    <option>Klinik Psikolog</option>
                    <option>Psikiyatrist</option>
                    <option>PDR Uzmanı</option>
                    <option>Aile Danışmanı</option>
                  </select>
                </div>
                <div>
                  <label className="label">Lisans Bilgisi</label>
                  <input
                    required
                    value={form.license}
                    onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
                    placeholder="TPD No: ..."
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">Uzmanlık Alanları (virgülle ayırın)</label>
                <input
                  required
                  value={form.expertise}
                  onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
                  placeholder="Bireysel Süpervizyon, Travma, ..."
                  className="input"
                />
              </div>
              <div>
                <label className="label">Kısa Biyografi</label>
                <textarea
                  required
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="input resize-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Seans Ücreti (TL)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.pricePerSession}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pricePerSession: Number(e.target.value) }))
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Şifre</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl bg-[#f1f0f0] px-4 py-3 text-sm text-black">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full">
                Hesabı Oluştur
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

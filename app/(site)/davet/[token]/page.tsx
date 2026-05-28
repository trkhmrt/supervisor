"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, Mail, Loader2, CheckCircle2 } from "lucide-react";
import {
  EXPERTISE_AREAS,
  THERAPY_APPROACHES,
} from "@/lib/constants/supervisor-options";
import type { Service } from "@/lib/types";

type InviteInfo = {
  email: string;
  status: "pending" | "accepted" | "expired";
  expiresAt?: string;
  expired?: boolean;
};

type FormState = {
  fullName: string;
  title: string;
  bio: string;
  expertise: string[];
  approaches: string[];
  services: string[];
  pricePerSession: number;
  yearsExperience: number;
};

const initialForm: FormState = {
  fullName: "",
  title: "Psikolog",
  bio: "",
  expertise: [],
  approaches: [],
  services: [],
  pricePerSession: 1500,
  yearsExperience: 0,
};

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const loadInvite = useCallback(async () => {
    setLoadingInvite(true);
    try {
      const [inviteRes, svcRes] = await Promise.all([
        fetch(`/api/invites/${token}`, { cache: "no-store" }),
        fetch("/api/services", { cache: "no-store" }),
      ]);
      if (!inviteRes.ok) {
        setInvite(null);
        return;
      }
      setInvite(await inviteRes.json());
      if (svcRes.ok) setServices(await svcRes.json());
    } catch {
      setInvite(null);
    } finally {
      setLoadingInvite(false);
    }
  }, [token]);

  useEffect(() => {
    void loadInvite();
  }, [loadInvite]);

  function toggle(field: "expertise" | "approaches" | "services", value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((x) => x !== value)
        : [...f[field], value],
    }));
  }

  if (loadingInvite) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-clinical-light pt-site-hero">
        <Loader2 className="h-6 w-6 animate-spin text-clinical-muted" />
      </section>
    );
  }

  if (!invite) {
    return (
      <section className="bg-clinical-light">
        <div className="container-narrow py-20 text-center">
          <h1 className="h2-premium">Kayıt formu bulunamadı</h1>
          <p className="mt-4 text-clinical-muted">Bağlantı geçersiz olabilir.</p>
        </div>
      </section>
    );
  }

  if (invite.expired || invite.status === "expired") {
    return (
      <section className="bg-clinical-light">
        <div className="container-narrow max-w-lg py-20 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-600" />
          <h1 className="h2-premium mb-4">Süresi dolmuş kayıt formu</h1>
          <p className="text-clinical-muted">
            Kaydınız yapılamadı. Lütfen yeni bir süpervizör daveti talep edin veya yönetici ile
            iletişime geçin.
          </p>
          <Link href="/kayit" className="btn-navy mt-8 inline-flex">
            Talep sayfasına git
          </Link>
        </div>
      </section>
    );
  }

  if (invite.status === "accepted") {
    return (
      <section className="bg-clinical-light">
        <div className="container-narrow py-20 text-center">
          <h1 className="h2-premium">Bu kayıt formu zaten kullanıldı</h1>
          <Link href="/giris" className="btn-navy mt-8 inline-flex">
            Giriş Yap
          </Link>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-clinical-light pt-site-hero">
        <div className="container-narrow max-w-md rounded-premium border border-clinical-border bg-white p-10 text-center shadow-xl">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h1 className="h3-premium mb-2">Kayıt tamamlandı</h1>
          <p className="text-sm text-clinical-muted">
            Giriş bilgileriniz <strong>{invite.email}</strong> adresine gönderildi. E-postanızı
            kontrol ederek panele giriş yapabilirsiniz; şifrenizi profilden değiştirebilirsiniz.
          </p>
          <Link href="/giris" className="btn-navy mt-8 inline-flex">
            Giriş Yap
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-clinical-light">
      <div className="container-narrow grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-24">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-500">
            Süpervizör kayıt formu
          </p>
          <h1 className="h2-premium mt-3">Profilinizi tamamlayın</h1>
          <p className="mt-4 text-clinical-muted">
            Bu form yalnızca davet ile açılır. Bilgilerinizi gönderdikten sonra hesap bilgileriniz
            e-posta ile iletilecektir.
          </p>
          {invite.expiresAt && (
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-amber-700">
              Son geçerlilik: {new Date(invite.expiresAt).toLocaleDateString("tr-TR")}
            </p>
          )}
          <div className="mt-8 rounded-premium border border-navy-100 bg-navy-50 p-5 text-sm">
            <div className="flex items-center gap-2 font-bold text-navy-900">
              <Mail className="h-4 w-4" />
              {invite.email}
            </div>
          </div>
        </div>

        <div className="card-premium">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setSubmitting(true);
              try {
                const res = await fetch(`/api/invites/${token}/register`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(form),
                });
                const j = (await res.json()) as { error?: string };
                if (!res.ok) throw new Error(j.error ?? "Kayıt yapılamadı");
                setDone(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Kayıt yapılamadı");
              } finally {
                setSubmitting(false);
              }
            }}
            className="space-y-4"
          >
            <input
              required
              placeholder="Ad Soyad"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="input w-full"
            />
            <select
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="input w-full"
            >
              <option>Psikolog</option>
              <option>Klinik Psikolog</option>
              <option>Psikiyatrist</option>
              <option>PDR Uzmanı</option>
            </select>

            <MultiSelect
              label="Uzmanlık Alanları"
              options={[...EXPERTISE_AREAS]}
              values={form.expertise}
              onToggle={(v) => toggle("expertise", v)}
            />
            <MultiSelect
              label="Terapi Yaklaşımları"
              options={[...THERAPY_APPROACHES]}
              values={form.approaches}
              onToggle={(v) => toggle("approaches", v)}
            />
            {services.length > 0 && (
              <MultiSelect
                label="Sağladığım Hizmetler"
                options={services.map((s) => ({ value: s.id, label: s.name }))}
                values={form.services}
                onToggle={(v) => toggle("services", v)}
              />
            )}

            <textarea
              required
              rows={4}
              placeholder="Biyografi"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              className="input w-full resize-none"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="number"
                min={0}
                placeholder="Seans ücreti (TL)"
                value={form.pricePerSession}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pricePerSession: Number(e.target.value) }))
                }
                className="input w-full"
              />
              <input
                type="number"
                min={0}
                placeholder="Tecrübe (yıl)"
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm((f) => ({ ...f, yearsExperience: Number(e.target.value) }))
                }
                className="input w-full"
              />
            </div>

            {error && (
              <div className="flex gap-2 rounded-premium bg-red-50 px-4 py-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-navy w-full disabled:opacity-50">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Kaydı Tamamla
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

type MultiSelectOption = string | { value: string; label: string };

function MultiSelect({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: MultiSelectOption[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3 max-h-44 overflow-y-auto rounded-premium border border-clinical-border p-3">
        {items.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

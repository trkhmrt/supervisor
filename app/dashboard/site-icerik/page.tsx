"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
import type { HeroContent, HomeContent } from "@/lib/types";

type FormState = {
  heroEyebrow: string;
  heroHeadlinePrefix: string;
  heroHeadlineWords: string;
  heroHeadlineSuffix: string;
  heroSubtext: string;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  heroStatYears: string;
  heroStatSessions: string;
  heroStatRating: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroBadgeText: string;
  heroFloatingKeywords: string;
  homeTrustLabels: string;
  homeWhyEyebrow: string;
  homeWhyTitle: string;
  homeWhyHighlight: string;
  homeWhyFeatureTitles: string;
  homeWhyFeatureDescs: string;
  homeWhyStepTitles: string;
  homeWhyStepDescs: string;
};

function contentToForm(hero: HeroContent, home: HomeContent): FormState {
  return {
    heroEyebrow: hero.eyebrow,
    heroHeadlinePrefix: hero.headlinePrefix,
    heroHeadlineWords: hero.headlineWords.join(", "),
    heroHeadlineSuffix: hero.headlineSuffix,
    heroSubtext: hero.subtext,
    heroPrimaryCtaText: hero.primaryCtaText,
    heroPrimaryCtaHref: hero.primaryCtaHref,
    heroSecondaryCtaText: hero.secondaryCtaText,
    heroSecondaryCtaHref: hero.secondaryCtaHref,
    heroStatYears: String(hero.statYears),
    heroStatSessions: String(hero.statSessions),
    heroStatRating: String(hero.statRating),
    heroImageUrl: hero.imageUrl ?? "",
    heroImageAlt: hero.imageAlt,
    heroBadgeText: hero.badgeText,
    heroFloatingKeywords: hero.floatingKeywords.join(", "),
    homeTrustLabels: home.trustLabels.join(", "),
    homeWhyEyebrow: home.whyEyebrow,
    homeWhyTitle: home.whyTitle,
    homeWhyHighlight: home.whyHighlight,
    homeWhyFeatureTitles: home.whyFeatureTitles.join("\n"),
    homeWhyFeatureDescs: home.whyFeatureDescs.join("\n"),
    homeWhyStepTitles: home.whyStepTitles.join("\n"),
    homeWhyStepDescs: home.whyStepDescs.join("\n"),
  };
}

export default function SiteContentPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/site-settings", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Veri alınamadı.");
      setForm(contentToForm(data.hero as HeroContent, data.home as HomeContent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/adminpanel/site-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heroStatYears: form.heroStatYears === "" ? null : Number(form.heroStatYears),
          heroStatSessions:
            form.heroStatSessions === "" ? null : Number(form.heroStatSessions),
          heroStatRating: form.heroStatRating === "" ? null : Number(form.heroStatRating),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setForm(contentToForm(data.hero as HeroContent, data.home as HomeContent));
      setSuccess("Anasayfa içerikleri güncellendi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h2-premium text-3xl">Site İçerik</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          Anasayfa Hero, güven şeridi ve Neden Biz alanlarını buradan düzenleyin.
        </p>
      </div>

      {error && (
        <p className="rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-premium border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <Section title="Üst başlık (Hero)">
          <Field
            label="Eyebrow / Üst etiket"
            value={form.heroEyebrow}
            onChange={(v) => update("heroEyebrow", v)}
            placeholder="Klinik Odaklı Süpervizyon"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Başlık önyazısı"
              value={form.heroHeadlinePrefix}
              onChange={(v) => update("heroHeadlinePrefix", v)}
              placeholder="Tedavi Yetkinliğinizi"
            />
            <Field
              label="Animasyonlu kelimeler (virgülle)"
              value={form.heroHeadlineWords}
              onChange={(v) => update("heroHeadlineWords", v)}
              placeholder="Güvenle, Derinlikle, Etikle"
            />
            <Field
              label="Başlık sonyazısı"
              value={form.heroHeadlineSuffix}
              onChange={(v) => update("heroHeadlineSuffix", v)}
              placeholder="Geliştirin"
            />
          </div>
          <Field
            label="Alt metin"
            value={form.heroSubtext}
            onChange={(v) => update("heroSubtext", v)}
            multiline
            rows={4}
          />
        </Section>

        <Section title="Çağrı butonları">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Birincil buton — yazı"
              value={form.heroPrimaryCtaText}
              onChange={(v) => update("heroPrimaryCtaText", v)}
            />
            <Field
              label="Birincil buton — link"
              value={form.heroPrimaryCtaHref}
              onChange={(v) => update("heroPrimaryCtaHref", v)}
              placeholder="/supervizorler"
            />
            <Field
              label="İkincil buton — yazı"
              value={form.heroSecondaryCtaText}
              onChange={(v) => update("heroSecondaryCtaText", v)}
            />
            <Field
              label="İkincil buton — link"
              value={form.heroSecondaryCtaHref}
              onChange={(v) => update("heroSecondaryCtaHref", v)}
              placeholder="/hizmetler"
            />
          </div>
        </Section>

        <Section title="İstatistikler">
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Klinik Uzman (sayı)"
              value={form.heroStatYears}
              onChange={(v) => update("heroStatYears", v)}
              type="number"
            />
            <Field
              label="Tedavi Seansı (sayı)"
              value={form.heroStatSessions}
              onChange={(v) => update("heroStatSessions", v)}
              type="number"
            />
            <Field
              label="Memnuniyet (/5)"
              value={form.heroStatRating}
              onChange={(v) => update("heroStatRating", v)}
              type="number"
              step="0.1"
            />
          </div>
        </Section>

        <Section title="Görsel">
          <Field
            label="Görsel URL"
            value={form.heroImageUrl}
            onChange={(v) => update("heroImageUrl", v)}
            placeholder="https://..."
          />
          <Field
            label="Görsel açıklaması (alt)"
            value={form.heroImageAlt}
            onChange={(v) => update("heroImageAlt", v)}
          />
          <Field
            label="Badge yazısı"
            value={form.heroBadgeText}
            onChange={(v) => update("heroBadgeText", v)}
            placeholder="Süpervizyon Deneyimi"
          />
          <Field
            label="Yüzen anahtar kelimeler (virgülle)"
            value={form.heroFloatingKeywords}
            onChange={(v) => update("heroFloatingKeywords", v)}
            placeholder="Vaka Analizi, Etik Çerçeve, Canlı Geri Bildirim, Sürekli Gelişim"
          />
          {form.heroImageUrl && (
            <div className="mt-2">
              <p className="text-xs font-bold uppercase text-clinical-muted mb-2">Önizleme</p>
              <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-premium border border-clinical-border">
                <Image src={form.heroImageUrl} alt={form.heroImageAlt} fill className="object-cover" />
              </div>
            </div>
          )}
        </Section>

        <Section title="Güven şeridi">
          <Field
            label="Güven etiketleri (virgül veya satır satır)"
            value={form.homeTrustLabels}
            onChange={(v) => update("homeTrustLabels", v)}
            multiline
            rows={3}
            placeholder={"Etik Onayli\nTedavi Odakli Surec\nKlinik Yetkin Uzmanlar\nSüpervizyon Dayanismasi"}
          />
        </Section>

        <Section title="Neden Biz alanı">
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Üst etiket"
              value={form.homeWhyEyebrow}
              onChange={(v) => update("homeWhyEyebrow", v)}
            />
            <Field
              label="Başlık"
              value={form.homeWhyTitle}
              onChange={(v) => update("homeWhyTitle", v)}
            />
            <Field
              label="Vurgulu başlık"
              value={form.homeWhyHighlight}
              onChange={(v) => update("homeWhyHighlight", v)}
            />
          </div>
          <Field
            label="Sol maddeler - başlıklar (satır satır)"
            value={form.homeWhyFeatureTitles}
            onChange={(v) => update("homeWhyFeatureTitles", v)}
            multiline
            rows={4}
          />
          <Field
            label="Sol maddeler - açıklamalar (satır satır)"
            value={form.homeWhyFeatureDescs}
            onChange={(v) => update("homeWhyFeatureDescs", v)}
            multiline
            rows={5}
          />
          <Field
            label="Sağ kart adım başlıkları (satır satır)"
            value={form.homeWhyStepTitles}
            onChange={(v) => update("homeWhyStepTitles", v)}
            multiline
            rows={4}
          />
          <Field
            label="Sağ kart adım açıklamaları (satır satır)"
            value={form.homeWhyStepDescs}
            onChange={(v) => update("homeWhyStepDescs", v)}
            multiline
            rows={5}
          />
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-premium bg-navy-900 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-premium">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-navy-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  rows = 3,
  placeholder,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-navy-900">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="mt-1 w-full resize-none rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}

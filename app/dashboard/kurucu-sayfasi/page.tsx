"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Save } from "lucide-react";
import type { FounderPageContent } from "@/lib/content/founder-profile";
import type { Author } from "@/lib/types";

type FormState = {
  fullName: string;
  title: string;
  bio: string;
  photo: string;
  roleBadge: string;
  platformLabel: string;
  headline: string;
  intro: string;
  visionTitle: string;
  visionText: string;
  quote: string;
  personalEyebrow: string;
  personalTitle: string;
  personalParagraphs: string;
  personalClosing: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  pillar4Title: string;
  pillar4Desc: string;
  missionTitle: string;
  missionText: string;
};

function contentToForm(author: Author, content: FounderPageContent): FormState {
  const pillars = content.pillars;
  return {
    fullName: author.fullName,
    title: author.title ?? "",
    bio: author.bio,
    photo: author.photo,
    roleBadge: content.roleBadge,
    platformLabel: content.platformLabel,
    headline: content.headline,
    intro: content.intro,
    visionTitle: content.visionTitle,
    visionText: content.visionText.join("\n\n"),
    quote: content.quote,
    personalEyebrow: content.personalStory.eyebrow,
    personalTitle: content.personalStory.title,
    personalParagraphs: content.personalStory.paragraphs.join("\n\n"),
    personalClosing: content.personalStory.closing,
    pillar1Title: pillars[0]?.title ?? "",
    pillar1Desc: pillars[0]?.description ?? "",
    pillar2Title: pillars[1]?.title ?? "",
    pillar2Desc: pillars[1]?.description ?? "",
    pillar3Title: pillars[2]?.title ?? "",
    pillar3Desc: pillars[2]?.description ?? "",
    pillar4Title: pillars[3]?.title ?? "",
    pillar4Desc: pillars[3]?.description ?? "",
    missionTitle: content.missionTitle,
    missionText: content.missionText,
  };
}

function formToPayload(form: FormState) {
  const splitBlocks = (value: string) =>
    value
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  return {
    fullName: form.fullName.trim(),
    title: form.title.trim() || null,
    bio: form.bio.trim(),
    photo: form.photo.trim(),
    founderContent: {
      roleBadge: form.roleBadge.trim(),
      platformLabel: form.platformLabel.trim(),
      headline: form.headline.trim(),
      intro: form.intro.trim(),
      visionTitle: form.visionTitle.trim(),
      visionText: splitBlocks(form.visionText),
      quote: form.quote.trim(),
      personalStory: {
        eyebrow: form.personalEyebrow.trim(),
        title: form.personalTitle.trim(),
        paragraphs: splitBlocks(form.personalParagraphs),
        closing: form.personalClosing.trim(),
      },
      pillars: [
        { title: form.pillar1Title.trim(), description: form.pillar1Desc.trim() },
        { title: form.pillar2Title.trim(), description: form.pillar2Desc.trim() },
        { title: form.pillar3Title.trim(), description: form.pillar3Desc.trim() },
        { title: form.pillar4Title.trim(), description: form.pillar4Desc.trim() },
      ],
      missionTitle: form.missionTitle.trim(),
      missionText: form.missionText.trim(),
    },
  };
}

export default function FounderProfileAdminPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [publicPath, setPublicPath] = useState("/yazar/abdullatif-ramazan-celik");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/adminpanel/founder-profile", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Veri alınamadı.");
      setForm(contentToForm(data.author, data.founderContent));
      setPublicPath(data.publicPath ?? publicPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setLoading(false);
    }
  }, [publicPath]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/adminpanel/founder-profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setForm(contentToForm(data.author, data.founderContent));
      setSuccess("Kurucu sayfası güncellendi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!form) {
    return (
      <p className="text-sm text-red-600">
        {error ?? "Kurucu sayfası yüklenemedi."}
      </p>
    );
  }

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-premium text-3xl">Kurucu Sayfası</h1>
          <p className="mt-2 text-sm text-clinical-muted max-w-2xl">
            Abdullatif Ramazan Çelik&apos;in tanıtım sayfasındaki metinleri, kişisel hikâyeyi ve
            değer kartlarını buradan düzenleyin.
          </p>
        </div>
        <Link
          href={publicPath}
          target="_blank"
          rel="noreferrer"
          className="btn-outline-navy py-2 px-4 text-xs inline-flex"
        >
          Sayfayı görüntüle
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium p-4">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-6 text-sm text-green-700 bg-green-50 border border-green-100 rounded-premium p-4">
          {success}
        </p>
      )}

      <form onSubmit={(e) => void handleSave(e)} className="space-y-10">
        <Section title="Temel bilgiler">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ad soyad" value={form.fullName} onChange={(v) => setField("fullName", v)} />
            <Field label="Unvan" value={form.title} onChange={(v) => setField("title", v)} />
          </div>
          <Field label="Fotoğraf URL" value={form.photo} onChange={(v) => setField("photo", v)} />
          <TextArea
            label="Klinik biyografi (klinik yaklaşım kartında görünür)"
            value={form.bio}
            onChange={(v) => setField("bio", v)}
            rows={4}
          />
        </Section>

        <Section title="Hero alanı">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Rozet metni" value={form.roleBadge} onChange={(v) => setField("roleBadge", v)} />
            <Field
              label="Platform etiketi"
              value={form.platformLabel}
              onChange={(v) => setField("platformLabel", v)}
            />
          </div>
          <Field label="Ana başlık" value={form.headline} onChange={(v) => setField("headline", v)} />
          <TextArea label="Giriş paragrafı" value={form.intro} onChange={(v) => setField("intro", v)} rows={3} />
        </Section>

        <Section title="Kendi adıma — kişisel yazı">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Bölüm etiketi"
              value={form.personalEyebrow}
              onChange={(v) => setField("personalEyebrow", v)}
            />
            <Field
              label="Bölüm başlığı"
              value={form.personalTitle}
              onChange={(v) => setField("personalTitle", v)}
            />
          </div>
          <TextArea
            label="Paragraflar (paragraflar arasında boş satır bırakın)"
            value={form.personalParagraphs}
            onChange={(v) => setField("personalParagraphs", v)}
            rows={12}
          />
          <TextArea
            label="Kapanış cümlesi"
            value={form.personalClosing}
            onChange={(v) => setField("personalClosing", v)}
            rows={3}
          />
        </Section>

        <Section title="Kurucunun hikayesi & vizyon">
          <Field label="Vizyon başlığı" value={form.visionTitle} onChange={(v) => setField("visionTitle", v)} />
          <TextArea
            label="Vizyon paragrafları"
            value={form.visionText}
            onChange={(v) => setField("visionText", v)}
            rows={8}
          />
          <TextArea label="Alıntı" value={form.quote} onChange={(v) => setField("quote", v)} rows={3} />
        </Section>

        <Section title="Değer kartları">
          {[1, 2, 3, 4].map((n) => {
            const titleKey = `pillar${n}Title` as keyof FormState;
            const descKey = `pillar${n}Desc` as keyof FormState;
            return (
              <div key={n} className="grid gap-4 md:grid-cols-2 border border-clinical-border rounded-premium p-4">
                <Field
                  label={`Kart ${n} — başlık`}
                  value={form[titleKey] as string}
                  onChange={(v) => setField(titleKey, v)}
                />
                <Field
                  label={`Kart ${n} — açıklama`}
                  value={form[descKey] as string}
                  onChange={(v) => setField(descKey, v)}
                />
              </div>
            );
          })}
        </Section>

        <Section title="Platform vizyonu">
          <Field label="Bölüm başlığı" value={form.missionTitle} onChange={(v) => setField("missionTitle", v)} />
          <TextArea label="Metin" value={form.missionText} onChange={(v) => setField("missionText", v)} rows={4} />
        </Section>

        <button
          type="submit"
          disabled={saving}
          className="btn-navy inline-flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-premium space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-xs font-bold uppercase text-navy-900">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm font-normal normal-case"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-xs font-bold uppercase text-navy-900">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1 w-full rounded-premium border border-clinical-border px-3 py-2 text-sm font-normal normal-case leading-relaxed"
      />
    </label>
  );
}

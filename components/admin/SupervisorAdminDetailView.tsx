"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { SupervisorAdminDetail } from "@/lib/types";

type Props = {
  id: string;
  listHref: string;
  coursesHref?: string;
};

export function SupervisorAdminDetailView({ id, listHref, coursesHref }: Props) {
  const router = useRouter();
  const [data, setData] = useState<SupervisorAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/supervisors/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yüklenemedi");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete() {
    if (!confirm("Bu süpervizörü silmek istediğinize emin misiniz?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/supervisors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Silinemedi");
      }
      router.push(listHref);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Link
          href={listHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Listeye dön
        </Link>
        <p className="rounded-premium border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error ?? "Süpervizör bulunamadı"}
        </p>
      </div>
    );
  }

  const coursesLink = coursesHref ? `${coursesHref}?supervisorId=${data.id}` : null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={listHref}
          className="inline-flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Süpervizör listesi
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/supervizorler/${data.id}`}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-navy py-2 px-4 text-xs"
          >
            Sitede gör <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          {coursesLink && (
            <Link href={coursesLink} className="btn-outline-navy py-2 px-4 text-xs">
              Kurslar
            </Link>
          )}
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="inline-flex items-center gap-2 rounded-premium border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Sil
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium lg:col-span-1 text-center">
          <img
            src={data.photo}
            alt={data.fullName}
            className="mx-auto mb-4 h-28 w-28 rounded-full object-cover border border-clinical-border"
          />
          <h1 className="text-xl font-bold text-navy-900">{data.fullName}</h1>
          <p className="text-sm text-clinical-muted">{data.title}</p>
          <p className="mt-3 font-bold text-navy-900">
            {data.pricePerSession} {data.currency} / seans
          </p>
          <p className="mt-2 text-xs text-clinical-muted">
            {data.rating.toFixed(1)} puan · {data.reviewCount} yorum
          </p>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card-premium">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-navy-900">Profil</h2>
            <p className="text-sm text-clinical-muted leading-relaxed whitespace-pre-wrap">{data.bio}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">Lisans</dt>
                <dd className="mt-0.5">{data.license}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">Tecrübe</dt>
                <dd className="mt-0.5">{data.yearsExperience} yıl</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">Uzmanlık</dt>
                <dd className="mt-0.5">{data.expertise.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">Diller</dt>
                <dd className="mt-0.5">{data.languages.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">E-posta</dt>
                <dd className="mt-0.5">{data.accountEmail ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase text-clinical-muted">Randevu</dt>
                <dd className="mt-0.5">{data.appointmentCount}</dd>
              </div>
            </dl>
          </div>

          <div className="card-premium">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-navy-900">
              Kurslar ({data.courses.length})
            </h2>
            {data.courses.length === 0 ? (
              <p className="text-sm text-clinical-muted">Henüz kurs yok.</p>
            ) : (
              <ul className="divide-y divide-clinical-border">
                {data.courses.map((c) => (
                  <li key={c.id} className="flex justify-between gap-4 py-3 text-sm">
                    <span className="font-semibold text-navy-900">{c.title}</span>
                    <span className="shrink-0 text-clinical-muted">
                      {c.enrollmentCount} kayıt · {c.active ? "Aktif" : "Pasif"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

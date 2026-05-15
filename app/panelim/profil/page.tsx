"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { useCurrentUser } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (!user) router.push("/giris");
  }, [user, router]);

  if (!user) return null;

  return (
    <SiteShell>
      <section className="bg-warm-gradient">
        <div className="container-wide py-12 lg:py-16">
          <Link href="/panelim" className="inline-flex items-center gap-2 text-sm text-teal-700 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Panele Dön
          </Link>
          <div className="eyebrow mt-6">Profilim</div>
          <h1 className="h2 mt-2">{user.fullName}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container-wide grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h3 className="font-display text-xl font-semibold">Kişisel Bilgiler</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad" value={user.fullName} />
              <Field label="E-posta" value={user.email} />
              <Field label="Rol" value={user.role === "supervisee" ? "Süpervizyon Alan" : user.role === "supervisor" ? "Süpervizör" : "Admin"} />
              <Field label="E-posta Doğrulama" value={user.emailVerified ? "Doğrulandı" : "Bekleniyor"} />
              {user.profession && <Field label="Meslek/Uzmanlık" value={user.profession} />}
              {user.experienceYears !== undefined && (
                <Field label="Deneyim (yıl)" value={`${user.experienceYears}`} />
              )}
              {user.license && <Field label="Lisans" value={user.license} />}
              <Field label="Kayıt Tarihi" value={formatDate(user.createdAt)} />
            </div>
          </div>
          <div className="card">
            <h3 className="font-display text-xl font-semibold">Güvenlik</h3>
            <p className="mt-3 text-sm text-ink-soft">
              Şifrenizi değiştirmek, iki adımlı doğrulamayı açmak veya hesabınızı silmek için bizimle iletişime geçin.
            </p>
            <Link href="/iletisim" className="btn-secondary mt-4 w-full">
              Destek Talebi Aç
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-sand-50 p-4">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

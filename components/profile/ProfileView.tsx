"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { roleLabel, scopeDescription } from "@/lib/auth/display";
import { formatDate } from "@/lib/utils";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import type { SessionUser } from "@/lib/types";

type ProfileViewProps = {
  user: SessionUser;
  variant: "panel" | "adminpanel";
};

export function ProfileView({ user, variant }: ProfileViewProps) {
  const scopes = user.scopes ?? [];
  const isAdmin = user.role === "admin";
  const canChangePassword =
    (variant === "panel" && (user.role === "user" || user.role === "supervisor")) ||
    (variant === "adminpanel" && user.authSource === "adminpanel" && isAdmin);

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Profil</h1>
        <p className="mt-2 text-sm text-clinical-muted">{user.fullName}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-premium lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900">
              Kişisel Bilgiler
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Ad Soyad" value={user.fullName} />
              <Field label="E-posta" value={user.email} />
              <Field label="E-posta Doğrulama" value={user.emailVerified ? "Doğrulandı" : "Bekleniyor"} />
              {user.profession && <Field label="Meslek/Uzmanlık" value={user.profession} />}
              {user.experienceYears !== undefined && (
                <Field label="Deneyim (yıl)" value={`${user.experienceYears}`} />
              )}
              {user.license && <Field label="Lisans" value={user.license} />}
              <Field label="Kayıt Tarihi" value={formatDate(user.createdAt)} />
              {variant === "adminpanel" && user.authSource && (
                <Field
                  label="Oturum türü"
                  value={user.authSource === "adminpanel" ? "Admin panel (e-posta/şifre)" : "Site (Supabase)"}
                />
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rol ve Yetkiler
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Rol" value={roleLabel(user.role)} />
              {isAdmin && (
                <Field
                  label="Admin türü"
                  value={user.isSuperAdmin ? "Süper admin" : "Alt admin"}
                />
              )}
            </div>

            {isAdmin ? (
              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted mb-3">
                  Kapsamlar (scope)
                </p>
                {user.isSuperAdmin ? (
                  <p className="text-sm text-navy-900 bg-navy-50 border border-navy-100 rounded-premium px-4 py-3">
                    Tüm yönetim yetkilerine sahipsiniz.
                  </p>
                ) : scopes.length > 0 ? (
                  <ul className="space-y-2">
                    {scopes.map((key) => (
                      <li
                        key={key}
                        className="flex flex-wrap items-baseline justify-between gap-2 rounded-premium border border-clinical-border bg-clinical-light px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-navy-900">
                          {scopeDescription(key)}
                        </span>
                        <code className="text-[10px] text-clinical-muted font-mono">{key}</code>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-clinical-muted bg-amber-50 border border-amber-100 rounded-premium px-4 py-3">
                    Henüz size atanmış özel yetki yok. Süper admin ile iletişime geçin.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-clinical-muted">
                {user.role === "supervisor"
                  ? "Süpervizör olarak randevularınızı ve profilinizi bu panelden yönetebilirsiniz."
                  : "Kullanıcı olarak süpervizörlerden randevu alabilir ve randevularınızı takip edebilirsiniz."}
              </p>
            )}
          </section>
        </div>

        <div className="card-premium h-fit">
          <h3 className="text-xs font-bold uppercase tracking-widest text-navy-900">Güvenlik</h3>
          {canChangePassword ? (
            <>
              <p className="mt-3 text-sm text-clinical-muted">
                {user.role === "supervisor"
                  ? "Şifrenizi buradan güncelleyebilirsiniz. Davet ile gelen geçici şifreyi değiştirmenizi öneririz."
                  : variant === "adminpanel"
                    ? "Admin panel giriş şifrenizi buradan güncelleyebilirsiniz."
                    : "Hesap şifrenizi buradan güncelleyebilirsiniz."}
              </p>
              <PasswordChangeForm />
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-clinical-muted">
                Bu hesap türü için şifre değişikliği desteklenmiyor. Yardım için destek ile iletişime geçin.
              </p>
              <Link href="/iletisim" className="btn-outline-navy mt-6 w-full py-3 text-xs">
                Destek Talebi Aç
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-premium border border-clinical-border bg-clinical-light p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-clinical-muted">{label}</div>
      <div className="mt-1 text-sm font-bold text-navy-900">{value}</div>
    </div>
  );
}

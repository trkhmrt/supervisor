"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAppStore, useCurrentUser } from "@/lib/store";

export function RequireUserLogin({
  children,
  loginNext,
}: {
  children: ReactNode;
  loginNext: string;
}) {
  const authReady = useAppStore((s) => s.authReady);
  const user = useCurrentUser();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-clinical-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Oturum kontrol ediliyor…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-premium border-dashed bg-clinical-light py-16 text-center">
        <p className="mb-2 text-lg font-bold text-navy-900">Randevu almak için giriş yapın</p>
        <p className="mb-8 text-sm text-clinical-muted max-w-sm mx-auto">
          Randevu oluşturmak ve ödeme dekontu yüklemek için üye hesabınızla giriş yapmanız gerekir.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/giris?next=${encodeURIComponent(loginNext)}`} className="btn-navy">
            Giriş Yap
          </Link>
          <Link href={`/kayit?next=${encodeURIComponent(loginNext)}`} className="btn-outline-navy">
            Kayıt Ol
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "user") {
    return (
      <div className="card-premium border-dashed bg-clinical-light py-16 text-center">
        <p className="mb-2 text-lg font-bold text-navy-900">Üye hesabı gerekli</p>
        <p className="mb-8 text-sm text-clinical-muted max-w-sm mx-auto">
          Randevu almak için danışan (üye) hesabıyla giriş yapmalısınız.
        </p>
        <Link href="/dashboard" className="btn-navy">
          Panele Git
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { UserPlus, Shield, ArrowRight } from "lucide-react";
import { hasUserScope } from "@/lib/auth/access";
import { useCurrentUser } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

export function AdminOverviewPage() {
  const me = useCurrentUser() as SessionUser | null;

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Genel Bakış</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          {me ? `Hoş geldiniz, ${me.fullName}` : "Yükleniyor…"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {hasUserScope(me, "supervisors:list") && (
          <Link
            href="/dashboard/supervizorler"
            className="card-premium flex items-center justify-between group hover:border-navy-300 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-premium bg-navy-50 flex items-center justify-center text-navy-900">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900">Süpervizörler</h2>
                <p className="text-sm text-clinical-muted mt-1">Oluştur, listele ve yönet</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-clinical-muted group-hover:text-navy-900" />
          </Link>
        )}

        {hasUserScope(me, "admins:list") && (
          <Link
            href="/dashboard/alt-adminler"
            className="card-premium flex items-center justify-between group hover:border-navy-300 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-premium bg-navy-50 flex items-center justify-center text-navy-900">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900">Alt Adminler</h2>
                <p className="text-sm text-clinical-muted mt-1">Yetki ve kullanıcı yönetimi</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-clinical-muted group-hover:text-navy-900" />
          </Link>
        )}
      </div>

      {me && !me.isSuperAdmin && (me.scopes?.length ?? 0) === 0 && (
        <p className="mt-8 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-premium p-4">
          Hesabınıza henüz yetki atanmamış. Süper admin ile iletişime geçin.
        </p>
      )}
    </>
  );
}

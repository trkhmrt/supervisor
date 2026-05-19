import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { loadUserScopes } from "@/lib/auth/user-scopes";
import type { UserRole } from "@/lib/types";

export type AppMetadataClaims = {
  app_role: UserRole;
  is_super_admin: boolean;
  scopes: string[];
  is_user: 0 | 1;
  is_supervisor: 0 | 1;
  is_admin: 0 | 1;
};

export type SyncMetadataResult =
  | { ok: true }
  | {
      ok: false;
      reason: "no_service_role" | "no_supabase_link" | "auth_user_not_found" | "update_failed" | "error";
      detail?: string;
    };

/** Prisma User.id → Supabase Auth app_metadata (yalnızca supabaseAuthId olan hesaplar) */
export async function syncSupabaseAppMetadata(prismaUserId: number): Promise<SyncMetadataResult> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    const detail = "SUPERVISOR_SUPABASE_SERVICE_ROLE_KEY tanımlı değil (.env.local)";
    if (process.env.NODE_ENV === "development") console.warn("[auth]", detail);
    return { ok: false, reason: "no_service_role", detail };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: prismaUserId },
      select: { supabaseAuthId: true },
    });

    if (!dbUser?.supabaseAuthId) {
      return { ok: false, reason: "no_supabase_link", detail: "Admin-only hesap (Supabase bağlantısı yok)" };
    }

    const { role, isSuperAdmin, scopes } = await loadUserScopes(prismaUserId);
    const supabaseAuthId = dbUser.supabaseAuthId;

    const { data: existing, error: getError } = await admin.auth.admin.getUserById(supabaseAuthId);
    if (getError || !existing?.user) {
      const detail = getError?.message ?? "Auth kullanıcısı yok";
      if (process.env.NODE_ENV === "development") console.warn("[auth] getUserById:", detail);
      return { ok: false, reason: "auth_user_not_found", detail };
    }

    const prev = (existing.user.app_metadata ?? {}) as Record<string, unknown>;

    const claims: AppMetadataClaims = {
      app_role: role,
      is_super_admin: isSuperAdmin,
      scopes,
      is_user: role === "user" ? 1 : 0,
      is_supervisor: role === "supervisor" ? 1 : 0,
      is_admin: role === "admin" ? 1 : 0,
    };

    const { error: updateError } = await admin.auth.admin.updateUserById(supabaseAuthId, {
      app_metadata: { ...prev, ...claims },
    });

    if (updateError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[auth] app_metadata güncellenemedi:", updateError.message);
      }
      return { ok: false, reason: "update_failed", detail: updateError.message };
    }

    return { ok: true };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV === "development") console.warn("[auth] syncSupabaseAppMetadata:", detail);
    return { ok: false, reason: "error", detail };
  }
}

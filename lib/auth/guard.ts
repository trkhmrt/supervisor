import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminToken, ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-token";
import { hasRole, hasScope, type Scope } from "@/lib/auth/permissions";
import { loadUserScopes } from "@/lib/auth/user-scopes";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import type { UserRole } from "@/lib/types";

export type AuthContext = {
  userId: string;
  email: string;
  role: UserRole;
  isSuperAdmin: boolean;
  scopes: Scope[];
  source: "adminpanel" | "supabase";
};

export type GuardOptions = {
  roles?: UserRole | UserRole[];
  scopes?: Scope | Scope[];
  /** Sadece adminpanel JWT (e-posta/şifre) kabul et */
  adminPanelOnly?: boolean;
};

type GuardFail = { ok: false; status: number; error: string };
type GuardOk = { ok: true; auth: AuthContext };

export async function authorize(options: GuardOptions = {}): Promise<GuardOk | GuardFail> {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (adminToken) {
    const payload = await verifyAdminToken(adminToken);
    if (!payload) {
      return { ok: false, status: 401, error: "Admin oturumu geçersiz." };
    }
    if (payload.role !== "admin") {
      return { ok: false, status: 403, error: "Admin paneline erişim yok." };
    }

    const auth: AuthContext = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isSuperAdmin: payload.isSuperAdmin,
      scopes: payload.scopes,
      source: "adminpanel",
    };

    return checkAuth(auth, options);
  }

  if (options.adminPanelOnly) {
    return { ok: false, status: 401, error: "Admin girişi gerekli." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, status: 401, error: "Oturum gerekli." };
  }

  const appUser = await syncSupabaseUser(user);
  const { scopes, isSuperAdmin } = await loadUserScopes(appUser.id);

  const auth: AuthContext = {
    userId: appUser.id,
    email: appUser.email,
    role: appUser.role,
    isSuperAdmin,
    scopes,
    source: "supabase",
  };

  return checkAuth(auth, options);
}

function checkAuth(auth: AuthContext, options: GuardOptions): GuardOk | GuardFail {
  if (options.roles && !hasRole(auth.role, options.roles)) {
    return { ok: false, status: 403, error: "Bu işlem için rolünüz uygun değil." };
  }

  if (options.scopes) {
    const superAdmin = auth.role === "admin" && auth.isSuperAdmin;
    if (!superAdmin && !hasScope(auth.scopes, options.scopes)) {
      return { ok: false, status: 403, error: "Bu işlem için yetkiniz yok." };
    }
  }

  return { ok: true, auth };
}

export function guardResponse(fail: GuardFail) {
  return NextResponse.json({ error: fail.error, code: "FORBIDDEN" }, { status: fail.status });
}

/** API route handler sarmalayıcı: önce rol/scope, sonra iş mantığı */
export function withAuth<T extends unknown[]>(
  handler: (req: Request, auth: AuthContext, ...args: T) => Promise<Response>,
  options: GuardOptions
) {
  return async (req: Request, ...args: T): Promise<Response> => {
    const result = await authorize(options);
    if (!result.ok) return guardResponse(result);
    return handler(req, result.auth, ...args);
  };
}

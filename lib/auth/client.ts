"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/supabase/env";
import type { SessionUser } from "@/lib/types";

function authCallbackUrl(next = "/dashboard") {
  const site = typeof window !== "undefined" ? window.location.origin : getSiteUrl();
  return `${site}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** API JSON beklenir; HTML (404/500 sayfası) gelirse anlaşılır hata verir */
async function parseApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const isJson =
    res.headers.get("content-type")?.includes("application/json") ||
    text.trimStart().startsWith("{") ||
    text.trimStart().startsWith("[");
  if (!isJson) {
    throw new Error(
      `Sunucu beklenmeyen yanıt döndü (${res.status}). Geliştirme sunucusu çalışıyor mu?`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Sunucu yanıtı okunamadı.");
  }
}

/** Site veya admin oturumu — rol + scope (GET /api/auth/me) */
export async function fetchSessionUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await parseApiJson<
    SessionUser & {
      metadataSync?: { ok: boolean; reason?: string; detail?: string };
    }
  >(res);

  if (data.authSource === "supabase") {
    const supabase = createClient();
    await supabase.auth.refreshSession();
  }

  if (process.env.NODE_ENV === "development" && data.metadataSync && !data.metadataSync.ok) {
    console.warn("[auth] metadata sync:", data.metadataSync);
  }

  const { metadataSync: _m, ...user } = data;
  return user as SessionUser;
}

type SyncResponse = SessionUser & {
  metadataSynced?: boolean;
  sessionRefreshed?: boolean;
  metadataSync?: { ok: boolean; reason?: string; detail?: string };
};

/** Supabase oturumunu Prisma ile eşler; rol + scope döner; JWT metadata yenilenir */
export async function syncSessionToStore(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/sync", { method: "POST", credentials: "include" });
  if (!res.ok) return null;
  const data = await parseApiJson<SyncResponse>(res);

  if (!data.sessionRefreshed) {
    const supabase = createClient();
    await supabase.auth.refreshSession();
  }

  const { metadataSynced, sessionRefreshed, metadataSync, ...user } = data;
  if (process.env.NODE_ENV === "development" && metadataSync && !metadataSync.ok) {
    console.warn("[auth] metadata sync:", metadataSync);
  }
  void metadataSynced;
  void sessionRefreshed;

  return user as SessionUser;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  const user = await syncSessionToStore();
  if (user && !user.emailVerified) {
    throw new Error("Email not confirmed");
  }
  return user;
}

/** Admin panel JWT (Prisma şifre) — Supabase hesabı gerekmez */
export async function signInWithAdminPanel(email: string, password: string) {
  const res = await fetch("/api/adminpanel/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });
  const data = await parseApiJson<{ error?: string; user?: unknown }>(res);
  if (!res.ok) {
    throw new Error(data.error ?? "E-posta veya şifre hatalı.");
  }
  const user = await fetchSessionUser();
  if (!user) {
    throw new Error("Oturum oluşturulamadı.");
  }
  return user;
}

/**
 * Önce Supabase; olmazsa admin panel (Prisma şifre / seed admin).
 * Admin hesabı Supabase'de kayıtlı olsa bile panel şifresiyle girebilir.
 */
export async function signInWithCredentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  try {
    return await signInWithAdminPanel(normalized, password);
  } catch (adminErr) {
    const msg = adminErr instanceof Error ? adminErr.message : "";
    if (msg.includes("beklenmeyen yanıt") || msg.includes("yanıtı okunamadı")) {
      throw adminErr;
    }
  }
  return signInWithEmail(normalized, password);
}

/** Davet linki ile süpervizör adayı kaydı */
export async function signUpWithInvite(data: {
  email: string;
  password: string;
  fullName: string;
  inviteToken: string;
}) {
  const supabase = createClient();
  const email = data.email.trim().toLowerCase();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      emailRedirectTo: authCallbackUrl(`/davet/${data.inviteToken}`),
      data: {
        full_name: data.fullName,
        role: "supervisor",
        invite_token: data.inviteToken,
      },
    },
  });

  if (error) throw error;
  if (signUpData.session) {
    return syncSessionToStore();
  }
  return null;
}

export async function signUpWithEmail(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  profession: string;
}) {
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const phone = data.phone.trim();
  const profession = data.profession.trim();

  const supabase = createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      emailRedirectTo: authCallbackUrl("/dashboard"),
      data: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone,
        profession,
        role: "user",
      },
    },
  });

  if (error) throw error;

  if (signUpData.session) {
    return syncSessionToStore();
  }

  return null;
}

export async function signInWithGoogle(next = "/dashboard") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(next),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch {
    /* Sunucu çerez temizliği isteğe bağlı; istemci oturumu zaten kapandı */
  }
}

export function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: string }).message);
    if (
      msg.includes("Unexpected token '<'") ||
      msg.includes("is not valid JSON") ||
      msg.includes("Failed to execute 'json'")
    ) {
      return "Sunucu beklenmeyen yanıt döndü. Sayfayı yenileyin; sorun sürerse geliştirici konsolundaki API adresini kontrol edin.";
    }
    if (msg.includes("Invalid login credentials")) {
      return "E-posta veya şifre hatalı.";
    }
    if (msg.includes("User already registered")) {
      return "Bu e-posta ile zaten kayıt var. Giriş yapın.";
    }
    if (msg.includes("Email not confirmed")) {
      return "E-postanızı doğrulamanız gerekiyor.";
    }
    if (msg.includes("beklenmeyen yanıt") || msg.includes("yanıtı okunamadı")) {
      return msg;
    }
    return msg;
  }
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/supabase/env";
import type { SessionUser } from "@/lib/types";

function authCallbackUrl(next = "/panelim") {
  const site = typeof window !== "undefined" ? window.location.origin : getSiteUrl();
  return `${site}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Site veya admin oturumu — rol + scope (GET /api/auth/me) */
export async function fetchSessionUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as SessionUser & {
    metadataSync?: { ok: boolean; reason?: string; detail?: string };
  };

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
  const data = (await res.json()) as SyncResponse;

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
  return syncSessionToStore();
}

export async function signUpWithEmail(data: {
  email: string;
  password: string;
  fullName: string;
  profession?: string;
  experienceYears?: number;
}) {
  const supabase = createClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email: data.email.trim().toLowerCase(),
    password: data.password,
    options: {
      emailRedirectTo: authCallbackUrl("/panelim"),
      data: {
        full_name: data.fullName,
        role: "user",
        profession: data.profession,
        experience_years: data.experienceYears,
      },
    },
  });

  if (error) throw error;

  if (signUpData.session) {
    return syncSessionToStore();
  }

  return null;
}

export async function signInWithGoogle(next = "/panelim") {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authCallbackUrl(next),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export function authErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: string }).message);
    if (msg.includes("Invalid login credentials")) {
      return "E-posta veya şifre hatalı.";
    }
    if (msg.includes("User already registered")) {
      return "Bu e-posta ile zaten kayıt var. Giriş yapın.";
    }
    if (msg.includes("Email not confirmed")) {
      return "E-postanızı doğrulamanız gerekiyor.";
    }
    return msg;
  }
  return "Bir hata oluştu. Lütfen tekrar deneyin.";
}

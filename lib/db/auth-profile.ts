import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { buildSessionUser } from "@/lib/auth/session-user";
import { isUserProfession } from "@/lib/constants/user-professions";
import { isValidPhone, normalizePhone } from "@/lib/validation/phone";
import type { AuthContext } from "@/lib/auth/guard";
import type { SessionUser } from "@/lib/types";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function updateUserProfile(
  auth: AuthContext,
  input: { phone?: string; profession?: string }
): Promise<SessionUser | { error: string }> {
  const data: { phone?: string; profession?: string | null } = {};

  if (input.phone !== undefined) {
    const normalized = normalizePhone(input.phone.trim());
    if (!isValidPhone(normalized)) {
      return { error: "Geçerli bir telefon numarası girin (en az 10 rakam)." };
    }
    data.phone = normalized;
  }

  if (input.profession !== undefined) {
    const p = input.profession.trim();
    if (p && !isUserProfession(p)) {
      return { error: "Geçersiz mesleki rol seçimi." };
    }
    data.profession = p || null;
  }

  if (!Object.keys(data).length) {
    return { error: "Güncellenecek alan yok." };
  }

  const row = await prisma.user.update({
    where: { id: auth.userId },
    data,
  });

  if (auth.source === "supabase" && row.supabaseAuthId) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const meta: Record<string, unknown> = {};
      if (data.phone !== undefined) meta.phone = data.phone;
      if (data.profession !== undefined) meta.profession = data.profession;
      await supabase.auth.admin.updateUserById(row.supabaseAuthId, {
        user_metadata: meta,
      });
    }
  }

  const sessionUser = await buildSessionUser(auth);
  if (!sessionUser) {
    return { error: "Oturum güncellenemedi." };
  }
  return sessionUser;
}

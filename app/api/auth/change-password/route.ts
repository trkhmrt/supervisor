export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isOAuthOnlyAccount } from "@/lib/auth/supabase-provider";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const POST = withAuth(
  async (req, auth) => {
    const body = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mevcut şifre ve en az 6 karakterlik yeni şifre gerekli." },
        { status: 400 }
      );
    }

    if (auth.source === "adminpanel") {
      if (auth.role !== "admin") {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
      }
      try {
        const row = await prisma.user.findUnique({
          where: { id: auth.userId },
          select: { password: true },
        });
        if (!row?.password) {
          return NextResponse.json(
            { error: "Bu hesap için şifre değişikliği desteklenmiyor." },
            { status: 400 }
          );
        }
        const valid = await verifyPassword(currentPassword, row.password);
        if (!valid) {
          return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 400 });
        }
        await prisma.user.update({
          where: { id: auth.userId },
          data: { password: await hashPassword(newPassword) },
        });
        return NextResponse.json({ ok: true });
      } catch (e) {
        return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
      }
    }

    if (auth.source !== "supabase") {
      return NextResponse.json(
        { error: "Şifre değişikliği bu oturum türü için kullanılamıyor." },
        { status: 400 }
      );
    }

    if (isOAuthOnlyAccount(auth.authProvider)) {
      return NextResponse.json(
        { error: "Google ile giriş yapan hesaplar için şifre değişikliği kullanılamaz." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: auth.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  },
  { roles: ["user", "supervisor", "admin"] }
);

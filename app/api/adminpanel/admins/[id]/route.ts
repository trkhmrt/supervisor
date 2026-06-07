export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { SCOPES, type Scope } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { roleKeyFromRow } from "@/lib/db/lookups";
import { hashPassword } from "@/lib/auth/password";
import { setUserScopes, loadUserScopes } from "@/lib/auth/user-scopes";
import { parseUserIdParam } from "@/lib/auth/user-id";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, auth, ctx: Ctx) => {
    const { id: idParam } = await ctx.params;
    const id = parseUserIdParam(idParam);
    if (id === null) {
      return NextResponse.json({ error: "Geçersiz admin kimliği." }, { status: 400 });
    }

    const body = (await req.json()) as {
      fullName?: string;
      password?: string;
      isSuperAdmin?: boolean;
      scopes?: Scope[];
    };

    const target = await prisma.user.findUnique({
      where: { id },
      include: { role: { select: { key: true } } },
    });
    if (!target || roleKeyFromRow(target.role) !== "admin") {
      return NextResponse.json({ error: "Admin bulunamadı." }, { status: 404 });
    }

    if (target.isSuperAdmin && !auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "Süper admin hesabını düzenleme yetkiniz yok." },
        { status: 403 }
      );
    }

    if (body.isSuperAdmin === true && !auth.isSuperAdmin) {
      return NextResponse.json({ error: "Süper admin atama yetkiniz yok." }, { status: 403 });
    }

    if (id === auth.userId && body.isSuperAdmin === false && target.isSuperAdmin) {
      return NextResponse.json(
        { error: "Kendi süper admin yetkinizi kaldıramazsınız." },
        { status: 400 }
      );
    }

    const data: {
      fullName?: string;
      password?: string;
      isSuperAdmin?: boolean;
    } = {};

    if (body.fullName?.trim()) data.fullName = body.fullName.trim();
    if (body.password !== undefined && body.password !== "") {
      if (body.password.length < 6) {
        return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
      }
      data.password = await hashPassword(body.password);
    }
    if (typeof body.isSuperAdmin === "boolean") data.isSuperAdmin = body.isSuperAdmin;

    await prisma.user.update({ where: { id }, data });

    const nextIsSuperAdmin =
      typeof body.isSuperAdmin === "boolean" ? body.isSuperAdmin : target.isSuperAdmin;

    if (nextIsSuperAdmin) {
      await prisma.userPermission.deleteMany({ where: { userId: id } });
      const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
      await syncSupabaseAppMetadata(id);
    } else if (body.scopes !== undefined) {
      await setUserScopes(id, body.scopes);
    }

    const { scopes, isSuperAdmin } = await loadUserScopes(id);

    return NextResponse.json({
      id: target.id,
      email: target.email,
      fullName: data.fullName ?? target.fullName,
      isSuperAdmin,
      scopes,
    });
  },
  { roles: "admin", scopes: SCOPES.ADMINS_UPDATE, adminPanelOnly: true }
);

export const DELETE = withAuth(
  async (_req, auth, ctx: Ctx) => {
    const { id: idParam } = await ctx.params;
    const id = parseUserIdParam(idParam);
    if (id === null) {
      return NextResponse.json({ error: "Geçersiz admin kimliği." }, { status: 400 });
    }

    if (id === auth.userId) {
      return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      include: { role: { select: { key: true } } },
    });
    if (!target || roleKeyFromRow(target.role) !== "admin") {
      return NextResponse.json({ error: "Admin bulunamadı." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
  { roles: "admin", scopes: SCOPES.ADMINS_DELETE, adminPanelOnly: true }
);

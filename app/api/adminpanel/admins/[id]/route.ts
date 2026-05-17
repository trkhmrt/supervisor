export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { SCOPES, type Scope } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setUserScopes, loadUserScopes } from "@/lib/auth/user-scopes";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async (req, _auth, ctx: Ctx) => {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      fullName?: string;
      password?: string;
      isSuperAdmin?: boolean;
      scopes?: Scope[];
    };

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== "admin") {
      return NextResponse.json({ error: "Admin bulunamadı." }, { status: 404 });
    }

    const data: {
      fullName?: string;
      password?: string;
      isSuperAdmin?: boolean;
    } = {};

    if (body.fullName) data.fullName = body.fullName;
    if (body.password) data.password = await hashPassword(body.password);
    if (typeof body.isSuperAdmin === "boolean") data.isSuperAdmin = body.isSuperAdmin;

    await prisma.user.update({ where: { id }, data });

    if (body.scopes && !body.isSuperAdmin) {
      await setUserScopes(id, body.scopes);
    }
    if (body.isSuperAdmin) {
      await prisma.userPermission.deleteMany({ where: { userId: id } });
    }

    const { scopes, isSuperAdmin } = await loadUserScopes(id);
    const { syncSupabaseAppMetadata } = await import("@/lib/auth/sync-supabase-metadata");
    await syncSupabaseAppMetadata(id);

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
    const { id } = await ctx.params;
    if (id === auth.userId) {
      return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== "admin") {
      return NextResponse.json({ error: "Admin bulunamadı." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
  { roles: "admin", scopes: SCOPES.ADMINS_DELETE, adminPanelOnly: true }
);

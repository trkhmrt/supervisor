export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { SCOPES, type Scope } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { createAdminAccount } from "@/lib/db/admin-account";
import { loadUserScopes } from "@/lib/auth/user-scopes";

export const GET = withAuth(
  async () => {
    const rows = await prisma.user.findMany({
      where: { role: { key: "admin" } },
      select: {
        id: true,
        email: true,
        fullName: true,
        isSuperAdmin: true,
        createdAt: true,
        permissions: { include: { permission: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        email: r.email,
        fullName: r.fullName,
        isSuperAdmin: r.isSuperAdmin,
        createdAt: r.createdAt.toISOString(),
        scopes: r.isSuperAdmin
          ? []
          : r.permissions.map((p) => p.permission.key),
      }))
    );
  },
  { roles: "admin", scopes: SCOPES.ADMINS_LIST, adminPanelOnly: true }
);

export const POST = withAuth(
  async (req) => {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      isSuperAdmin?: boolean;
      scopes?: Scope[];
    };

    if (!body.email?.trim() || !body.password || !body.fullName?.trim()) {
      return NextResponse.json(
        { error: "email, password ve fullName zorunludur." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    const user = await createAdminAccount({
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      isSuperAdmin: body.isSuperAdmin ?? false,
      scopes: body.scopes,
    });

    const { scopes } = await loadUserScopes(user.id);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSuperAdmin: user.isSuperAdmin,
        scopes,
      },
      { status: 201 }
    );
  },
  { roles: "admin", scopes: SCOPES.ADMINS_CREATE, adminPanelOnly: true }
);

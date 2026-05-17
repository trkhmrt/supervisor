export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { SCOPES } from "@/lib/auth/permissions";
import { ensurePermissionSeeds } from "@/lib/auth/user-scopes";
import { prisma } from "@/lib/prisma";

export const GET = withAuth(
  async () => {
    await ensurePermissionSeeds();
    const rows = await prisma.permission.findMany({ orderBy: { key: "asc" } });
    return NextResponse.json(rows);
  },
  { roles: "admin", scopes: SCOPES.ADMINS_LIST, adminPanelOnly: true }
);

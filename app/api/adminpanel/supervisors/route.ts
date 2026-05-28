export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { SCOPES } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { createSupervisorWithUser } from "@/lib/db/admin-account";

export const GET = withAuth(
  async () => {
    try {
      const rows = await prisma.supervisor.findMany({
        include: { slots: true, services: true, user: { select: { id: true, email: true } } },
        orderBy: { fullName: "asc" },
      });
      return NextResponse.json(rows.map(supervisorRowToApi));
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  { roles: "admin", scopes: SCOPES.SUPERVISORS_LIST, adminPanelOnly: true }
);

export const POST = withAuth(
  async (req) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const accountEmail = typeof body.accountEmail === "string" ? body.accountEmail : "";
      const accountPassword = typeof body.accountPassword === "string" ? body.accountPassword : "";

      if (!accountEmail || !accountPassword) {
        return NextResponse.json(
          { error: "Süpervizör hesabı için accountEmail ve accountPassword zorunludur." },
          { status: 400 }
        );
      }

      const { accountEmail: _e, accountPassword: _p, ...supervisorData } = body;
      const result = await createSupervisorWithUser(supervisorData, {
        email: accountEmail,
        password: accountPassword,
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.supervisor, { status: 201 });
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  { roles: "admin", scopes: SCOPES.SUPERVISORS_CREATE, adminPanelOnly: true }
);

export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { listUsersForAdmin } from "@/lib/db/users-admin";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(
  async () => {
    try {
      return NextResponse.json(await listUsersForAdmin());
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.users.list
);

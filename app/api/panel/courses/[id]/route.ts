export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth(
  async () =>
    NextResponse.json({ error: "Kurs düzenleme yalnızca admin panelinden yapılır." }, { status: 403 }),
  GUARD.supervisor.courses
);

export const DELETE = withAuth(
  async () =>
    NextResponse.json({ error: "Kurs silme yalnızca admin panelinden yapılır." }, { status: 403 }),
  GUARD.supervisor.courses
);

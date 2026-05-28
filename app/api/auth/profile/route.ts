export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { updateUserProfile } from "@/lib/db/auth-profile";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const PATCH = withAuth(
  async (req, auth) => {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      const phone = typeof body.phone === "string" ? body.phone : undefined;
      const profession = typeof body.profession === "string" ? body.profession : undefined;

      const result = await updateUserProfile(auth, { phone, profession });
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (e) {
      return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
    }
  },
  GUARD.profile.update
);

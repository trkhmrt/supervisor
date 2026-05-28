export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { InviteError, registerInvite } from "@/lib/db/invites";
import { parseStringArray } from "@/lib/db/admin-parse";
import {
  normalizeApproaches,
  normalizeExpertise,
} from "@/lib/constants/supervisor-options";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { token } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    const expertise = normalizeExpertise(parseStringArray(body.expertise));
    const approaches = normalizeApproaches(parseStringArray(body.approaches));
    const serviceIds = parseStringArray(body.services);

    const result = await registerInvite(token, {
      fullName: typeof body.fullName === "string" ? body.fullName : "",
      title: typeof body.title === "string" ? body.title : "Psikolog",
      bio: typeof body.bio === "string" ? body.bio : "",
      license: typeof body.license === "string" ? body.license : undefined,
      expertise,
      approaches,
      serviceIds,
      pricePerSession:
        typeof body.pricePerSession === "number" ? body.pricePerSession : 1500,
      yearsExperience:
        typeof body.yearsExperience === "number" ? body.yearsExperience : 0,
      photo: typeof body.photo === "string" ? body.photo : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    if (e instanceof InviteError) {
      const status = e.message.includes("Süresi dolmuş") ? 410 : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}

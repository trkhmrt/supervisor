export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { authorize, guardResponse } from "@/lib/auth/guard";
import { buildSessionUser } from "@/lib/auth/session-user";

export async function GET() {
  const authResult = await authorize({
    roles: "admin",
    adminPanelOnly: true,
  });
  if (!authResult.ok) return guardResponse(authResult);

  const sessionUser = await buildSessionUser(authResult.auth);
  if (!sessionUser) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(sessionUser);
}

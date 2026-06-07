export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { hasScope, SCOPES } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { getSupervisorIdForUser } from "@/lib/db/supervisor-account";
import { uploadSupervisorPhotoFile } from "@/lib/storage/supervisor-photo-upload";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const POST = withAuth(async (req, auth) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const supervisorId =
      typeof formData.get("supervisorId") === "string"
        ? formData.get("supervisorId")!.trim()
        : "";

    if (!(file instanceof File) || !supervisorId) {
      return NextResponse.json(
        { error: "Fotoğraf dosyası ve supervisorId gerekli." },
        { status: 400 }
      );
    }

    if (auth.role === "supervisor") {
      const ownId = await getSupervisorIdForUser(auth.userId);
      if (ownId !== supervisorId) {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
      }
    } else if (auth.role === "admin") {
      const allowed =
        auth.isSuperAdmin || hasScope(auth.scopes, SCOPES.SUPERVISORS_UPDATE);
      if (!allowed) {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const existing = await prisma.supervisor.findUnique({
      where: { id: supervisorId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Süpervizör bulunamadı." }, { status: 404 });
    }

    const url = await uploadSupervisorPhotoFile(file, supervisorId);

    await prisma.supervisor.update({
      where: { id: supervisorId },
      data: { photo: url },
    });

    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fotoğraf yüklenemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { roles: ["admin", "supervisor"] });

export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import {
  buildFounderContentFromForm,
  getFounderProfileAdmin,
  updateFounderProfile,
} from "@/lib/db/founder-profile";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(async () => {
  try {
    const data = await getFounderProfileAdmin();
    if (!data) {
      return NextResponse.json({ error: "Kurucu sayfası kaydı bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.settings.read);

export const PATCH = withAuth(async (req) => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const founderContent = buildFounderContentFromForm(body);
    if (!founderContent) {
      return NextResponse.json({ error: "Kurucu sayfa içeriği geçersiz." }, { status: 400 });
    }

    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : undefined;
    const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;
    const photo = typeof body.photo === "string" ? body.photo.trim() : undefined;
    const title =
      body.title === null
        ? null
        : typeof body.title === "string"
          ? body.title.trim() || null
          : undefined;

    if (!fullName || !bio || !photo) {
      return NextResponse.json(
        { error: "Ad soyad, biyografi ve fotoğraf URL zorunludur." },
        { status: 400 }
      );
    }

    const data = await updateFounderProfile({
      fullName,
      title,
      bio,
      photo,
      founderContent,
    });

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.settings.update);

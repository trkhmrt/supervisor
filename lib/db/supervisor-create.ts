import { prisma } from "@/lib/prisma";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { parseOptionalNumber, parseStringArray } from "@/lib/db/admin-parse";
import type { Supervisor } from "@/lib/types";

export type CreateSupervisorBody = Record<string, unknown>;

export function validateCreateSupervisorBody(body: CreateSupervisorBody):
  | { ok: true; data: Parameters<typeof prisma.supervisor.create>[0]["data"] }
  | { ok: false; error: string } {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const photo = typeof body.photo === "string" ? body.photo.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.trim() : "";
  const license = typeof body.license === "string" ? body.license.trim() : "";

  if (!fullName || !title || !photo || !bio || !license) {
    return { ok: false, error: "fullName, title, photo, bio ve license zorunludur." };
  }

  const pricePerSession = parseOptionalNumber(body.pricePerSession, 0);
  const currency =
    typeof body.currency === "string" && ["TRY", "USD", "EUR"].includes(body.currency)
      ? body.currency
      : "TRY";
  const expertise = parseStringArray(body.expertise);
  const languages = parseStringArray(body.languages);
  const approaches = parseStringArray(body.approaches);
  const yearsExperience = parseOptionalNumber(body.yearsExperience, 0);
  const rating = parseOptionalNumber(body.rating, 0);
  const reviewCount = parseOptionalNumber(body.reviewCount, 0);

  return {
    ok: true,
    data: {
      fullName,
      title,
      photo,
      bio,
      license,
      pricePerSession,
      currency,
      expertise: expertise.length ? expertise : ["Genel"],
      languages: languages.length ? languages : ["Türkçe"],
      approaches,
      yearsExperience,
      rating,
      reviewCount,
    },
  };
}

export async function createSupervisorRecord(
  body: CreateSupervisorBody
): Promise<{ ok: true; supervisor: Supervisor } | { ok: false; error: string }> {
  const parsed = validateCreateSupervisorBody(body);
  if (!parsed.ok) return parsed;

  const row = await prisma.supervisor.create({
    data: parsed.data,
    include: { slots: true },
  });

  return { ok: true, supervisor: supervisorRowToApi(row) };
}

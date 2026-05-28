import { prisma } from "@/lib/prisma";
import { supervisorRowToApi } from "@/lib/db/supervisor-mapper";
import { parseOptionalNumber, parseStringArray } from "@/lib/db/admin-parse";
import {
  normalizeApproaches,
  normalizeExpertise,
  normalizeLanguages,
} from "@/lib/constants/supervisor-options";
import type { Supervisor } from "@/lib/types";

export type CreateSupervisorBody = Record<string, unknown>;

function parseBoolean(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    if (t === "true" || t === "1" || t === "yes") return true;
    if (t === "false" || t === "0" || t === "no") return false;
  }
  return fallback;
}

export function validateCreateSupervisorBody(body: CreateSupervisorBody):
  | { ok: true; data: Parameters<typeof prisma.supervisor.create>[0]["data"] }
  | { ok: false; error: string } {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const photo = typeof body.photo === "string" ? body.photo.trim() : "";
  const bio = typeof body.bio === "string" ? body.bio.trim() : "";

  if (!fullName || !title || !photo || !bio) {
    return { ok: false, error: "fullName, title, photo ve bio zorunludur." };
  }

  const pricePerSession = parseOptionalNumber(body.pricePerSession, 0);
  const currency =
    typeof body.currency === "string" && ["TRY", "USD", "EUR"].includes(body.currency)
      ? body.currency
      : "TRY";
  const expertise = normalizeExpertise(parseStringArray(body.expertise));
  const languages = normalizeLanguages(parseStringArray(body.languages));
  const approaches = normalizeApproaches(parseStringArray(body.approaches));
  const services = parseStringArray(body.services);
  const yearsExperience = parseOptionalNumber(body.yearsExperience, 0);
  const rating = parseOptionalNumber(body.rating, 0);
  const reviewCount = parseOptionalNumber(body.reviewCount, 0);
  const sessionFeeOnRequest = parseBoolean(body.sessionFeeOnRequest, false);

  return {
    ok: true,
    data: {
      fullName,
      title,
      photo,
      bio,
      pricePerSession,
      sessionFeeOnRequest,
      currency,
      expertise,
      languages: languages.length ? languages : ["Türkçe"],
      approaches,
      yearsExperience,
      rating,
      reviewCount,
      ...(services.length ? { services: { connect: services.map((id) => ({ id })) } } : {}),
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
    include: { slots: true, services: true },
  });

  return { ok: true, supervisor: supervisorRowToApi(row) };
}

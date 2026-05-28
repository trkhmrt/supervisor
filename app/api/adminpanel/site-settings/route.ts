export { dynamic, fetchCache } from "@/lib/db/api-route-config";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { GUARD } from "@/lib/auth/guard-presets";
import { parseStringArray, parseOptionalNumber } from "@/lib/db/admin-parse";
import {
  getHeroContent,
  getHomeContent,
  updateHeroContent,
  updateHomeContent,
  type UpdateHeroInput,
  type UpdateHomeInput,
} from "@/lib/db/site-settings";
import { prismaUnavailableMessage } from "@/lib/db/prisma-route";

export const GET = withAuth(async () => {
  try {
    const [hero, home] = await Promise.all([getHeroContent(), getHomeContent()]);
    return NextResponse.json({ hero, home });
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.settings.read);

function trimOrNull(value: unknown): string | null | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export const PATCH = withAuth(async (req) => {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data: UpdateHeroInput = {};
    const homeData: UpdateHomeInput = {};

    const stringFields: Array<[keyof UpdateHeroInput, string]> = [
      ["heroEyebrow", "heroEyebrow"],
      ["heroHeadlinePrefix", "heroHeadlinePrefix"],
      ["heroHeadlineSuffix", "heroHeadlineSuffix"],
      ["heroSubtext", "heroSubtext"],
      ["heroPrimaryCtaText", "heroPrimaryCtaText"],
      ["heroPrimaryCtaHref", "heroPrimaryCtaHref"],
      ["heroSecondaryCtaText", "heroSecondaryCtaText"],
      ["heroSecondaryCtaHref", "heroSecondaryCtaHref"],
      ["heroImageUrl", "heroImageUrl"],
      ["heroImageAlt", "heroImageAlt"],
      ["heroBadgeText", "heroBadgeText"],
    ];

    for (const [key, bodyKey] of stringFields) {
      if (bodyKey in body) {
        const v = trimOrNull(body[bodyKey]);
        if (v !== undefined) (data as Record<string, unknown>)[key] = v;
      }
    }

    if ("heroHeadlineWords" in body) {
      data.heroHeadlineWords = parseStringArray(body.heroHeadlineWords);
    }
    if ("heroFloatingKeywords" in body) {
      data.heroFloatingKeywords = parseStringArray(body.heroFloatingKeywords);
    }
    if ("homeTrustLabels" in body) {
      homeData.homeTrustLabels = parseStringArray(body.homeTrustLabels);
    }
    if ("homeWhyFeatureTitles" in body) {
      homeData.homeWhyFeatureTitles = parseStringArray(body.homeWhyFeatureTitles);
    }
    if ("homeWhyFeatureDescs" in body) {
      homeData.homeWhyFeatureDescs = parseStringArray(body.homeWhyFeatureDescs);
    }
    if ("homeWhyStepTitles" in body) {
      homeData.homeWhyStepTitles = parseStringArray(body.homeWhyStepTitles);
    }
    if ("homeWhyStepDescs" in body) {
      homeData.homeWhyStepDescs = parseStringArray(body.homeWhyStepDescs);
    }
    const homeStringFields: Array<[keyof UpdateHomeInput, string]> = [
      ["homeWhyEyebrow", "homeWhyEyebrow"],
      ["homeWhyTitle", "homeWhyTitle"],
      ["homeWhyHighlight", "homeWhyHighlight"],
    ];
    for (const [key, bodyKey] of homeStringFields) {
      if (bodyKey in body) {
        const v = trimOrNull(body[bodyKey]);
        if (v !== undefined) (homeData as Record<string, unknown>)[key] = v;
      }
    }
    if ("heroStatYears" in body) {
      data.heroStatYears =
        body.heroStatYears === null || body.heroStatYears === ""
          ? null
          : parseOptionalNumber(body.heroStatYears, 0);
    }
    if ("heroStatSessions" in body) {
      data.heroStatSessions =
        body.heroStatSessions === null || body.heroStatSessions === ""
          ? null
          : parseOptionalNumber(body.heroStatSessions, 0);
    }
    if ("heroStatRating" in body) {
      data.heroStatRating =
        body.heroStatRating === null || body.heroStatRating === ""
          ? null
          : parseOptionalNumber(body.heroStatRating, 0);
    }

    const [hero, home] = await Promise.all([updateHeroContent(data), updateHomeContent(homeData)]);
    return NextResponse.json({ hero, home });
  } catch (e) {
    return NextResponse.json({ error: prismaUnavailableMessage(e) }, { status: 503 });
  }
}, GUARD.settings.update);

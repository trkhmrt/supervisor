import { prisma } from "@/lib/prisma";
import type { HeroContent, HomeContent } from "@/lib/types";

const DEFAULT_HERO: HeroContent = {
  eyebrow: "Klinik Odaklı Süpervizyon",
  headlinePrefix: "Tedavi Yetkinliğinizi",
  headlineWords: ["Güvenle", "Derinlikle", "Etikle"],
  headlineSuffix: "Geliştirin",
  subtext:
    "Klinik ortamda aktif çalışan psikolog ve süpervizörler için tasarlanmış, tedavi odaklı bir gelişim alanı. Vaka paylaşımı, etik çerçeve ve takipli geri bildirimle süpervizyon sürecinizi güvenle yönetin.",
  primaryCtaText: "Hemen Randevu Al",
  primaryCtaHref: "/supervizorler",
  secondaryCtaText: "Klinik Hizmetler",
  secondaryCtaHref: "/hizmetler",
  statYears: 40,
  statSessions: 5000,
  statRating: 4.9,
  imageUrl: null,
  imageAlt: "Süpervizör",
  badgeText: "Süpervizyon Deneyimi",
  floatingKeywords: [
    "Vaka Analizi",
    "Etik Çerçeve",
    "Canlı Geri Bildirim",
    "Sürekli Gelişim",
  ],
};

const DEFAULT_HOME: HomeContent = {
  trustLabels: [
    "Etik Onayli",
    "Tedavi Odakli Surec",
    "Klinik Yetkin Uzmanlar",
    "Süpervizyon Dayanismasi",
  ],
  whyEyebrow: "Neden Biz?",
  whyTitle: "Klinik Mükemmellik",
  whyHighlight: "Soft Health Deneyimiyle",
  whyFeatureTitles: [
    "Doğrulanmış Uzman Kadrosu",
    "Kolay Randevu Akisi",
    "Sürdürülebilir Klinik Takip",
  ],
  whyFeatureDescs: [
    "Tum supervizorlerimiz aktif klinik vakalarla calisan, en az 10 yil tecrubeli uzmanlardan secilir.",
    "Takvim secimi, saat secimi ve onay tek panelde. Hatirlaticilar otomatik olarak olusturulur.",
    "Seans sonu geri bildirimleriniz kaybolmaz; bir sonraki surece dogrudan aktarilir.",
  ],
  whyStepTitles: [
    "Hızlı Rezervasyon",
    "Tedavi Odağına Uygun Eşleşme",
    "Takipli Seans Deneyimi",
  ],
  whyStepDescs: [
    "Saniyeler icinde takvimi goruntuleyin ve randevunuzu kesinlestirin.",
    "Vaka tipinize uygun uzmanlik alanlarini one cikarir ve secimi hizlandirir.",
    "Onaylanan randevularinizin tum detaylari panelinizde anlik gorunur.",
  ],
};

function nonEmpty(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export async function getHeroContent(): Promise<HeroContent> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_HERO;

  return {
    eyebrow: nonEmpty(row.heroEyebrow, DEFAULT_HERO.eyebrow),
    headlinePrefix: nonEmpty(row.heroHeadlinePrefix, DEFAULT_HERO.headlinePrefix),
    headlineWords:
      row.heroHeadlineWords.length > 0 ? row.heroHeadlineWords : DEFAULT_HERO.headlineWords,
    headlineSuffix: nonEmpty(row.heroHeadlineSuffix, DEFAULT_HERO.headlineSuffix),
    subtext: nonEmpty(row.heroSubtext, DEFAULT_HERO.subtext),
    primaryCtaText: nonEmpty(row.heroPrimaryCtaText, DEFAULT_HERO.primaryCtaText),
    primaryCtaHref: nonEmpty(row.heroPrimaryCtaHref, DEFAULT_HERO.primaryCtaHref),
    secondaryCtaText: nonEmpty(row.heroSecondaryCtaText, DEFAULT_HERO.secondaryCtaText),
    secondaryCtaHref: nonEmpty(row.heroSecondaryCtaHref, DEFAULT_HERO.secondaryCtaHref),
    statYears: row.heroStatYears ?? DEFAULT_HERO.statYears,
    statSessions: row.heroStatSessions ?? DEFAULT_HERO.statSessions,
    statRating: row.heroStatRating ?? DEFAULT_HERO.statRating,
    imageUrl: row.heroImageUrl?.trim() ? row.heroImageUrl.trim() : null,
    imageAlt: nonEmpty(row.heroImageAlt, DEFAULT_HERO.imageAlt),
    badgeText: nonEmpty(row.heroBadgeText, DEFAULT_HERO.badgeText),
    floatingKeywords:
      row.heroFloatingKeywords.length > 0
        ? row.heroFloatingKeywords
        : DEFAULT_HERO.floatingKeywords,
  };
}

export async function safeGetHeroContent(): Promise<HeroContent> {
  try {
    return await getHeroContent();
  } catch {
    return DEFAULT_HERO;
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_HOME;
  return {
    trustLabels: row.homeTrustLabels.length ? row.homeTrustLabels : DEFAULT_HOME.trustLabels,
    whyEyebrow: nonEmpty(row.homeWhyEyebrow, DEFAULT_HOME.whyEyebrow),
    whyTitle: nonEmpty(row.homeWhyTitle, DEFAULT_HOME.whyTitle),
    whyHighlight: nonEmpty(row.homeWhyHighlight, DEFAULT_HOME.whyHighlight),
    whyFeatureTitles:
      row.homeWhyFeatureTitles.length > 0 ? row.homeWhyFeatureTitles : DEFAULT_HOME.whyFeatureTitles,
    whyFeatureDescs:
      row.homeWhyFeatureDescs.length > 0 ? row.homeWhyFeatureDescs : DEFAULT_HOME.whyFeatureDescs,
    whyStepTitles: row.homeWhyStepTitles.length > 0 ? row.homeWhyStepTitles : DEFAULT_HOME.whyStepTitles,
    whyStepDescs: row.homeWhyStepDescs.length > 0 ? row.homeWhyStepDescs : DEFAULT_HOME.whyStepDescs,
  };
}

export async function safeGetHomeContent(): Promise<HomeContent> {
  try {
    return await getHomeContent();
  } catch {
    return DEFAULT_HOME;
  }
}

export async function getSiteSettingsRow() {
  return prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: "Süpervizyon",
      tagline: "",
      email: "",
      phone: "",
      address: "",
    },
    update: {},
  });
}

export type UpdateHeroInput = Partial<{
  heroEyebrow: string | null;
  heroHeadlinePrefix: string | null;
  heroHeadlineWords: string[];
  heroHeadlineSuffix: string | null;
  heroSubtext: string | null;
  heroPrimaryCtaText: string | null;
  heroPrimaryCtaHref: string | null;
  heroSecondaryCtaText: string | null;
  heroSecondaryCtaHref: string | null;
  heroStatYears: number | null;
  heroStatSessions: number | null;
  heroStatRating: number | null;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  heroBadgeText: string | null;
  heroFloatingKeywords: string[];
}>;

export type UpdateHomeInput = Partial<{
  homeTrustLabels: string[];
  homeWhyEyebrow: string | null;
  homeWhyTitle: string | null;
  homeWhyHighlight: string | null;
  homeWhyFeatureTitles: string[];
  homeWhyFeatureDescs: string[];
  homeWhyStepTitles: string[];
  homeWhyStepDescs: string[];
}>;

export async function updateHeroContent(input: UpdateHeroInput) {
  await getSiteSettingsRow();
  await prisma.siteSettings.update({ where: { id: "default" }, data: input });
  return getHeroContent();
}

export async function updateHomeContent(input: UpdateHomeInput) {
  await getSiteSettingsRow();
  await prisma.siteSettings.update({ where: { id: "default" }, data: input });
  return getHomeContent();
}

export { DEFAULT_HERO, DEFAULT_HOME };

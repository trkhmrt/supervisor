export const FOUNDER_AUTHOR_SLUG = "abdullatif-ramazan-celik";

export type FounderPillar = {
  title: string;
  description: string;
};

export type FounderPersonalStory = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  closing: string;
};

export type FounderPageContent = {
  roleBadge: string;
  platformLabel: string;
  headline: string;
  intro: string;
  visionTitle: string;
  visionText: string[];
  quote: string;
  personalStory: FounderPersonalStory;
  pillars: FounderPillar[];
  missionTitle: string;
  missionText: string;
};

export function isFounderAuthor(slug: string): boolean {
  return slug === FOUNDER_AUTHOR_SLUG;
}

export const DEFAULT_FOUNDER_PROFILE: FounderPageContent = {
  roleBadge: "Kurucu",
  platformLabel: "Süpervizyon Platformu",
  headline: "Klinik süpervizyonu erişilebilir, güvenilir ve sürdürülebilir kılmak için buradayım.",
  intro:
    "Abdullatif Ramazan Çelik, ruh sağlığı profesyonellerinin mesleki gelişimini desteklemek amacıyla Süpervizyon girişimini kurdu. Klinik deneyimini dijital bir ekosistemle buluşturarak; süpervizör, danışan ve eğitim süreçlerini tek çatı altında topluyor.",
  visionTitle: "Bu girişimi neden başlattım?",
  visionText: [
    "Süpervizyon, bir terapistin mesleki yolculuğunda en kritik duraklardan biridir. Ancak doğru süpervizöre ulaşmak, süreci güvenle yönetmek ve etik standartları korumak her zaman kolay olmuyor.",
    "Süpervizyon platformunu; alanında uzman süpervizörleri, şeffaf randevu akışını ve mesleki gelişimi destekleyen eğitim içeriklerini bir araya getiren, Türkiye odaklı bir klinik platform olarak tasarladım.",
    "Amacımız yalnızca randevu kolaylığı sunmak değil; ruh sağlığı profesyonellerinin güvenle büyüyebileceği, etik ve bilimsel standartlara bağlı kalabileceği bir topluluk inşa etmek.",
  ],
  pillars: [
    {
      title: "Etik & Güven",
      description: "Her süreçte gizlilik, mesleki sınırlar ve etik ilkeler önceliğimizdir.",
    },
    {
      title: "Klinik Derinlik",
      description: "Yüzeysel değil; vaka, ilişki ve mesleki kimlik üzerine odaklanan süpervizyon.",
    },
    {
      title: "Erişilebilirlik",
      description: "Online altyapı ile coğrafi sınırları aşan, planlanabilir bir deneyim.",
    },
    {
      title: "Topluluk",
      description: "Meslektaş dayanışması, akran süpervizyonu ve sürekli öğrenme kültürü.",
    },
  ],
  quote:
    "İyi bir süpervizyon ilişkisi, yalnızca teknik bilgi aktarmaz — terapistin kendini, mesleğini ve danışanıyla kurduğu bağı dönüştürür.",
  personalStory: {
    eyebrow: "Kendi adıma",
    title: "Ben kimim, neden buradayım?",
    paragraphs: [
      "Ben Abdullatif Ramazan Çelik. Yıllardır klinik psikoloji alanında çalışıyor, bireysel ve grup süpervizyonu süreçlerinde hem süpervizör hem de meslektaş olarak yer alıyorum. Mesleğe ilk adım attığım günden bu yana inandığım şey değişmedi: İyi bir terapist, yalnızca teknik bilgiyle değil; kendini tanıyan, sınırlarını bilen ve mesleki yolculuğunu yalnız yürütmeyen biri olarak yetişir.",
      "Klinik pratiğimde en çok öğrendiğim şey, süpervizyonun lüks değil ihtiyaç olduğuydu. Zor vakalar, tükenmişlik anları, mesleki kimlik sorgulamaları… Hepsinde yanımda duran şey; güvenli, eleştirel olmayan ve dönüştürücü bir süpervizyon ilişkisiydi. Bu deneyimi yalnızca kendi odamda değil, daha geniş bir ekosistemde paylaşmak istedim.",
      "Süpervizyon platformunu kurarken tek bir soruya cevap aradım: Ruh sağlığı profesyonelleri mesleki gelişimlerini desteklerken neden hâlâ dağınık, güvensiz ve erişimi zor süreçlerle karşılaşıyor? Doğru süpervizöre ulaşmak, randevuyu planlamak, etik sınırları korumak ve meslektaşlarla aynı dilde buluşmak — bunların hepsi aynı çatı altında olmalıydı.",
      "Bugün hem bu platformun kurucusu hem de aktif bir süpervizör olarak çalışmaya devam ediyorum. Her randevuda, her eğitimde ve her yazıda aynı ilkeyi koruyorum: Meslektaşımın gelişimine saygı duymak, etik standartlardan ödün vermemek ve klinik derinliği her zaman ön planda tutmak.",
    ],
    closing:
      "Bu girişim benim için bir teknoloji projesi değil; mesleğe duyduğum sorumluluğun ve meslektaşlarıma verdiğim sözün somut hâli.",
  },
  missionTitle: "Platform vizyonu",
  missionText:
    "Süpervizyon; süpervizör seçiminden randevu planlamaya, eğitim içeriklerinden mesleki dayanışmaya kadar ruh sağlığı profesyonellerinin ihtiyaç duyduğu tüm adımları tek bir güvenilir ekosistemde buluşturmayı hedefler.",
};

/** @deprecated use DEFAULT_FOUNDER_PROFILE */
export const FOUNDER_PROFILE = DEFAULT_FOUNDER_PROFILE;

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return fallback;
}

function asPillars(value: unknown, fallback: FounderPillar[]): FounderPillar[] {
  if (!Array.isArray(value)) return fallback;
  const parsed = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, "");
      const description = asString(row.description, "");
      if (!title) return null;
      return { title, description };
    })
    .filter((p): p is FounderPillar => Boolean(p));
  return parsed.length > 0 ? parsed : fallback;
}

export function resolveFounderContent(stored: unknown | null | undefined): FounderPageContent {
  const defaults = DEFAULT_FOUNDER_PROFILE;
  if (!stored || typeof stored !== "object") return defaults;

  const data = stored as Record<string, unknown>;
  const storedStory =
    data.personalStory && typeof data.personalStory === "object"
      ? (data.personalStory as Record<string, unknown>)
      : {};

  return {
    roleBadge: asString(data.roleBadge, defaults.roleBadge),
    platformLabel: asString(data.platformLabel, defaults.platformLabel),
    headline: asString(data.headline, defaults.headline),
    intro: asString(data.intro, defaults.intro),
    visionTitle: asString(data.visionTitle, defaults.visionTitle),
    visionText: asStringArray(data.visionText, defaults.visionText),
    quote: asString(data.quote, defaults.quote),
    personalStory: {
      eyebrow: asString(storedStory.eyebrow, defaults.personalStory.eyebrow),
      title: asString(storedStory.title, defaults.personalStory.title),
      paragraphs: asStringArray(storedStory.paragraphs, defaults.personalStory.paragraphs),
      closing: asString(storedStory.closing, defaults.personalStory.closing),
    },
    pillars: asPillars(data.pillars, defaults.pillars),
    missionTitle: asString(data.missionTitle, defaults.missionTitle),
    missionText: asString(data.missionText, defaults.missionText),
  };
}

export function parseFounderContentInput(body: unknown): FounderPageContent | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;
  const story =
    data.personalStory && typeof data.personalStory === "object"
      ? (data.personalStory as Record<string, unknown>)
      : null;

  const pillars = asPillars(data.pillars, []);
  const visionText = asStringArray(data.visionText, []);
  const paragraphs = story ? asStringArray(story.paragraphs, []) : [];

  if (
    !asString(data.headline, "") ||
    !asString(data.intro, "") ||
    !story ||
    paragraphs.length === 0 ||
    pillars.length === 0
  ) {
    return null;
  }

  return resolveFounderContent(body);
}

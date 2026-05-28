export const EXPERTISE_AREAS = [
  "Klinik Psikoloji",
  "Travma ve TSSB",
  "Çift ve Aile Terapisi",
  "Çocuk ve Ergen",
  "Bağımlılık",
  "Yas ve Kayıp",
  "Cinsel Sağlık",
  "Yeme Bozuklukları",
  "Obsesif Kompulsif Bozukluk",
  "Anksiyete Bozuklukları",
  "Depresyon",
  "Kişilik Bozuklukları",
  "Şizofreni ve Psikoz",
  "Stres Yönetimi",
  "Kimlik ve Cinsel Yönelim",
] as const;

export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

export const THERAPY_APPROACHES = [
  "Bilişsel Davranışçı Terapi (BDT)",
  "EMDR",
  "Şema Terapi",
  "Psikodinamik Terapi",
  "Varoluşçu Terapi",
  "Kabul ve Kararlılık Terapisi (ACT)",
  "Çözüm Odaklı Kısa Terapi",
  "Sistemik Aile Terapisi",
  "Oyun Terapisi",
  "Bilinçli Farkındalık (Mindfulness)",
  "Diyalektik Davranış Terapisi (DBT)",
  "Gestalt Terapisi",
  "Sanat Terapisi",
] as const;

export type TherapyApproach = (typeof THERAPY_APPROACHES)[number];

export const LANGUAGES = [
  "Türkçe",
  "İngilizce",
  "Almanca",
  "Fransızca",
  "Arapça",
  "İspanyolca",
  "Kürtçe",
] as const;

export type SupervisorLanguage = (typeof LANGUAGES)[number];

export function normalizeExpertise(values: string[] | undefined | null): string[] {
  if (!values) return [];
  const allowed = new Set<string>(EXPERTISE_AREAS as readonly string[]);
  return Array.from(new Set(values.filter((v) => allowed.has(v))));
}

export function normalizeApproaches(values: string[] | undefined | null): string[] {
  if (!values) return [];
  const allowed = new Set<string>(THERAPY_APPROACHES as readonly string[]);
  return Array.from(new Set(values.filter((v) => allowed.has(v))));
}

export function normalizeLanguages(values: string[] | undefined | null): string[] {
  if (!values) return [];
  const allowed = new Set<string>(LANGUAGES as readonly string[]);
  return Array.from(new Set(values.filter((v) => allowed.has(v))));
}

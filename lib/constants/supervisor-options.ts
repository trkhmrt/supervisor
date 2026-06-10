export const EXPERTISE_AREAS = [
  "Adli Psikoloji",
  "Anksiyete Bozuklukları",
  "Bağımlılık",
  "Cinsel Sağlık ve Terapi",
  "Cinsiyet ve Kimlik",
  "Çift ve Aile Terapisi",
  "Çocuk ve Ergen Psikolojisi",
  "Depresyon",
  "Dikkat Eksikliği ve Hiperaktivite (DEHB)",
  "Dissosiyatif Bozukluklar",
  "Endüstri ve Örgüt Psikolojisi",
  "Eğitim ve Okul Psikolojisi",
  "Evlilik Danışmanlığı",
  "Geriatrik Psikoloji",
  "Kariyer ve İş Yaşamı Psikolojisi",
  "Klinik Psikoloji",
  "Kişilik Bozuklukları",
  "Kronik Hastalık ve Ağrı",
  "Nöropsikoloji",
  "Obsesif Kompulsif Bozukluk",
  "Otizm Spektrum Bozukluğu",
  "Panik Bozukluk",
  "Perinatal ve Doğum Sonrası Psikoloji",
  "Psikoeğitim",
  "Psikosomatik Bozukluklar",
  "Rehabilitasyon Psikolojisi",
  "Sağlık Psikolojisi",
  "Sınav Kaygısı",
  "Sosyal Fobi",
  "Spor Psikolojisi",
  "Stres Yönetimi",
  "Travma ve TSSB",
  "Uyku Bozuklukları",
  "Yas ve Kayıp",
  "Yeme Bozuklukları",
  "Öfke Yönetimi",
  "Özgüven ve Özsaygı",
  "Şizofreni ve Psikoz",
] as const;

export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

export const THERAPY_APPROACHES = [
  "Bedensel Terapi (Somatik Terapi)",
  "Bilinçli Farkındalık (Mindfulness)",
  "Bilişsel Davranışçı Terapi (BDT)",
  "Bütünleşik Terapi Yaklaşımı",
  "Çözüm Odaklı Kısa Terapi",
  "Diyalektik Davranış Terapisi (DBT)",
  "Ego Durum Terapisi",
  "EMDR",
  "Feminist Terapi",
  "Gestalt Terapisi",
  "Gottman Yöntemi",
  "Grup Terapisi",
  "Hayvan Destekli Terapi",
  "Hipnoterapi",
  "İmago Terapi",
  "Kabul ve Kararlılık Terapisi (ACT)",
  "Kişilerarası İlişkiler Psikoterapisi",
  "Kişilerarası Terapi (KİT/KPT)",
  "Logoterapi",
  "Müzik Terapisi",
  "Narratif Terapi",
  "Oyun Terapisi",
  "Pozitif Psikoloji",
  "Psikodinamik Terapi",
  "Psikodrama",
  "Psikanalitik Terapi",
  "Rasyonel Duygucu Davranışçı Terapi (RDDT)",
  "Sanat Terapisi",
  "Sistemik Aile Terapisi",
  "Şema Terapi",
  "Transaksiyonel Analiz",
  "Travma Odaklı BDT",
  "Varoluşçu Terapi",
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

/** Eski kayıtlardaki etiketler → güncel liste */
const LEGACY_EXPERTISE_ALIASES: Record<string, ExpertiseArea> = {
  "Çocuk ve Ergen": "Çocuk ve Ergen Psikolojisi",
  "Cinsel Sağlık": "Cinsel Sağlık ve Terapi",
  "Kimlik ve Cinsel Yönelim": "Cinsiyet ve Kimlik",
};

function mapExpertiseValue(value: string): string | null {
  const allowed = new Set<string>(EXPERTISE_AREAS as readonly string[]);
  if (allowed.has(value)) return value;
  return LEGACY_EXPERTISE_ALIASES[value] ?? null;
}

export function normalizeExpertise(values: string[] | undefined | null): string[] {
  if (!values) return [];
  const mapped = values
    .map((v) => mapExpertiseValue(v.trim()))
    .filter((v): v is string => Boolean(v));
  return Array.from(new Set(mapped));
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

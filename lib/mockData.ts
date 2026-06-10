import type {
  Appointment,
  AvailabilitySlot,
  BlogPost,
  ContactMessage,
  NewsletterSubscriber,
  Review,
  Service,
  SiteSettings,
  Supervisor,
  SupervisorInvite,
  User,
} from "./types";
import { sessionFromParts, sessionToParts, toIso } from "./datetime";
import { addDaysISO } from "./utils";

function isoDay(days: number): string {
  return `${addDaysISO(days)}T12:00:00.000Z`;
}

function mockSlot(
  supervisorId: string,
  date: string,
  startTime: string,
  endTime: string,
  id: string,
  isBooked: boolean
): AvailabilitySlot {
  const session = sessionFromParts(date, startTime, endTime);
  return {
    id,
    supervisorId,
    ...sessionToParts(session.startsAt, session.endsAt),
    isBooked,
  };
}

function mockAppointment(
  base: Omit<Appointment, "startsAt" | "endsAt"> & {
    date: string;
    startTime: string;
    endTime: string;
  }
): Appointment {
  const session = sessionFromParts(base.date, base.startTime, base.endTime);
  return {
    ...base,
    startsAt: toIso(session.startsAt),
    endsAt: toIso(session.endsAt),
  };
}

export const SERVICES: Service[] = [
  {
    id: "individual",
    slug: "bireysel-supervizyon",
    name: "Bireysel Süpervizyon",
    shortDescription:
      "Süpervizörünüzle birebir, vakaya özel derinlemesine çalışma.",
    description:
      "Süpervizörünüzle birebir görüşmeler aracılığıyla danışan dosyalarınızı, kendi süreçlerinizi ve mesleki gelişiminizi derinlemesine ele alın. Tamamen size özel, gizli ve sürdürülebilir bir öğrenme alanı.",
    features: [
      "50 dakikalık birebir online seans",
      "Vaka odaklı çalışma",
      "Kendi alanınıza göre süpervizör eşleşmesi",
      "Seans sonrası yazılı not ve kaynak önerileri",
      "Esnek randevu saatleri",
    ],
    icon: "user",
    price: 1500,
    duration: 50,
    active: true,
    isGroupService: false,
  },
  {
    id: "group",
    slug: "grup-supervizyonu",
    name: "Grup Süpervizyonu",
    shortDescription:
      "Küçük gruplarda paylaşımla zenginleşen, akran öğrenmesini de içeren süreç.",
    description:
      "4-6 kişilik gruplarda yürütülen süpervizyon oturumları; farklı bakış açıları, paylaşılan vakalar ve grup dinamiğinin gücünden faydalanmanızı sağlar. Düzenli, yapılandırılmış ve ekonomik bir alternatif.",
    features: [
      "4-6 kişilik küçük gruplar",
      "Haftalık veya iki haftada bir oturum",
      "Yapılandırılmış vaka sunumu",
      "Grup dinamiği ve akran geri bildirimi",
      "Süpervizör moderasyonu",
    ],
    icon: "users",
    price: 750,
    duration: 90,
    active: true,
    isGroupService: true,
  },
  {
    id: "peer",
    slug: "akran-supervizyonu",
    name: "Akran Süpervizyonu",
    shortDescription:
      "Aynı düzeydeki meslektaşlarla, eşit zeminde paylaşım ve öğrenme.",
    description:
      "Benzer deneyim düzeyine sahip ruh sağlığı profesyonelleriyle oluşturulan akran grupları aracılığıyla deneyimlerinizi paylaşın, güvenli geri bildirim alın ve mesleki dayanışma ağınızı genişletin.",
    features: [
      "Eşit deneyim düzeyinde gruplar",
      "Moderasyonlu yapı",
      "Düşük maliyet, yüksek paylaşım",
      "Aylık tema odaklı çalışma",
      "Online gizli grup alanı",
    ],
    icon: "handshake",
    price: 450,
    duration: 90,
    active: true,
    isGroupService: true,
  },
  {
    id: "simulation",
    slug: "gorusme-simulasyonu",
    name: "Görüşme Simülasyonu",
    shortDescription:
      "Eğitimli simülasyon danışanlarıyla pratik yaparak becerilerinizi geliştirin.",
    description:
      "Eğitimli simülasyon danışanlarıyla yürütülen yapılandırılmış oturumlar sayesinde gerçek bir terapi seansına en yakın koşullarda pratik yapın. Süpervizörünüzün anlık geri bildirimleriyle becerilerinizi atölye ortamında geliştirin.",
    features: [
      "Eğitimli simülasyon danışanları",
      "Süpervizör eşliğinde",
      "Anlık geri bildirim ve video kayıt",
      "Senaryolu vaka çalışması",
      "Beceri odaklı değerlendirme",
    ],
    icon: "stage",
    price: 1200,
    duration: 75,
    active: true,
    isGroupService: false,
  },
  {
    id: "egitim",
    slug: "egitim",
    name: "Eğitim",
    shortDescription:
      "Yapılandırılmış mesleki eğitim programları ve atölye çalışmaları.",
    description:
      "Ruh sağlığı profesyonelleri için tasarlanmış eğitim programları, vaka temelli atölyeler ve süpervizyon öncesi/sonrası destekleyici eğitim modülleri. Teorik bilgiyi uygulamayla buluşturan interaktif öğrenme deneyimleri sunar.",
    features: [
      "Konuya özel eğitim modülleri",
      "Canlı ve kayıtlı oturum seçenekleri",
      "Vaka temelli atölye çalışmaları",
      "Sertifika ve katılım belgesi",
      "Online interaktif format",
    ],
    icon: "graduation",
    price: 0,
    duration: 120,
    active: true,
    isGroupService: true,
  },
  {
    id: "psikoegitim",
    slug: "psikoegitim",
    name: "Psikoeğitim",
    shortDescription:
      "Danışan ve profesyonellere yönelik psikoeğitim oturumları.",
    description:
      "Belirli konularda bilgilendirme, farkındalık geliştirme ve beceri kazandırmaya odaklanan psikoeğitim oturumları. Bireysel veya grup formatında, yapılandırılmış içerik ve uygulamalı egzersizlerle sunulur.",
    features: [
      "Konuya özel psikoeğitim içerikleri",
      "Bireysel veya grup oturumları",
      "Uygulamalı egzersizler",
      "Destekleyici materyaller",
      "Online erişim",
    ],
    icon: "book",
    price: 0,
    duration: 60,
    active: true,
    isGroupService: true,
  },
];

export const SUPERVISORS: Supervisor[] = [
  {
    id: "sup-1",
    userId: 2,
    fullName: "Abdullatif Ramazan Çelik",
    title: "Psikolog",
    photo: "/images/abdullatif.png",
    bio: "Klinik psikoloji alanında bireysel ve grup süpervizyonu hizmetleri sunuyorum. Çalışmalarımı bütüncül bir yaklaşımla, danışan ve süpervizyon alanın özgün ihtiyaçlarına göre şekillendiriyorum. Her görüşmede güvenli, eleştirel olmayan ve dönüştürücü bir alan yaratmayı önemserim.",
    expertise: [
      "Bireysel Süpervizyon",
      "Bütüncül Terapi",
      "Travma Odaklı Çalışma",
      "Genç Yetişkin",
    ],
    pricePerSession: 1500,
    currency: "TRY",
    rating: 4.9,
    reviewCount: 47,
    yearsExperience: 8,
    license: "TPD No: 12345",
    languages: ["Türkçe", "İngilizce"],
    approaches: ["Bütüncül", "Şema Terapi", "BDT"],
    availability: generateAvailabilityFor("sup-1"),
  },
  {
    id: "sup-2",
    fullName: "Dr. Ayşe Demir",
    title: "Klinik Psikolog",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
    bio: "Uzun yıllardır çift ve aile danışmanlığı süpervizyonu üzerine çalışıyorum. Süpervizyonu sadece bilgi aktarımı değil, terapistin profesyonel ve kişisel gelişimi için sürekli bir yolculuk olarak görüyorum.",
    expertise: ["Çift ve Aile", "Bağlanma Teorisi", "Sistemik Terapi"],
    pricePerSession: 1800,
    currency: "TRY",
    rating: 4.8,
    reviewCount: 63,
    yearsExperience: 14,
    license: "TPD No: 09876",
    languages: ["Türkçe", "İngilizce", "Almanca"],
    approaches: ["Sistemik", "EFT", "Bağlanma Odaklı"],
    availability: generateAvailabilityFor("sup-2"),
  },
  {
    id: "sup-3",
    fullName: "Prof. Dr. Mehmet Kaya",
    title: "Psikiyatrist",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80",
    bio: "Psikoterapi ve psikiyatri kesişiminde, özellikle anksiyete ve duygudurum bozuklukları üzerine süpervizyon veriyorum. Bilimsel temelli, dinamik ve etik odaklı bir yaklaşımı benimserim.",
    expertise: ["Anksiyete Bozuklukları", "Duygudurum", "İlaç+Terapi Entegrasyonu"],
    pricePerSession: 2200,
    currency: "TRY",
    rating: 4.95,
    reviewCount: 89,
    yearsExperience: 22,
    license: "Tabip Odası No: 22334",
    languages: ["Türkçe", "İngilizce"],
    approaches: ["Psikodinamik", "BDT", "Entegre Yaklaşım"],
    availability: generateAvailabilityFor("sup-3"),
  },
];

function generateAvailabilityFor(supervisorId: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const times = ["09:00", "10:30", "13:00", "15:00", "17:00", "19:00"];
  for (let day = 1; day <= 21; day++) {
    const date = addDaysISO(day);
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) continue;
    const available = times.slice(0, Math.floor(Math.random() * 4) + 2);
    available.forEach((startTime, idx) => {
      const [h, m] = startTime.split(":").map(Number);
      const endTotal = h * 60 + m + 50;
      const endTime = `${String(Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;
      slots.push(
        mockSlot(
          supervisorId,
          date,
          startTime,
          endTime,
          `${supervisorId}-${date}-${idx}`,
          Math.random() < 0.2
        )
      );
    });
  }
  return slots;
}

export const REVIEWS: Review[] = [
  {
    id: "r1",
    supervisorId: "sup-1",
    authorName: "Zeynep A.",
    rating: 5,
    comment:
      "Abdullatif Bey'in sakin, derinlikli yaklaşımı süpervizyon süreçlerimi kökten dönüştürdü. Vakaları farklı katmanlarda görmemi sağlıyor.",
    createdAt: isoDay(-30),
  },
  {
    id: "r2",
    supervisorId: "sup-1",
    authorName: "Emre K.",
    rating: 5,
    comment:
      "Yargılayıcı olmayan, güvenli bir alan. Hem mesleki hem kişisel olarak çok şey öğrendim.",
    createdAt: isoDay(-45),
  },
  {
    id: "r3",
    supervisorId: "sup-1",
    authorName: "Selin Y.",
    rating: 4,
    comment:
      "Açıklamaları çok net, vakaya yaklaşımı zihin açıcı. Devam edeceğim.",
    createdAt: isoDay(-60),
  },
  {
    id: "r4",
    supervisorId: "sup-2",
    authorName: "Mert D.",
    rating: 5,
    comment:
      "Sistemik perspektif konusundaki ustalığı ve sıcak tavrı muhteşem.",
    createdAt: isoDay(-50),
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    slug: "supervizyon-neden-onemli",
    title: "Süpervizyon Neden Önemli? Terapistler için Yol Haritası",
    excerpt:
      "Süpervizyon, sadece deneyim eksikliğini kapatan bir araç değil; meslek hayatının her aşamasında zorunlu bir gelişim alanı.",
    content:
      "Süpervizyon, ruh sağlığı çalışanları için sadece deneyim eksikliğini kapatan bir araç değildir. Aksine, meslek hayatının her aşamasında, vakalarla daha sağlıklı çalışabilmek, terapistin kendi süreçlerini görebilmesi ve etik bütünlüğünü koruyabilmesi için zorunlu bir gelişim alanıdır.\n\nİyi bir süpervizyon ilişkisi; güvenli, eleştirel olmayan ve yargılayıcı tutumdan uzak bir alan sunmalıdır. Süpervizör, terapistin gölgede kalan yanlarını ona kibarca gösterirken, aynı zamanda profesyonel kimliğin oluşumuna eşlik eder.\n\nBu yazıda süpervizyonun ne olduğu, ne olmadığı ve etkili bir süpervizyon ilişkisi için dikkat etmeniz gereken noktaları ele alıyoruz.",
    cover:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=80",
    author: "Abdullatif Ramazan Çelik",
    category: "Süpervizyon",
    tags: ["süpervizyon", "terapist", "mesleki gelişim"],
    publishedAt: isoDay(30),
    readingTime: 6,
    published: true,
  },
  {
    id: "b2",
    slug: "grup-supervizyonunun-gucu",
    title: "Grup Süpervizyonunun Gücü: Birlikte Öğrenmek",
    excerpt:
      "Grup süpervizyonu, farklı bakış açılarının buluştuğu bir alan. Peki bu sürecin işe yaramasının ardındaki dinamikler nedir?",
    content:
      "Grup süpervizyonu, terapistlerin meslektaşlarıyla birlikte vakalar üzerinde çalıştığı yapılandırılmış bir öğrenme alanıdır. Akran geri bildirimi, çoklu bakış açısı ve grup dinamiklerinin terapist üzerindeki dönüştürücü etkisini bir arada sunar.\n\nBu yazıda; iyi bir grup süpervizyonunun nasıl seçileceğini, hangi durumlarda grup, hangi durumlarda bireysel süpervizyonun tercih edilmesi gerektiğini paylaşıyoruz.",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
    author: "Editor",
    category: "Süpervizyon",
    tags: ["grup", "akran"],
    publishedAt: isoDay(14),
    readingTime: 4,
    published: true,
  },
  {
    id: "b3",
    slug: "etik-sinirlar",
    title: "Süpervizyonda Etik Sınırlar",
    excerpt:
      "Süpervizör-süpervizyon alan ilişkisinde sıkça karşılaşılan etik dilemmalar ve bu durumları yönetme önerileri.",
    content:
      "Süpervizyon ilişkisi, hem öğretici hem destekleyici hem de değerlendirici işlevleri bir arada barındıran karmaşık bir ilişki türüdür. Tam da bu nedenle etik sınırların gözetilmesi kritik öneme sahiptir.\n\nÇifte ilişkiler, gizlilik, yetkinlik alanı ve değerlendirme adaleti gibi temel başlıklar bu yazıda ele alınıyor.",
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    author: "Dr. Ayşe Demir",
    category: "Etik",
    tags: ["etik", "süpervizyon"],
    publishedAt: isoDay(-5),
    readingTime: 7,
    published: true,
  },
  {
    id: "b4",
    slug: "gorusme-simulasyonu-nedir",
    title: "Görüşme Simülasyonu Nedir, Kimler İçin?",
    excerpt:
      "Eğitimli simülasyon danışanlarıyla yürütülen seanslar; kuramsal bilgi ile pratiği buluşturuyor.",
    content:
      "Görüşme simülasyonu, terapistin gerçek bir vakaya yakın bir senaryoda eğitimli bir simülasyon danışanı ile çalışmasına olanak tanır. Süreç boyunca süpervizör tarafından izlenir ve seans sonunda yapılandırılmış geri bildirim alınır.\n\nKuramsal bilgiyi pratiğe taşımak, beceri kazanmak ve özgüven inşa etmek için en etkili modellerden biridir.",
    cover:
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1200&q=80",
    author: "Prof. Dr. Mehmet Kaya",
    category: "Eğitim",
    tags: ["simülasyon", "beceri"],
    publishedAt: isoDay(-25),
    readingTime: 5,
    published: true,
  },
];

export const APPOINTMENTS: Appointment[] = [
  mockAppointment({
    id: "a1",
    supervisorId: "sup-1",
    supervisorName: "Abdullatif Ramazan Çelik",
    userId: 3,
    superviseeName: "Zeynep Aydın",
    superviseeEmail: "zeynep@example.com",
    superviseePhone: "05551234567",
    serviceType: "individual",
    date: addDaysISO(3),
    startTime: "10:30",
    endTime: "11:20",
    status: "confirmed",
    meetLink: "https://meet.google.com/abc-defg-hij",
    paymentApproved: true,
    amount: 1500,
    notes: "İlk seans",
    createdAt: addDaysISO(-2),
  }),
  mockAppointment({
    id: "a2",
    supervisorId: "sup-2",
    supervisorName: "Dr. Ayşe Demir",
    userId: 4,
    superviseeName: "Mert Doğan",
    superviseeEmail: "mert@example.com",
    superviseePhone: "05559876543",
    serviceType: "individual",
    date: addDaysISO(5),
    startTime: "15:00",
    endTime: "15:50",
    status: "pending_payment",
    paymentApproved: false,
    amount: 1800,
    createdAt: addDaysISO(-1),
  }),
  mockAppointment({
    id: "a3",
    supervisorId: "sup-1",
    supervisorName: "Abdullatif Ramazan Çelik",
    userId: 5,
    superviseeName: "Selin Yıldız",
    superviseeEmail: "selin@example.com",
    superviseePhone: "05553334455",
    serviceType: "individual",
    date: addDaysISO(-7),
    startTime: "13:00",
    endTime: "13:50",
    status: "completed",
    meetLink: "https://meet.google.com/xyz-uvwx-rst",
    paymentApproved: true,
    amount: 1500,
    createdAt: addDaysISO(-14),
  }),
];

export const USERS: User[] = [
  {
    id: 1,
    email: "admin@supervizyon.com",
    fullName: "Admin Kullanıcı",
    role: "admin",
    emailVerified: true,
    createdAt: addDaysISO(-90),
    password: "admin123",
  },
  {
    id: 2,
    email: "abdullatif@supervizyon.com",
    fullName: "Abdullatif Ramazan Çelik",
    title: "Psikolog",
    role: "supervisor",
    emailVerified: true,
    profession: "Psikolog",
    experienceYears: 8,
    license: "TPD No: 12345",
    createdAt: addDaysISO(-180),
    password: "supervisor123",
  },
  {
    id: 3,
    email: "zeynep@example.com",
    fullName: "Zeynep Aydın",
    role: "user",
    emailVerified: true,
    profession: "Psikolog",
    experienceYears: 2,
    createdAt: addDaysISO(-30),
    password: "demo1234",
  },
  {
    id: 4,
    email: "mert@example.com",
    fullName: "Mert Doğan",
    role: "user",
    emailVerified: true,
    profession: "PDR Uzmanı",
    experienceYears: 4,
    createdAt: addDaysISO(-12),
    password: "demo1234",
  },
  {
    id: 5,
    email: "selin@example.com",
    fullName: "Selin Yıldız",
    role: "user",
    emailVerified: true,
    createdAt: addDaysISO(-20),
    password: "demo1234",
  },
];

export const SUPERVISOR_INVITES: SupervisorInvite[] = [
  {
    id: "inv-1",
    token: "demo-invite-token",
    email: "yeni.supervizor@example.com",
    invitedAt: isoDay(-1),
    expiresAt: isoDay(6),
    status: "pending",
  },
];

export const NEWSLETTER: NewsletterSubscriber[] = [];

export const CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: "m1",
    name: "Ali Veli",
    email: "ali@example.com",
    subject: "Süpervizyon hakkında bilgi",
    message: "Grup süpervizyonuna nasıl katılabilirim?",
    createdAt: isoDay(-2),
    read: false,
  },
];

export const SITE_SETTINGS: SiteSettings = {
  siteName: "Süpervizyon",
  tagline: "Ruh sağlığı profesyonelleri için güvenli, derinlikli bir öğrenme alanı.",
  email: "merhaba@supervizyon.com",
  phone: "+90 (212) 000 00 00",
  address: "İstanbul, Türkiye",
  socials: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  },
};

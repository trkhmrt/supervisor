import type { AppointmentStatus, UserRole } from "@/lib/types";

export type RoleSeed = {
  key: UserRole;
  label: string;
  description: string;
  sortOrder: number;
};

export type AppointmentStatusSeed = {
  key: AppointmentStatus;
  label: string;
  description: string;
  colorClass: string;
  sortOrder: number;
  visibleToSupervisor: boolean;
};

export const ROLE_SEED: RoleSeed[] = [
  {
    key: "user",
    label: "Üye",
    description: "Süpervizörlerden randevu alabilen danışan hesabı.",
    sortOrder: 1,
  },
  {
    key: "supervisor",
    label: "Süpervizör",
    description: "Seans veren, takvim ve randevularını yöneten uzman hesabı.",
    sortOrder: 2,
  },
  {
    key: "admin",
    label: "Admin",
    description: "Panel yönetimi ve sistem işlemleri için yönetici hesabı.",
    sortOrder: 3,
  },
];

export const APPOINTMENT_STATUS_SEED: AppointmentStatusSeed[] = [
  {
    key: "pending_payment",
    label: "Ödeme Onayı Bekliyor",
    description: "Randevu oluşturuldu; ödeme dekontu inceleniyor veya onay bekleniyor.",
    colorClass: "bg-amber-50 text-amber-700 border-amber-100",
    sortOrder: 1,
    visibleToSupervisor: false,
  },
  {
    key: "confirmed",
    label: "Aktif",
    description: "Ödeme onaylandı; randevu geçerli ve görüşmeye hazır.",
    colorClass: "bg-green-50 text-green-700 border-green-100",
    sortOrder: 2,
    visibleToSupervisor: true,
  },
  {
    key: "rescheduled",
    label: "Yeniden Planlandı",
    description: "Randevu yeni bir tarih/saate alındı.",
    colorClass: "bg-blue-50 text-blue-700 border-blue-100",
    sortOrder: 3,
    visibleToSupervisor: true,
  },
  {
    key: "completed",
    label: "Tamamlandı",
    description: "Seans gerçekleştirildi.",
    colorClass: "bg-navy-50 text-navy-700 border-navy-100",
    sortOrder: 4,
    visibleToSupervisor: true,
  },
  {
    key: "cancelled",
    label: "İptal Edildi",
    description: "Randevu iptal edildi.",
    colorClass: "border-black/15 bg-[#f1f0f0] text-black",
    sortOrder: 5,
    visibleToSupervisor: true,
  },
];

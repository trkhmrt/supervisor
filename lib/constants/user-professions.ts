export const USER_PROFESSIONS = [
  "Öğrenci",
  "Klinik Psikolog",
  "Psikolojik Danışman",
] as const;

export type UserProfession = (typeof USER_PROFESSIONS)[number];

export function isUserProfession(value: string): value is UserProfession {
  return (USER_PROFESSIONS as readonly string[]).includes(value);
}

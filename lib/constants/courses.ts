export const DEFAULT_COURSE_COVER = "/images/abdullatif.png";

export function courseCoverUrl(cover?: string | null): string {
  const trimmed = cover?.trim();
  return trimmed || DEFAULT_COURSE_COVER;
}

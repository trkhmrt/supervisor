export function normalizePhone(value: string): string {
  return value.replace(/\s/g, "").replace(/[()-]/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function normalizePhone(value: string): string {
  return value.replace(/\s/g, "").replace(/[()-]/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = normalizePhone(value).replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export function phoneToWhatsAppDigits(value: string): string | null {
  let digits = normalizePhone(value).replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  else if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  return digits;
}

export function whatsAppUrl(value: string): string | null {
  const digits = phoneToWhatsAppDigits(value);
  return digits ? `https://wa.me/${digits}` : null;
}

export function formatPhoneDisplay(value: string): string {
  const trimmed = value.trim();
  return trimmed || "—";
}

/** YYYY-MM-DD → UTC gün (öğlen, timezone kayması önlenir) */
export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Tarih + HH:mm → UTC DateTime */
export function sessionFromParts(
  dateYmd: string,
  startHm: string,
  endHm: string
): { startsAt: Date; endsAt: Date } {
  const [y, mo, d] = dateYmd.split("-").map(Number);
  const [sh, sm] = startHm.split(":").map(Number);
  const [eh, em] = endHm.split(":").map(Number);
  return {
    startsAt: new Date(Date.UTC(y, mo - 1, d, sh, sm, 0)),
    endsAt: new Date(Date.UTC(y, mo - 1, d, eh, em, 0)),
  };
}

export function ymdFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function hmFromDate(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function toIso(d: Date): string {
  return d.toISOString();
}

export function fromIso(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** API / UI için randevu & slot alanları */
export function sessionToParts(startsAt: Date, endsAt: Date) {
  return {
    date: ymdFromDate(startsAt),
    startTime: hmFromDate(startsAt),
    endTime: hmFromDate(endsAt),
    startsAt: toIso(startsAt),
    endsAt: toIso(endsAt),
  };
}

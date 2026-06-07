export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export type ParsedUserAgent = {
  browser: string;
  os: string;
  deviceType: DeviceType;
};

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua?.trim()) {
    return { browser: "Bilinmiyor", os: "Bilinmiyor", deviceType: "unknown" };
  }

  const lower = ua.toLowerCase();

  if (/bot|crawler|spider|slurp|facebookexternalhit|preview|headless|lighthouse/.test(lower)) {
    return { browser: "Bot", os: "Bot", deviceType: "bot" };
  }

  let deviceType: DeviceType = "desktop";
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(lower)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(lower)) {
    deviceType = "mobile";
  }

  let browser = "Diğer";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("firefox/")) browser = "Firefox";
  else if (lower.includes("opr/") || lower.includes("opera")) browser = "Opera";
  else if (lower.includes("chrome/") || lower.includes("crios/")) browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";

  let os = "Diğer";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os x") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("android")) os = "Android";
  else if (/iphone|ipad|ipod/.test(lower)) os = "iOS";
  else if (lower.includes("linux")) os = "Linux";

  return { browser, os, deviceType };
}

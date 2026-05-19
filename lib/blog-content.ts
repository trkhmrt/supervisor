/** Düz metni blog detayında HTML paragraflarına çevirir. */
export function blogContentToHtml(content: string): string {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br />")}</p>`)
    .join("");
}

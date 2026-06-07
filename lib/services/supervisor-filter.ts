import type { Service } from "@/lib/types";

type ServiceRef = Pick<Service, "id" | "slug">;

/** Hizmet detayından süpervizör listesine yönlendirme URL'i */
export function supervisorsListHref(service: ServiceRef): string {
  return `/supervizorler?hizmet=${encodeURIComponent(service.slug)}`;
}

/** Süpervizör profiline hizmet bağlamı ile yönlendirme */
export function supervisorProfileHref(supervisorId: string, service?: ServiceRef | null): string {
  if (!service) return `/supervizorler/${supervisorId}`;
  return `/supervizorler/${supervisorId}?hizmet=${encodeURIComponent(service.slug)}`;
}

/** URL'deki hizmet parametresini (id veya slug) filtre için service id'ye çevirir */
export function resolveServiceFilterId(
  param: string | null | undefined,
  services: ServiceRef[]
): string | null {
  if (!param?.trim() || param === "all") return null;
  const raw = param.trim();
  const byId = services.find((s) => s.id === raw);
  if (byId) return byId.id;
  const bySlug = services.find((s) => s.slug === raw);
  return bySlug?.id ?? null;
}

/** Filtre state'i için URL'de gösterilecek slug */
export function serviceFilterParamValue(serviceId: string, services: ServiceRef[]): string {
  return services.find((s) => s.id === serviceId)?.slug ?? serviceId;
}

/** searchParams.hizmet değerinden randevu/profil için uygun hizmeti seçer */
export function pickBookingServiceForSupervisor(
  hizmetParam: string | undefined,
  services: Service[],
  supervisorServices: Pick<Service, "id" | "slug">[] | undefined
): Service | null {
  const offered = (supervisorServices ?? [])
    .map((ss) => services.find((s) => s.id === ss.id || s.slug === ss.slug))
    .filter((s): s is Service => Boolean(s));

  if (offered.length === 0) {
    return services.find((s) => s.slug === "bireysel-supervizyon") ?? services[0] ?? null;
  }

  if (hizmetParam?.trim()) {
    const match = offered.find((s) => s.id === hizmetParam || s.slug === hizmetParam);
    if (match) return match;
  }

  return (
    offered.find((s) => s.slug === "bireysel-supervizyon") ??
    offered.find((s) => !s.isGroupService) ??
    offered[0] ??
    null
  );
}

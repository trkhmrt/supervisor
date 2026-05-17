import { safeGetActiveServices } from "@/lib/db/queries";
import { HizmetlerPageClient } from "./HizmetlerPageClient";

export const dynamic = "force-dynamic";

export default async function HizmetlerPage() {
  const { data: services, error } = await safeGetActiveServices();

  return <HizmetlerPageClient services={services} fetchError={error} />;
}

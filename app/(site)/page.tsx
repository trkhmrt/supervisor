import { HomePageClient } from "./HomePageClient";
import { safeGetActiveServices, safeGetSupervisors } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ data: services }, { data: supervisors }] = await Promise.all([
    safeGetActiveServices(),
    safeGetSupervisors(),
  ]);

  return <HomePageClient services={services} supervisors={supervisors} />;
}

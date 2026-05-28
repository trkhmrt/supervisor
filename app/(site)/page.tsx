import { HomePageClient } from "./HomePageClient";
import { safeGetActiveServices, safeGetSupervisors } from "@/lib/db/queries";
import { safeGetHeroContent, safeGetHomeContent } from "@/lib/db/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ data: services }, { data: supervisors }, hero, home] = await Promise.all([
    safeGetActiveServices(),
    safeGetSupervisors(),
    safeGetHeroContent(),
    safeGetHomeContent(),
  ]);

  return (
    <HomePageClient services={services} supervisors={supervisors} hero={hero} home={home} />
  );
}

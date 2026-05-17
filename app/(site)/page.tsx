import { HomePageClient } from "./HomePageClient";
import { getActiveServices, getSupervisors } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, supervisors] = await Promise.all([getActiveServices(), getSupervisors()]);

  return <HomePageClient services={services} supervisors={supervisors} />;
}

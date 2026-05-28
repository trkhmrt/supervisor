import { safeGetActiveServices, safeGetSupervisors } from "@/lib/db/queries";
import { SupervisorsPageClient } from "./SupervisorsPageClient";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  const [{ data: supervisors, error }, { data: services }] = await Promise.all([
    safeGetSupervisors(),
    safeGetActiveServices(),
  ]);

  return (
    <SupervisorsPageClient
      supervisors={supervisors}
      services={services}
      fetchError={error}
    />
  );
}

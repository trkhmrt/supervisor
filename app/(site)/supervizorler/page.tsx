import { safeGetSupervisors } from "@/lib/db/queries";
import { SupervisorsPageClient } from "./SupervisorsPageClient";

export const dynamic = "force-dynamic";

export default async function SupervisorsPage() {
  const { data: supervisors, error } = await safeGetSupervisors();

  return <SupervisorsPageClient supervisors={supervisors} fetchError={error} />;
}

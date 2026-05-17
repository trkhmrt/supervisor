import { safeGetSupervisors } from "@/lib/db/queries";
import { HakkimizdaPageClient } from "./HakkimizdaPageClient";

export const dynamic = "force-dynamic";

export default async function HakkimizdaPage() {
  const { data: supervisors } = await safeGetSupervisors();

  return <HakkimizdaPageClient supervisors={supervisors} />;
}

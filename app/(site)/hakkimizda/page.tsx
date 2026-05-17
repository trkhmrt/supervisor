import { getSupervisors } from "@/lib/db/queries";
import { HakkimizdaPageClient } from "./HakkimizdaPageClient";

export const dynamic = "force-dynamic";

export default async function HakkimizdaPage() {
  const supervisors = await getSupervisors();

  return <HakkimizdaPageClient supervisors={supervisors} />;
}

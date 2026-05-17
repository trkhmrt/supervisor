import { SiteShell } from "@/components/site/SiteShell";
import { getActiveServices } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/** Site geneli: navbar (Header) + içerik + footer */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const services = await getActiveServices();

  return <SiteShell services={services}>{children}</SiteShell>;
}

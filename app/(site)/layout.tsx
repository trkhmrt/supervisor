import { SiteShell } from "@/components/site/SiteShell";
import { safeGetActiveServices } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

/** Site geneli: navbar (Header) + içerik + footer */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: services, error } = await safeGetActiveServices();
  if (error) {
    console.error("[SiteLayout] Veritabanı:", error);
  }

  return <SiteShell services={services}>{children}</SiteShell>;
}

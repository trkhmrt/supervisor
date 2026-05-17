import { Header } from "./Header";
import { Footer } from "./Footer";
import type { Service } from "@/lib/types";

/** `services` SSR ile sunucudan geçirilir (Header menüsü). */
export function SiteShell({
  children,
  services = [],
}: {
  children: React.ReactNode;
  services?: Service[];
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header services={services} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

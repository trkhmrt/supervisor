"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    useAppStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-gradient text-cream">
            <span className="font-display text-lg font-bold">S</span>
          </div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-sand-200">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-teal-600" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

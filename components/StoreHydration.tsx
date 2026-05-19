"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}

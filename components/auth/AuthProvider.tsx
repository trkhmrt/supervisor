"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchSessionUser, syncSessionToStore } from "@/lib/auth/client";
import { useAppStore } from "@/lib/store";

/** Site + admin panel oturumunu dinler; rol ve scope Zustand'a yazılır. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuthUser = useAppStore((s) => s.setAuthUser);
  const setAuthReady = useAppStore((s) => s.setAuthReady);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    const applySession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const user = await syncSessionToStore();
          if (user) setAuthUser(user);
          else logout();
        } else {
          const user = await fetchSessionUser();
          if (user) setAuthUser(user);
          else logout();
        }
      } finally {
        setAuthReady(true);
      }
    };

    void applySession();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        const user = await syncSessionToStore();
        if (user) setAuthUser(user);
      } else if (event === "SIGNED_OUT") {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, [setAuthUser, setAuthReady, logout]);

  return <>{children}</>;
}

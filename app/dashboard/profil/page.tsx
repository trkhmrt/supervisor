"use client";

import { useEffect } from "react";
import { ProfileView } from "@/components/profile/ProfileView";
import { fetchSessionUser } from "@/lib/auth/client";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
  const user = useSessionUser();
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    void fetchSessionUser().then((fresh) => {
      if (fresh) setAuthUser(fresh);
    });
  }, [setAuthUser]);

  if (!user) {
    return <p className="text-sm text-clinical-muted">Profil yükleniyor…</p>;
  }

  return (
    <ProfileView
      user={user}
      variant={user.role === "admin" ? "adminpanel" : "panel"}
    />
  );
}

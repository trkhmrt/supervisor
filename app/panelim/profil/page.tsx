"use client";

import { ProfileView } from "@/components/profile/ProfileView";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function ProfilePage() {
  const user = useSessionUser();

  if (!user) {
    return <p className="text-sm text-clinical-muted">Profil yükleniyor…</p>;
  }

  return <ProfileView user={user} variant="panel" />;
}

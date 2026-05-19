"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SupervisorCalendarPanel } from "@/components/dashboard/SupervisorCalendarPanel";
import { useSessionUser } from "@/hooks/useSessionUser";

export default function DashboardCalendarPage() {
  const router = useRouter();
  const user = useSessionUser()!;

  useEffect(() => {
    if (user.role !== "supervisor") {
      router.replace("/dashboard");
    }
  }, [user.role, router]);

  if (user.role !== "supervisor") return null;

  return (
    <>
      <div className="mb-10">
        <h1 className="h2-premium text-3xl">Takvim</h1>
        <p className="mt-2 text-sm text-clinical-muted">
          Gün ve saat müsaitliğinizi yönetin; danışanlar randevu alırken bu takvimi görür.
        </p>
      </div>
      <SupervisorCalendarPanel user={user} />
    </>
  );
}

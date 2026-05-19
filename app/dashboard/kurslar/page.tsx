"use client";

import { Suspense } from "react";
import { AdminCoursesList } from "@/components/admin/AdminCoursesList";
import { useSessionUser } from "@/hooks/useSessionUser";
import { SupervisorCoursesPage } from "./SupervisorCoursesPage";

function AdminCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-clinical-muted">Yükleniyor…</div>
      }
    >
      <AdminCoursesList />
    </Suspense>
  );
}

export default function KurslarPage() {
  const user = useSessionUser();
  if (user?.role === "admin") {
    return <AdminCoursesPage />;
  }
  return <SupervisorCoursesPage />;
}

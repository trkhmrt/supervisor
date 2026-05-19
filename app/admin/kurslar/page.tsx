"use client";

import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCoursesList } from "@/components/admin/AdminCoursesList";

export default function AdminCoursesPage() {
  return (
    <AdminShell>
      <Suspense fallback={<div className="py-20 text-center text-sm text-clinical-muted">Yükleniyor…</div>}>
        <AdminCoursesList supervisorsApi="/api/admin/supervisors" />
      </Suspense>
    </AdminShell>
  );
}

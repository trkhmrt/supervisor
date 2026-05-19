"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminBlogManager } from "@/components/admin/AdminBlogManager";

export default function AdminBlogPage() {
  return (
    <AdminShell>
      <AdminBlogManager />
    </AdminShell>
  );
}

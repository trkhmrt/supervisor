"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/store";

export function CourseApplyButton({ courseId }: { courseId: string }) {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <Link href={`/giris?next=/egitimler`} className="btn-navy w-full">
        Başvurmak için giriş yapın
      </Link>
    );
  }

  if (done) {
    return (
      <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-premium px-4 py-3">
        Başvurunuz alındı. Onay sürecini panelinizden takip edebilirsiniz.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-premium px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            const res = await fetch(`/api/courses/${courseId}/apply`, {
              method: "POST",
              credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Başvuru gönderilemedi");
            setDone(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Başvuru gönderilemedi");
          } finally {
            setLoading(false);
          }
        }}
        className="btn-navy w-full disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Başvur"}
      </button>
    </div>
  );
}

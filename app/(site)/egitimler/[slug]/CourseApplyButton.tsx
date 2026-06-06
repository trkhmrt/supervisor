"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/lib/store";

export function CourseApplyButton({
  courseId,
  variant = "default",
}: {
  courseId: string;
  variant?: "default" | "onDark";
}) {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnClass = variant === "onDark" ? "btn-white" : "btn-navy";

  if (!user) {
    return (
      <Link href={`/giris?next=/egitimler`} className={`${btnClass} w-full`}>
        Başvurmak için giriş yapın
      </Link>
    );
  }

  if (done) {
    return (
      <p
        className={`rounded-premium border px-4 py-3 text-sm ${
          variant === "onDark"
            ? "border-green-400/30 bg-green-400/10 text-green-200"
            : "border-green-100 bg-green-50 text-green-700"
        }`}
      >
        Başvurunuz alındı. Onay sürecini panelinizden takip edebilirsiniz.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p
          className={`mb-3 rounded-premium border px-3 py-2 text-sm ${
            variant === "onDark"
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
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
        className={`${btnClass} w-full disabled:opacity-60`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Başvur"}
      </button>
    </div>
  );
}
